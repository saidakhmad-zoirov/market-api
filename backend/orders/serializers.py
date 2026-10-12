from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    product_id = serializers.IntegerField(read_only=True, allow_null=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ("id", "product_id", "product_name", "price", "quantity", "subtotal", "image")

    def get_image(self, obj) -> str | None:
        if obj.product and obj.product.image:
            request = self.context.get("request")
            url = obj.product.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id", "status", "status_display", "full_name", "phone", "address", "comment",
            "total_price", "items_count", "items", "created_at", "updated_at",
        )
        read_only_fields = fields

    def get_items_count(self, obj) -> int:
        return sum(item.quantity for item in obj.items.all())


class OrderCreateSerializer(serializers.Serializer):
    """Klient faqat yetkazib berish ma'lumotlarini yuboradi. Mahsulot va narx — serverdagi savatchadan."""

    full_name = serializers.CharField(max_length=150)
    phone = serializers.RegexField(r"^\+?[0-9\s\-()]{7,20}$", max_length=20, error_messages={"invalid": "Telefon raqam noto'g'ri."})
    address = serializers.CharField(max_length=255)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
