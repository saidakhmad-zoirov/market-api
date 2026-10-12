# Market API — Full-Stack E-commerce

Django REST Framework + PostgreSQL backend va React + TypeScript frontend'dan iborat to'liq ishlaydigan marketplace.
Mahsulotlar, kategoriyalar, savatcha, buyurtmalar va JWT autentifikatsiya — hammasi real API orqali.

| Qatlam   | Texnologiyalar |
|----------|----------------|
| Backend  | Python 3.11+, Django 5.2, DRF, SimpleJWT (blacklist), django-filter, drf-spectacular (Swagger), PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Axios, React Router |
| Testlar  | pytest + pytest-django (DRF `APITestCase`) |

---

## Imkoniyatlar

**Foydalanuvchi uchun**
- Bosh sahifa: hero, mahsulot qidiruvi, kategoriyalar, real statistika, "eng ko'p sotilganlar" (faqat haqiqiy savdo bo'lsa ko'rinadi), yangi mahsulotlar
- Katalog: qidiruv, kategoriya filtri, narx oralig'i, "faqat omborda borlari", narx/yangilik/ommaboplik bo'yicha saralash, sahifalash — barcha filtrlar URL'da saqlanadi (havolani ulashish mumkin)
- Mahsulot sahifasi: rasm, tavsif, narx, ombor qoldig'i, savatchaga qo'shish, shu kategoriyadagi boshqa mahsulotlar
- Savatcha (serverda saqlanadi): miqdorni o'zgartirish, o'chirish, tozalash, server hisoblagan jami summa
- Buyurtma berish, buyurtmalar tarixi, buyurtma tafsilotlari va holat bosqichlari, kutilayotgan buyurtmani bekor qilish
- Ro'yxatdan o'tish, login/logout, profilni tahrirlash, parolni o'zgartirish, himoyalangan sahifalar
- Qorong'i va yorug' mavzu, mobil/planshet/desktop uchun moslashuvchan dizayn

