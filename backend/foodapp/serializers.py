from rest_framework import serializers
from .models import MenuItem, Order, User, Table

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['total', 'id', 'customer']

    def validate(self, data):
        # Only validate items if items are being updated (not for partial updates with just status)
        if 'items' in data:
            items = data.get('items', [])
            if not items:
                raise serializers.ValidationError("Items cannot be empty.")

            # Validate each item has required fields
            for item in items:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("Each item must be a dictionary.")
                if 'id' not in item:
                    raise serializers.ValidationError("Each item must have an 'id' field.")
                if 'price' not in item:
                    raise serializers.ValidationError("Each item must have a 'price' field.")
                if not isinstance(item.get('quantity', 1), int) or item.get('quantity', 1) < 1:
                    raise serializers.ValidationError("Quantity must be a positive integer.")

        status = data.get('status')
        if status and status not in dict(Order.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status choice.")
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

# For auth
class CustomerRegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=10, required=False)
    email = serializers.EmailField()

class StaffLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class CustomerVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
    email = serializers.EmailField()

class CustomerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
