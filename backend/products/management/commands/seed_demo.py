"""
Ixtiyoriy: bo'sh bazani ko'rgazma uchun boshlang'ich kategoriya va mahsulotlar bilan to'ldiradi.

    python manage.py seed_demo

Ma'lumotlar haqiqiy bazaga yoziladi va frontend ularni API orqali oladi.
Rasmlarni admin panel (/admin/) orqali yuklashingiz mumkin.
Takroran ishga tushirilsa, mavjud yozuvlar dublikat qilinmaydi.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from categories.models import Category
from products.models import Product

DATA = {
    "Laptops": [
        ("Aero 14 Ultrabook", "14\" 2.8K OLED, 16 GB RAM, 1 TB SSD, 1.3 kg alyuminiy korpus.", "1249.00", 12),
        ("Forge 16 Pro", "16\" 240 Hz ekran, RTX grafika, 32 GB RAM — o'yin va 3D uchun.", "2199.00", 5),
        ("Studio 13 Air", "13\" yengil noutbuk, 18 soatlik batareya, sukut rejimi.", "899.00", 20),
    ],
    "Audio": [
        ("Pulse ANC Headphones", "Faol shovqin bekor qilish, 40 soat ishlash, USB-C tez quvvat.", "249.00", 30),
        ("Orbit TWS Earbuds", "Simsiz quloqchinlar, IPX5, multipoint ulanish.", "129.00", 45),
        ("Monolith Desk Speaker", "Ikki yo'lakli stol karnayi, Bluetooth 5.3 va AUX.", "189.00", 0),
    ],
    "Monitors": [
        ("Vista 27 4K", "27\" IPS 4K, 99% sRGB, USB-C 90 W quvvat.", "429.00", 9),
        ("Arc 34 Ultrawide", "34\" egri 3440×1440, 165 Hz, HDR400.", "599.00", 4),
    ],
    "Accessories": [
        ("Glide Mechanical Keyboard", "75% mexanik klaviatura, hot-swap, alyuminiy plastina.", "149.00", 25),
        ("Trace Wireless Mouse", "26K DPI sensor, 60 g vazn, 90 soat batareya.", "79.00", 40),
        ("Dock 11-in-1 USB-C", "2× HDMI, Ethernet, SD, 100 W PD o'tkazish.", "119.00", 15),
    ],
}


class Command(BaseCommand):
    help = "Ko'rgazma uchun kategoriya va mahsulotlar qo'shadi (ixtiyoriy)."

    @transaction.atomic
    def handle(self, *args, **options):
        created = 0
        for category_name, products in DATA.items():
            category, _ = Category.objects.get_or_create(name=category_name)
            for name, description, price, stock in products:
                _, was_created = Product.objects.get_or_create(
                    name=name,
                    defaults={
                        "category": category,
                        "description": description,
                        "price": Decimal(price),
                        "stock": stock,
                    },
                )
                created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Tayyor: {created} ta yangi mahsulot qo'shildi."))
