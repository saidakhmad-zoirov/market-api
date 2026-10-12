from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_price(self) -> Decimal:
        return sum((item.subtotal for item in self.items.all()), Decimal("0.00"))

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items.all())

    def __str__(self) -> str:
        return f"Cart of {self.user}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("added_at",)
        constraints = [models.UniqueConstraint(fields=["cart", "product"], name="unique_product_per_cart")]

    @property
    def subtotal(self) -> Decimal:
        # Narx har doim bazadagi joriy narxdan olinadi — klientdan kelgan narxga ishonilmaydi
        return self.product.price * self.quantity

    def __str__(self) -> str:
        return f"{self.quantity} × {self.product}"
