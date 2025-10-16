from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from django.contrib.auth.models import User as DjangoUser  # Use built-in for staff, custom for customers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import MenuItem, Order, User as CustomUser, Table, OTP
from .serializers import MenuItemSerializer, OrderSerializer, UserSerializer, CustomerRegisterSerializer, StaffLoginSerializer, CustomerVerifySerializer, CustomerLoginSerializer, TableSerializer
from .utils import send_otp_email, verify_otp as verify_otp_util
from django.conf import settings
import random
import string
import secrets



@api_view(['GET'])
@permission_classes([AllowAny])
def menu_list(request):
    items = MenuItem.objects.all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_register(request):
    serializer = CustomerRegisterSerializer(data=request.data)
    if serializer.is_valid():
        phone = serializer.validated_data.get('phone')
        email = serializer.validated_data['email']

        # Check if customer exists by email (email is unique)
        customer, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={'role': 'customer', 'phone': phone, 'username': f"{email}_customer", 'is_active': True}
        )
        if not created:
            # Update existing customer
            customer.role = 'customer'
            customer.phone = phone
            customer.is_active = True
            customer.set_unusable_password()
            customer.save()
        else:
            customer.set_unusable_password()
            customer.save()

        # Send OTP via email
        success, message = send_otp_email(email)
        if success:
            return Response({'message': 'OTP sent successfully to your email'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_verify(request):
    print("Request data:", request.data)
    serializer = CustomerVerifySerializer(data=request.data)
    if serializer.is_valid():
        otp = serializer.validated_data['otp']
        email = serializer.validated_data['email']

        success, message = verify_otp_util(email, otp)
        if success:
            try:
                user = CustomUser.objects.get(email=email, role='customer')
                token = RefreshToken.for_user(user).access_token
                return Response({'message': 'Verified successfully', 'role': 'customer', 'token': str(token)}, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def staff_login(request):
    serializer = StaffLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)
        if user:
            if user.is_staff:  # Assuming admin/chef are staff users
                role = 'admin' if user.is_superuser else 'chef'
                user.role = role
                user.save()
                token = RefreshToken.for_user(user).access_token
                return Response({'message': 'Login successful', 'role': role, 'token': str(token)}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    success, message = send_otp_email(email)
    if success:
        return Response({'message': 'OTP sent successfully to your email'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    phone = request.data.get('phone')
    otp = request.data.get('otp')
    if not phone or not otp:
        return Response({'error': 'Phone and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.filter(phone=phone, role='customer').first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        email = user.email
    except Exception as e:
        return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    success, message = verify_otp_util(email, otp)
    if success:
        # Delete OTP after successful verification
        OTP.objects.filter(email=email).delete()
        token = RefreshToken.for_user(user).access_token
        return Response({'message': 'OTP verified successfully', 'token': str(token), 'role': user.role}, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    serializer = CustomerLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email, role='customer')
            user.is_active = True
            user.save()
            token = RefreshToken.for_user(user).access_token
            return Response({'message': 'Login successful', 'role': 'customer', 'token': str(token)}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Order.objects.filter(customer__phone=user.phone)
        elif user.role in ['chef', 'admin']:
            return Order.objects.all()
        return Order.objects.none()

    def perform_create(self, serializer):
        # Set customer from request.user
        customer_data = {'phone': self.request.user.phone, 'email': self.request.user.email}
        # Calculate total from items
        items = serializer.validated_data.get('items', [])
        total = sum(item['price'] * item.get('quantity', 1) for item in items)
        table_no = serializer.validated_data.get('table_no') or self.request.data.get('table_no')
        # Generate unique id
        while True:
            order_id = 'ord_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            if not Order.objects.filter(id=order_id).exists():
                break
        serializer.save(customer=customer_data, total=total, table_no=table_no, id=order_id)

class OrderUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['chef', 'admin']:
            return Order.objects.all()
        return Order.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'admin':
            # Admins can update items, table_no, and status
            if 'items' in self.request.data:
                # Recalculate total
                items = self.request.data['items']
                total = sum(item['price'] * item.get('quantity', 1) for item in items)
                serializer.save(total=total)
            else:
                serializer.save()
        elif user.role == 'chef':
            # Chefs can only update status
            if 'status' in self.request.data and len(self.request.data) == 1:
                serializer.save()
            else:
                raise PermissionDenied("Chefs can only update status.")
        else:
            raise PermissionDenied("Unauthorized to update orders.")

    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        if user.role != 'admin':
            raise PermissionDenied("Only admins can delete orders.")
        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_table(request):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can generate tables'}, status=status.HTTP_403_FORBIDDEN)

    range_input = request.data.get('range', '1')
    table_nos = []

    if '-' in range_input:
        # Range like T1-T5
        start, end = range_input.split('-')
        if start.startswith('T') and end.startswith('T'):
            try:
                start_num = int(start[1:])
                end_num = int(end[1:])
                if start_num > end_num or end_num - start_num > 50:
                    return Response({'error': 'Invalid range'}, status=status.HTTP_400_BAD_REQUEST)
                table_nos = [f'T{i}' for i in range(start_num, end_num + 1)]
            except ValueError:
                return Response({'error': 'Invalid range format'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Range must be like T1-T5'}, status=status.HTTP_400_BAD_REQUEST)
    elif range_input.startswith('T'):
        # Single table like T1
        table_nos = [range_input]
    else:
        # Number, generate that many sequential
        try:
            count = int(range_input)
            if count < 1 or count > 50:
                return Response({'error': 'Count must be between 1 and 50'}, status=status.HTTP_400_BAD_REQUEST)
            last_table = Table.objects.order_by('-id').first()
            if last_table:
                try:
                    num = int(last_table.table_no[1:]) + 1
                except ValueError:
                    num = 1
            else:
                num = 1
            table_nos = [f'T{num + i}' for i in range(count)]
        except ValueError:
            return Response({'error': 'Invalid input'}, status=status.HTTP_400_BAD_REQUEST)

    results = []
    for table_no in table_nos:
        if Table.objects.filter(table_no=table_no).exists():
            table = Table.objects.get(table_no=table_no)
            hash_value = secrets.token_hex(16)
            table.hash = hash_value
            table.save()
        else:
            hash_value = secrets.token_hex(16)
            table = Table.objects.create(table_no=table_no, hash=hash_value)

        base_url = getattr(settings, 'BASE_URL', 'http://localhost:3000')
        url = f"{base_url}/{hash_value}/{table.table_no}"

        results.append({
            'table_no': table.table_no,
            'hash': hash_value,
            'url': url
        })

    return Response(results, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_table(request):
    table_no = request.GET.get('table')
    hash_val = request.GET.get('hash')
    if not table_no or not hash_val:
        return Response({'error': 'Missing table or hash'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        table = Table.objects.get(table_no=table_no, hash=hash_val, active=True)
        return Response({'valid': True, 'table_no': table.table_no})
    except Table.DoesNotExist:
        return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_table(request, table_no):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can delete tables'}, status=status.HTTP_403_FORBIDDEN)
    try:
        table = Table.objects.get(table_no=table_no)
        table.delete()
        return Response({'message': f'Table {table_no} deleted successfully'}, status=status.HTTP_200_OK)
    except Table.DoesNotExist:
        return Response({'error': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_tables(request):
    tables = Table.objects.filter(active=True)
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_current_order(request):
    phone = request.GET.get('phone')
    if not phone:
        return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get all unpaid orders for this phone number, ordered by creation time
        orders = Order.objects.filter(customer__phone=phone).exclude(status='paid').order_by('-created_at')
        if not orders.exists():
            return Response({'error': 'No current orders found'}, status=status.HTTP_200_OK)

        # Return the most recent order for backward compatibility, but include all orders in the response
        most_recent_order = orders.first()
        serializer = OrderSerializer(most_recent_order)

        # Also include all orders in the response
        all_orders_serializer = OrderSerializer(orders, many=True)

        response_data = serializer.data
        response_data['all_orders'] = all_orders_serializer.data

        return Response(response_data)
    except Exception as e:
        return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bill_table(request):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can bill tables'}, status=status.HTTP_403_FORBIDDEN)

    table_no = request.data.get('table_no')
    if not table_no:
        return Response({'error': 'Table number is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get all unpaid orders for this table
        orders = Order.objects.filter(table_no=table_no).exclude(status='paid')
        if not orders.exists():
            return Response({'error': 'No unpaid orders found for this table'}, status=status.HTTP_404_NOT_FOUND)

        # Mark all orders as paid
        orders.update(status='paid')

        # Calculate total bill amount
        total_bill = sum(order.total for order in orders)

        return Response({
            'message': f'Table {table_no} billed successfully',
            'total_bill': total_bill,
            'orders_count': orders.count()
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
