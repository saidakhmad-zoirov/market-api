from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from categories.models import Category
from products.models import Product

from .models import Order

User = get_user_model()
SHIPPING = {"full_name": "Ali Valiyev", "phone": "+998 90 123 45 67", "address": "Toshkent, Chilonzor 1"}


class OrderTests(APITestCase):
    def setUp(self):
        cat = Category.objects.create(name="Audio")
        self.p1 = Product.objects.create(category=cat, name="Pulse", price=Decimal("100.00"), stock=5)
        self.p2 = Product.objects.create(category=cat, name="Orbit", price=Decimal("50.00"), stock=2)
        self.user = User.objects.create_user("u", "u@example.com", "S3cure-pass-2026")
        self.client.force_authenticate(self.user)

    def fill_cart(self, user=None, q1=2, q2=1):
        cart, _ = Cart.objects.get_or_create(user=user or self.user)
        CartItem.objects.create(cart=cart, product=self.p1, quantity=q1)
        CartItem.objects.create(cart=cart, product=self.p2, quantity=q2)
        return cart

    def test_create_order_calculates_on_server_and_decrements_stock(self):
        cart = self.fill_cart()
        res = self.client.post("/api/orders/", {**SHIPPING, "total_price": "1.00"}, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(Decimal(res.data["total_price"]), Decimal("250.00"))  # klient summasi e'tiborga olinmaydi
        self.p1.refresh_from_db()
        self.p2.refresh_from_db()
        self.assertEqual((self.p1.stock, self.p2.stock), (3, 1))
        self.assertEqual(cart.items.count(), 0)

    def test_empty_cart_rejected(self):
        self.assertEqual(self.client.post("/api/orders/", SHIPPING, format="json").status_code, 400)

    def test_insufficient_stock_rolls_back(self):
        cart = self.fill_cart(q1=1, q2=1)
        Product.objects.filter(pk=self.p2.pk).update(stock=0)
        res = self.client.post("/api/orders/", SHIPPING, format="json")
        self.assertEqual(res.status_code, 400)
        self.p1.refresh_from_db()
        self.assertEqual(self.p1.stock, 5)  # transaction bekor qilindi
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(cart.items.count(), 2)

    def test_user_cannot_see_others_orders(self):
        other = User.objects.create_user("o", "o@example.com", "S3cure-pass-2026")
        self.fill_cart(user=other)
        self.client.force_authenticate(other)
        order_id = self.client.post("/api/orders/", SHIPPING, format="json").data["id"]

        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(f"/api/orders/{order_id}/").status_code, 404)
        self.assertEqual(self.client.get("/api/orders/").data["count"], 0)

    def test_cancel_restores_stock(self):
        self.fill_cart()
        order_id = self.client.post("/api/orders/", SHIPPING, format="json").data["id"]
        res = self.client.post(f"/api/orders/{order_id}/cancel/")
        self.assertEqual(res.data["status"], "cancelled")
        self.p1.refresh_from_db()
        self.assertEqual(self.p1.stock, 5)
        self.assertEqual(self.client.post(f"/api/orders/{order_id}/cancel/").status_code, 400)

    def test_only_admin_changes_status(self):
        self.fill_cart()
        order_id = self.client.post("/api/orders/", SHIPPING, format="json").data["id"]
        url = f"/api/orders/{order_id}/status/"
        self.assertEqual(self.client.patch(url, {"status": "shipped"}, format="json").status_code, 403)
        admin = User.objects.create_user("a", "a@example.com", "S3cure-pass-2026", is_staff=True)
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.patch(url, {"status": "shipped"}, format="json").data["status"], "shipped")
