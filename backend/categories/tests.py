from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Category

User = get_user_model()


class CategoryTests(APITestCase):
    def setUp(self):
        Category.objects.create(name="Laptops")

    def test_public_list(self):
        res = self.client.get("/api/categories/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data[0]["slug"], "laptops")

    def test_only_admin_can_create(self):
        user = User.objects.create_user("u", "u@example.com", "S3cure-pass-2026")
        self.client.force_authenticate(user)
        self.assertEqual(self.client.post("/api/categories/", {"name": "Audio"}).status_code, 403)

        admin = User.objects.create_user("a", "a@example.com", "S3cure-pass-2026", is_staff=True)
        self.client.force_authenticate(admin)
        res = self.client.post("/api/categories/", {"name": "Audio"})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["slug"], "audio")
