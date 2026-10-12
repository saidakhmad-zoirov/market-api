from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()
STRONG = "S3cure-pass-2026"


class AuthTests(APITestCase):
    def register(self, **extra):
        data = {"username": "ali", "email": "ali@example.com", "password": STRONG, "password2": STRONG, **extra}
        return self.client.post(reverse("register"), data, format="json")

    def test_register_returns_tokens_and_hashes_password(self):
        res = self.register()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        user = User.objects.get(username="ali")
        self.assertNotEqual(user.password, STRONG)
        self.assertTrue(user.check_password(STRONG))

    def test_register_rejects_mismatched_and_weak_passwords(self):
        self.assertEqual(self.register(password2="other-pass-123").status_code, 400)
        self.assertEqual(self.register(password="123", password2="123").status_code, 400)

    def test_register_rejects_duplicate_email(self):
        self.register()
        res = self.register(username="vali", email="ALI@example.com")
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.data)

    def test_login_me_and_logout(self):
        self.register()
        res = self.client.post(reverse("login"), {"username": "ali", "password": STRONG}, format="json")
        self.assertEqual(res.status_code, 200)
        access, refresh = res.data["access"], res.data["refresh"]

        self.assertEqual(self.client.get(reverse("me")).status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me = self.client.get(reverse("me"))
        self.assertEqual(me.data["username"], "ali")

        patched = self.client.patch(reverse("me"), {"first_name": "Ali", "is_staff": True}, format="json")
        self.assertEqual(patched.data["first_name"], "Ali")
        self.assertFalse(User.objects.get(username="ali").is_staff)  # is_staff o'zgartirib bo'lmaydi

        out = self.client.post(reverse("logout"), {"refresh": refresh}, format="json")
        self.assertEqual(out.status_code, 205)
        again = self.client.post(reverse("token-refresh"), {"refresh": refresh}, format="json")
        self.assertEqual(again.status_code, 401)

    def test_login_wrong_password(self):
        self.register()
        res = self.client.post(reverse("login"), {"username": "ali", "password": "wrong"}, format="json")
        self.assertEqual(res.status_code, 401)
