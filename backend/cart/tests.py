from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from categories.models import Category
from products.models import Product

User = get_user_model()


class CartTests(APITestCase):
    def setUp(self):
        cat = Category.objects.create(name="Audio")
        self.product = Product.objects.create(category=cat, name="Pulse", price=Decimal("100.50"), stock=5)
        self.user = User.objects.create_user("u", "u@example.com", "S3cure-pass-2026")
        self.client.force_authenticate(self.user)

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/cart/").status_code, 401)

    def test_add_update_remove_and_total(self):
        res = self.client.post("/api/cart/items/", {"product_id": self.product.pk, "quantity": 2}, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Decimal(res.data["total_price"]), Decimal("201.00"))

        res = self.client.post("/api/cart/items/", {"product_id": self.product.pk, "quantity": 1}, format="json")
        item_id = res.data["items"][0]["id"]
        self.assertEqual(res.data["items"][0]["quantity"], 3)

        res = self.client.patch(f"/api/cart/items/{item_id}/", {"quantity": 1}, format="json")
        self.assertEqual(Decimal(res.data["total_price"]), Decimal("100.50"))

        res = self.client.delete(f"/api/cart/items/{item_id}/")
        self.assertEqual(res.data["items"], [])

    def test_cannot_exceed_stock(self):
        res = self.client.post("/api/cart/items/", {"product_id": self.product.pk, "quantity": 6}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_cannot_touch_other_users_items(self):
        res = self.client.post("/api/cart/items/", {"product_id": self.product.pk}, format="json")
        item_id = res.data["items"][0]["id"]
        other = User.objects.create_user("o", "o@example.com", "S3cure-pass-2026")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.delete(f"/api/cart/items/{item_id}/").status_code, 404)
