from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Loyihaning foydalanuvchi modeli. Parollar Django'ning PBKDF2 hash'i bilan saqlanadi."""

    email = models.EmailField("email", unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self) -> str:
        return self.username
