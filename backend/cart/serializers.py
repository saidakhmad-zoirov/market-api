from rest_framework import serializers

from products.models import Product
from products.serializers import CategoryShortSerializer

from .models import Cart, CartItem


class CartProductSerializer(serializers.ModelSerializer):
    category = CategoryShortSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "price", "stock", "image", "category")


class CartItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "quantity", "subtotal")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total_items", "total_price", "updated_at")


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product"
    )
    quantity = serializers.IntegerField(min_value=1, max_value=999, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=999)
