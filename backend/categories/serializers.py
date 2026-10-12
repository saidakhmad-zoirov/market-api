from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "product_count")
        read_only_fields = ("id",)
        extra_kwargs = {"slug": {"required": False}}
