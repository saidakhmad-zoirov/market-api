from django.db.models import IntegerField, Q, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from config.permissions import IsAdminOrReadOnly

from .filters import ProductFilter
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    Mahsulotlar.

    Filtrlar: ?search=, ?category=<slug>, ?min_price=, ?max_price=, ?in_stock=true
    Saralash: ?ordering=price | -price | -created_at | name | -sold_count
    Sahifalash: ?page=, ?page_size=
    """

    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filterset_class = ProductFilter
    search_fields = ("name", "description", "category__name")
    ordering_fields = ("price", "created_at", "name", "sold_count", "stock")
    ordering = ("-created_at",)

    def get_queryset(self):
        qs = Product.objects.select_related("category").annotate(
            sold_count=Coalesce(
                Sum("order_items__quantity", filter=~Q(order_items__order__status="cancelled")),
                Value(0),
                output_field=IntegerField(),
            )
        )
        user = self.request.user
        if not (user.is_authenticated and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs
