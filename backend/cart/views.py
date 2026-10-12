from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import AddCartItemSerializer, CartSerializer, UpdateCartItemSerializer


def get_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def cart_response(cart: Cart, request, code=status.HTTP_200_OK) -> Response:
    cart = Cart.objects.prefetch_related("items__product__category").get(pk=cart.pk)
    return Response(CartSerializer(cart, context={"request": request}).data, status=code)


class CartView(APIView):
    """GET — joriy foydalanuvchi savatchasi. DELETE — savatchani tozalash."""

    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses=CartSerializer)
    def get(self, request):
        return cart_response(get_cart(request.user), request)

    @extend_schema(responses=CartSerializer)
    def delete(self, request):
        cart = get_cart(request.user)
        cart.items.all().delete()
        return cart_response(cart, request)


class CartItemListView(APIView):
    """POST — mahsulot qo'shish. Mavjud bo'lsa, miqdori oshiriladi."""

    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(request=AddCartItemSerializer, responses={201: CartSerializer})
    @transaction.atomic
    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        cart = get_cart(request.user)
        item = CartItem.objects.select_for_update().filter(cart=cart, product=product).first()
        new_quantity = quantity + (item.quantity if item else 0)
        if new_quantity > product.stock:
            return Response(
                {"detail": f"Omborda faqat {product.stock} dona mavjud.", "available": product.stock},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if item:
            item.quantity = new_quantity
            item.save(update_fields=["quantity"])
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)
        return cart_response(cart, request, status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """PATCH — miqdorni o'zgartirish. DELETE — mahsulotni savatchadan olib tashlash."""

    permission_classes = (permissions.IsAuthenticated,)

    def get_item(self, request, pk) -> CartItem:
        # Faqat o'z savatchasidagi elementga murojaat qilish mumkin
        return get_object_or_404(CartItem.objects.select_related("product"), pk=pk, cart__user=request.user)

    @extend_schema(request=UpdateCartItemSerializer, responses=CartSerializer)
    def patch(self, request, pk):
        item = self.get_item(request, pk)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data["quantity"]
        if quantity > item.product.stock:
            return Response(
                {"detail": f"Omborda faqat {item.product.stock} dona mavjud.", "available": item.product.stock},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return cart_response(item.cart, request)

    @extend_schema(responses=CartSerializer)
    def delete(self, request, pk):
        item = self.get_item(request, pk)
        cart = item.cart
        item.delete()
        return cart_response(cart, request)
