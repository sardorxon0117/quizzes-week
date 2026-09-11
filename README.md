# Quizzes Week — PDP University

Talabalar o'rtasidagi QR-kod asosidagi interaktiv viktorina platformasi.

## Texnologiyalar

- **Next.js 14** (App Router, TypeScript) — frontend + backend (API routes) bir loyihada
- **PostgreSQL (Neon)** — ma'lumotlar bazasi (`pg` kutubxonasi orqali)
- **TailwindCSS** — UI (brend ranglar: primary `rgb(0,175,166)`, secondary `rgb(255,199,0)`, border-radius yo'q)
- **html5-qrcode** — talaba tomonida kamera orqali QR skanerlash
- **qrcode** — QR-kod generatsiyasi (admin panelda va PDF ichida)
- **pdf-lib** — A4 formatdagi QR vizitka kartalarini generatsiya qilish (2×4 = 8 ta card/sahifa)
- **jsonwebtoken + bcryptjs** — admin autentifikatsiyasi (httpOnly cookie sessiyasi)

## Loyihani ishga tushirish

### 1. Bog'liqliklarni o'rnatish

```bash
npm install
```

### 2. Muhit o'zgaruvchilari

`.env.local` fayli allaqachon quyidagilar bilan tayyorlangan (Neon DB connection string siz bergan):

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=QuizzesWeek2026!
NEXT_PUBLIC_BASE_URL=https://quizzes-week.tayyorr.uz
```

> ⚠️ **Muhim:** `.env.local` fayli git'ga qo'shilmaydi (`.gitignore`da). Production'da bu qiymatlarni hosting platformangiz (Vercel va h.k.) "Environment Variables" bo'limida alohida kiritishingiz kerak — ayniqsa `ADMIN_PASSWORD` va `JWT_SECRET`ni ishonchli qiymatlarga almashtiring.

### 3. Ma'lumotlar bazasini yaratish (migratsiya)

**MUHIM:** Bu amalni siz o'zingizning kompyuteringizdan yoki Neon DB'ga tarmoq orqali chiqa oladigan muhitdan ishga tushirishingiz kerak — bu suhbat ishlayotgan sandbox muhitidan Neon serveriga tarmoq ulanishi cheklangan, shu sababli migratsiyani mendan bevosita ishga tushira olmadim.

```bash
npm run migrate
```

Bu skript quyidagilarni bajaradi:
- `questions`, `groups`, `submissions`, `admin_users` jadvallarini yaratadi;
- `.env.local`dagi `ADMIN_USERNAME` / `ADMIN_PASSWORD` asosida birinchi admin foydalanuvchini yaratadi (parolni bcrypt bilan hash qilib saqlaydi);
- Namuna sifatida 5 ta guruhni qo'shadi (FN-101, FE-102, FL-103, BE-201, MA-202) — kerak bo'lmasa admin panelidan o'chirib tashlashingiz mumkin.

Muqobil variant: Neon konsolidagi **SQL Editor**ga kirib, `migrations/001_init.sql` faylining tarkibini qo'lda ishga tushirishingiz mumkin (keyin admin foydalanuvchini alohida qo'shish kerak bo'ladi — buning uchun `npm run migrate`ni faqat shu qadam uchun ham ishlatishingiz mumkin).

### 4. Loyihani ishga tushirish

```bash
npm run dev
```

Talaba paneli: http://localhost:3000
Admin paneli: http://localhost:3000/admin/menejer (login: `.env.local`dagi `ADMIN_USERNAME` / `ADMIN_PASSWORD`)

## Deploy qilish (tavsiya: Vercel)

1. Loyihani GitHub'ga push qiling.
2. Vercel'da yangi loyiha yarating, repository'ni bog'lang.
3. Environment Variables bo'limiga `.env.local`dagi barcha qiymatlarni kiriting (production uchun `JWT_SECRET` va `ADMIN_PASSWORD`ni yangilang).
4. Domenni `quizzes-week.tayyorr.uz` ga bog'lang (Vercel loyihasi sozlamalarida "Domains").
5. Deploy tugagach, `npm run migrate` skriptini production `DATABASE_URL` bilan bir marta lokal terminalingizdan ishga tushiring (bazani tayyorlash uchun).

## Loyiha tuzilishi

```
app/
  page.tsx                     — Talaba bosh sahifasi (QR scanner + 6 xonali kod)
  q/[code]/page.tsx            — Savol sahifasi
  stats/page.tsx                — Guruhlar reytingi
  admin/menejer/page.tsx        — Admin login
  admin/menejer/(app)/          — Admin panel (auth talab qiladi)
    dashboard/                  — Statistik kartalar
    questions/                  — Savollar CRUD + QR + PDF
    groups/                     — Guruhlar CRUD
    submissions/                — Javoblarni ko'rish va baholash
  api/                           — Barcha REST endpointlar
lib/
  db.ts                         — Postgres connection pool
  auth.ts                       — JWT admin sessiyasi
  guard.ts                      — Admin API himoyasi
  pdf.ts                        — A4 QR vizitka PDF generatori
migrations/001_init.sql         — DB sxemasi
scripts/migrate.js              — Migratsiya + admin foydalanuvchi + namuna guruhlar
```

## Muhim eslatmalar

- Talaba tomoni login talab qilmaydi — barcha `/api/*` (admin bo'lmagan) endpointlar ochiq, lekin savolning **to'g'ri javobi** hech qachon talaba tomoniga qaytarilmaydi (`/api/questions/[code]` faqat savol matnini beradi).
- Admin API'lari (`/api/admin/*`) cookie-based JWT sessiya bilan himoyalangan.
- **Bir guruh — bir savol — bir javob** qoidasi `submissions` jadvalidagi `UNIQUE (question_id, group_id)` cheklovi orqali ta'minlanadi.
- Guruh o'chirilganda, agar unga tegishli javoblar mavjud bo'lsa, tizim uni butunlay o'chirmasdan "nofaol" holatga o'tkazadi (tarixni saqlab qolish uchun).
- PDF: bitta savol uchun "PDF" tugmasi bosilsa, o'sha savolning kartasi 8 nusxada (bitta A4 sahifada 2×4 grid) chiqadi — bu bir xil QR kodni bir nechta joyga (turli auditoriya/koridorlarga) yopishtirish uchun qulay. "Hammasini PDF" tugmasi esa barcha faol savollarni ketma-ket, har sahifada 8 tadan joylashtirib chiqaradi.
