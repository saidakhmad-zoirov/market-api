from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from categories.models import Category

from .models import Product

User = get_user_model()


class ProductTests(APITestCase):
    def setUp(self):
        self.laptops = Category.objects.create(name="Laptops")
        self.audio = Category.objects.create(name="Audio")
        Product.objects.create(category=self.laptops, name="Aero 14", price=Decimal("1200"), stock=3)
        Product.objects.create(category=self.laptops, name="Forge 16", price=Decimal("2200"), stock=0)
        Product.objects.create(category=self.audio, name="Pulse ANC", price=Decimal("250"), stock=10)
        Product.objects.create(category=self.audio, name="Hidden", price=Decimal("10"), stock=1, is_active=False)

    def names(self, res):
        return [p["name"] for p in res.data["results"]]

    def test_list_is_paginated_and_hides_inactive(self):
        res = self.client.get("/api/products/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["count"], 3)
        self.assertNotIn("Hidden", self.names(res))

    def test_search_filter_ordering(self):
        self.assertEqual(self.names(self.client.get("/api/products/?search=pulse")), ["Pulse ANC"])
        self.assertEqual(len(self.client.get("/api/products/?category=laptops").data["results"]), 2)
        self.assertEqual(
            self.names(self.client.get("/api/products/?ordering=price")), ["Pulse ANC", "Aero 14", "Forge 16"]
        )
        self.assertEqual(self.names(self.client.get("/api/products/?min_price=1000&max_price=1500")), ["Aero 14"])
        self.assertEqual(len(self.client.get("/api/products/?in_stock=true").data["results"]), 2)

    def test_detail(self):
        product = Product.objects.get(name="Aero 14")
        res = self.client.get(f"/api/products/{product.pk}/")
        self.assertEqual(res.data["stock"], 3)
        self.assertEqual(res.data["category"]["slug"], "laptops")
        self.assertTrue(res.data["in_stock"])

    def test_write_requires_admin(self):
        payload = {"name": "New", "price": "99.00", "stock": 1, "category_id": self.audio.pk}
        self.assertEqual(self.client.post("/api/products/", payload).status_code, 401)
        user = User.objects.create_user("u", "u@example.com", "S3cure-pass-2026")
        self.client.force_authenticate(user)
        self.assertEqual(self.client.post("/api/products/", payload).status_code, 403)
        admin = User.objects.create_user("a", "a@example.com", "S3cure-pass-2026", is_staff=True)
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post("/api/products/", payload).status_code, 201)
