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
        items = data.get('items', [])
        if not items:
            raise serializers.ValidationError("Items cannot be empty.")

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
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField()

class StaffLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class CustomerVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
    phone = serializers.CharField(max_length=15)

class CustomerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