**Xavfsizlik**
- Parollar Django'ning standart hash mexanizmi bilan saqlanadi, parol validatorlari yoqilgan
- JWT: qisqa muddatli access + refresh, refresh rotatsiyasi va logout'da qora ro'yxat (blacklist)
- Frontend access token tugasa avtomatik yangilaydi (bitta so'rov, navbat bilan)
- Narx va buyurtma summasi **faqat serverda** hisoblanadi — klient yuborgan narx e'tiborga olinmaydi
- Buyurtma `transaction.atomic` + `select_for_update` ichida yaratiladi: ombor yetmasa butun amal bekor qilinadi
- Foydalanuvchi faqat o'z savatchasi va buyurtmalarini ko'radi (boshqasiniki — 404)
- Mahsulot/kategoriya yaratish-o'zgartirish va buyurtma statusini o'zgartirish — faqat admin (`is_staff`)
- CORS faqat `.env`dagi frontend manzillariga ruxsat beradi; login/register uchun rate-limit
- Maxfiy ma'lumotlar `.env`da, `.env` git'ga tushmaydi (`.env.example` beriladi)

---

## Papka tuzilishi

```
market-api/
├── backend/
│   ├── config/          # settings, urls, pagination, umumiy permission
│   ├── accounts/        # User modeli, register/login/logout/me, parol almashtirish
│   ├── categories/      # Category modeli va API
│   ├── products/        # Product modeli, filtrlar, seed_demo buyrug'i
│   ├── cart/            # Cart, CartItem
│   ├── orders/          # Order, OrderItem, services.py (transaction mantiqi)
│   ├── manage.py
│   ├── requirements.txt
│   ├── pytest.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # layout, ui, product, canvas (jonli fonlar)
│   │   ├── context/     # Auth, Cart, Toast, Theme provider'lari
│   │   ├── hooks/       # useAuth, useCart, useAsync, useDebounce, useReveal ...
│   │   ├── pages/       # Home, Products, ProductDetail, Cart, Orders, Login ...
│   │   ├── services/    # axios instance + API servislari
│   │   ├── types/       # backend serializer'lariga mos TypeScript tiplar
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

> **Nega buyurtma mantiqi `orders/services.py`da?** View'lar faqat HTTP bilan ishlaydi, biznes-mantiq (ombor, narx, transaction) alohida
> funksiyada — uni test qilish va qayta ishlatish oson. `categories` alohida app qilib ajratilgan, chunki u mahsulotlardan mustaqil
> CRUD resursi.

---

## API endpointlari

Asosiy manzil: `http://127.0.0.1:8000/api/` · Swagger: **`/api/docs/`** · ReDoc: `/api/redoc/` · Admin: `/admin/`

| Metod | Endpoint | Ruxsat | Tavsif |
|-------|----------|--------|--------|
| POST | `auth/register/` | hamma | Ro'yxatdan o'tish → `user`, `access`, `refresh` |
| POST | `auth/login/` | hamma | `username`, `password` → `access`, `refresh` |
| POST | `auth/refresh/` | hamma | Yangi access (va yangi refresh) |
| POST | `auth/logout/` | login | Refresh tokenni qora ro'yxatga qo'shish |
| GET, PATCH | `auth/me/` | login | Profil |
| POST | `auth/change-password/` | login | Parolni almashtirish |
| GET | `categories/` | hamma | Kategoriyalar (`product_count` bilan) |
| POST, PUT, PATCH, DELETE | `categories/{slug}/` | admin | Kategoriya CRUD |
| GET | `products/` | hamma | Ro'yxat, sahifalangan. `?search=` `?category=<slug>` `?min_price=` `?max_price=` `?in_stock=true` `?ordering=price\|-price\|-created_at\|name\|-sold_count` `?page=` `?page_size=` |
| GET | `products/{id}/` | hamma | Mahsulot |
| POST, PUT, PATCH, DELETE | `products/`, `products/{id}/` | admin | Mahsulot CRUD (rasm uchun multipart) |
| GET, DELETE | `cart/` | login | Savatcha / tozalash |
| POST | `cart/items/` | login | `{product_id, quantity}` qo'shish |
| PATCH, DELETE | `cart/items/{id}/` | login | Miqdorni o'zgartirish / o'chirish |
| GET, POST | `orders/` | login | Mening buyurtmalarim / savatchadan buyurtma yaratish |
| GET | `orders/{id}/` | egasi yoki admin | Buyurtma tafsilotlari |
| POST | `orders/{id}/cancel/` | egasi | `pending` buyurtmani bekor qilish (ombor qaytariladi) |
| PATCH | `orders/{id}/status/` | admin | Statusni o'zgartirish |

---

## Ishga tushirish (Windows PowerShell)

Kerak bo'ladi: **Python 3.11+**, **Node.js 20+**, **PostgreSQL 14+**.

### 1. PostgreSQL bazasini yaratish

```powershell
psql -U postgres
```
```sql
CREATE DATABASE market_db;
-- testlar uchun foydalanuvchiga test bazasini yaratish huquqi kerak (postgres superuser'da bor)
\q
```

### 2. Backend (1-terminal)

```powershell
cd market-api\backend

# virtual muhit
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Agar "running scripts is disabled" xatosi chiqsa (bir marta):
# Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# paketlar
pip install -r requirements.txt

# .env fayli
Copy-Item .env.example .env
# .env ichida POSTGRES_PASSWORD va DJANGO_SECRET_KEY ni o'zgartiring.
# Maxfiy kalit yaratish:
python -c "import secrets; print(secrets.token_urlsafe(50))"

# migratsiyalar
python manage.py makemigrations accounts categories products cart orders
python manage.py migrate

# admin foydalanuvchi
python manage.py createsuperuser

# (ixtiyoriy) ko'rgazma uchun kategoriya va mahsulotlar
python manage.py seed_demo

# server
python manage.py runserver
```

Backend: <http://127.0.0.1:8000/api/> · Swagger: <http://127.0.0.1:8000/api/docs/> · Admin: <http://127.0.0.1:8000/admin/>

Mahsulot rasmlarini admin panel orqali yuklang — ular `backend/media/` papkasida saqlanadi va frontendda avtomatik ko'rinadi.
Rasm bo'lmasa, frontend mahsulot nomidan yasalgan monogram ko'rsatadi (soxta rasm qo'yilmaydi).

### 3. Frontend (2-terminal)

```powershell
cd market-api\frontend
Copy-Item .env.example .env      # VITE_API_URL=http://127.0.0.1:8000/api/
npm install
npm run dev
```

Frontend: <http://127.0.0.1:5173>

### 4. Testlar

```powershell
# backend (venv yoqilgan holda, backend papkasida)
pytest
# yoki
python manage.py test

# frontend: TypeScript tekshiruvi va production build
cd ..\frontend
npm run typecheck
npm run build
```

---

## CORS haqida

Frontend (`127.0.0.1:5173`) va backend (`127.0.0.1:8000`) turli **origin** — brauzer boshqa origin'ga so'rovni faqat server
ruxsat bersa yuboradi. Ruxsat `django-cors-headers` orqali beriladi:

```python
# config/settings.py
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", ...]   # CommonMiddleware'dan oldin
CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]  # .env dan o'qiladi
```

Agar konsolda `blocked by CORS policy` chiqsa: brauzerdagi manzil (`localhost` yoki `127.0.0.1`) `.env`dagi
`CORS_ALLOWED_ORIGINS` ro'yxatida borligini tekshiring va backendni qayta ishga tushiring. `CORS_ALLOW_ALL_ORIGINS = True` ishlatmang.

---

## Arxitektura qarorlari

- **Savatcha serverda** saqlanadi (localStorage'da emas) — foydalanuvchi boshqa qurilmadan kirsa ham savatchasi saqlanadi va narx/ombor har doim to'g'ri.
- **`OrderItem` mahsulot nomi va narxini nusxalaydi** — mahsulot keyin o'zgarsa yoki o'chirilsa ham buyurtma tarixi to'g'ri qoladi.
- **`sold_count`** bekor qilinmagan buyurtmalardan hisoblanadi va "Ommabop" saralash shunga asoslanadi.
- **JWT localStorage'da** — portfolio loyiha uchun sodda yondashuv. Production'da httpOnly cookie + CSRF himoyasi xavfsizroq.
