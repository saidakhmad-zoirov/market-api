from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order
from .permissions import IsOwnerOrAdmin
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusSerializer
from .services import cancel_order, create_order_from_cart


class OrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    GET  /api/orders/              — o'z buyurtmalarim (admin — barchasi)
    POST /api/orders/              — savatchadan buyurtma yaratish
    GET  /api/orders/{id}/         — buyurtma tafsilotlari
    POST /api/orders/{id}/cancel/  — kutilayotgan buyurtmani bekor qilish
    PATCH /api/orders/{id}/status/ — statusni o'zgartirish (faqat admin)
    """

    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)
    filterset_fields = ("status",)
    ordering_fields = ("created_at", "total_price")
    search_fields = ()

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items__product")
        if self.request.user.is_staff:
            return qs
        # Oddiy foydalanuvchi faqat o'z buyurtmalarini ko'radi (boshqasiniki 404 qaytaradi)
        return qs.filter(user=self.request.user)

    @extend_schema(request=OrderCreateSerializer, responses={201: OrderSerializer})
    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = create_order_from_cart(request.user, **serializer.validated_data)
        order = self.get_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=None, responses=OrderSerializer)
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        cancel_order(order)
        order = self.get_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order, context={"request": request}).data)

    @extend_schema(request=OrderStatusSerializer, responses=OrderSerializer)
    @action(detail=True, methods=["patch"], url_path="status", permission_classes=[permissions.IsAdminUser])
    def set_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order, context={"request": request}).data)
