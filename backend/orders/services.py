from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from cart.models import Cart
from products.models import Product

from .models import Order, OrderItem


@transaction.atomic
def create_order_from_cart(user, *, full_name: str, phone: str, address: str, comment: str = "") -> Order:
    """
    Savatchadan buyurtma yaratadi — hammasi bitta transaction ichida:
    1. Mahsulot qatorlari bloklanadi (select_for_update) — bir vaqtdagi buyurtmalar omborni buzolmaydi.
    2. Ombor tekshiriladi, yetmasa — butun amal bekor qilinadi.
    3. Narx va umumiy summa faqat server tomonda, bazadagi narxdan hisoblanadi.
    4. Ombor kamaytiriladi, savatcha tozalanadi.
    """
    cart = Cart.objects.filter(user=user).first()
    items = list(cart.items.select_related("product").order_by("product_id")) if cart else []
    if not items:
        raise ValidationError({"detail": "Savatcha bo'sh."})

    product_ids = [item.product_id for item in items]
    products = {p.pk: p for p in Product.objects.select_for_update().filter(pk__in=product_ids).order_by("pk")}

    errors = []
    for item in items:
        product = products.get(item.product_id)
        if product is None or not product.is_active:
            errors.append(f"'{item.product.name}' endi sotuvda emas.")
        elif item.quantity > product.stock:
            errors.append(f"'{product.name}': omborda faqat {product.stock} dona bor.")
    if errors:
        raise ValidationError({"detail": " ".join(errors), "errors": errors})

    total = sum((products[i.product_id].price * i.quantity for i in items), Decimal("0.00"))
    order = Order.objects.create(
        user=user, full_name=full_name, phone=phone, address=address, comment=comment, total_price=total
    )
    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product=products[i.product_id],
                product_name=products[i.product_id].name,
                price=products[i.product_id].price,
                quantity=i.quantity,
            )
            for i in items
        ]
    )
    for item in items:
        product = products[item.product_id]
        product.stock -= item.quantity
        product.save(update_fields=["stock", "updated_at"])

    cart.items.all().delete()
    return order


@transaction.atomic
def cancel_order(order: Order) -> Order:
    """Faqat 'pending' buyurtmani bekor qiladi va mahsulotlarni omborga qaytaradi."""
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.PENDING:
        raise ValidationError({"detail": "Faqat kutilayotgan (pending) buyurtmani bekor qilish mumkin."})
    for item in order.items.select_related("product"):
        if item.product_id:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            product.stock += item.quantity
            product.save(update_fields=["stock", "updated_at"])
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return order
