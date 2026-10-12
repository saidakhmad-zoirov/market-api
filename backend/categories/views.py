from django.db.models import Count, Q
from rest_framework import viewsets

from config.permissions import IsAdminOrReadOnly

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """Kategoriyalar: o'qish hamma uchun, CRUD faqat admin uchun. URL'da slug ishlatiladi."""

    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    lookup_field = "slug"
    pagination_class = None  # kategoriyalar soni kam — bitta ro'yxat
    search_fields = ("name",)
    ordering_fields = ("name", "product_count")

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        ).order_by("name")
