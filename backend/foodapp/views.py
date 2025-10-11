from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User as DjangoUser  # Use built-in for staff, custom for customers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import MenuItem, Order, User as CustomUser, Table
from .serializers import MenuItemSerializer, OrderSerializer, UserSerializer, CustomerRegisterSerializer, StaffLoginSerializer, CustomerVerifySerializer, CustomerLoginSerializer, TableSerializer
from .utils import send_otp_email, verify_otp
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

        # Check if customer exists
        customer, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={'role': 'customer', 'phone': phone, 'username': f"{email}_customer"}
        )
        if not created:
            customer.role = 'customer'
            customer.phone = phone
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
        phone = serializer.validated_data['phone']

        try:
            user = CustomUser.objects.get(phone=phone, role='customer')
            email = user.email
        except CustomUser.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        success, message = verify_otp(email, otp)
        if success:
            return Response({'message': 'Verified successfully', 'role': 'customer'}, status=status.HTTP_200_OK)
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
                token = RefreshToken.for_user(user).access_token
                return Response({'message': 'Login successful', 'role': role, 'token': str(token)}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    serializer = CustomerLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email, role='customer')
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
        total = sum(item['price'] * item['qty'] for item in items)
        table_no = serializer.validated_data.get('table_no') or self.request.data.get('table_no')
        serializer.save(customer=customer_data, total=total, table_no=table_no, id='ord_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)))

class OrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['chef', 'admin']:
            return Order.objects.all()
        return Order.objects.none()

    def perform_update(self, serializer):
        # Only allow status updates
        if 'status' in self.request.data:
            serializer.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_table(request):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can generate tables'}, status=status.HTTP_403_FORBIDDEN)

    table_no = request.data.get('table_no')
    if table_no:
        # Check if table already exists
        if Table.objects.filter(table_no=table_no).exists():
            return Response({'error': f'Table {table_no} already exists'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Get the next table number
        last_table = Table.objects.order_by('-id').first()
        if last_table:
            # Extract number from 'T1' -> 1
            try:
                num = int(last_table.table_no[1:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        table_no = f'T{num}'

    # Generate unique hash
    hash_value = secrets.token_hex(16)

    # Create table
    table = Table.objects.create(table_no=table_no, hash=hash_value)

    # Generate URL (use localhost for dev, in prod use env)
    base_url = getattr(settings, 'BASE_URL', 'http://localhost:3000')
    url = f"{base_url}/scan?table={table_no}&hash={hash_value}"

    return Response({
        'table_no': table_no,
        'hash': hash_value,
        'url': url
    }, status=status.HTTP_201_CREATED)

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
