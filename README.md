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

Bu skript `migrations/` papkasidagi barcha `.sql` fayllarni tartib bilan ishga tushiradi va quyidagilarni bajaradi:
- `questions`, `groups`, `submissions`, `admin_users`, `settings` jadvallarini yaratadi;
- `.env.local`dagi `ADMIN_USERNAME` / `ADMIN_PASSWORD` asosida birinchi admin foydalanuvchini yaratadi (parolni bcrypt bilan hash qilib saqlaydi);
- Namuna sifatida 5 ta guruhni qo'shadi (FN-101, FE-102, FL-103, BE-201, MA-202) — kerak bo'lmasa admin panelidan o'chirib tashlashingiz mumkin;
- "Musobaqa haqida" bo'limi uchun standart matnni qo'shadi (`settings` jadvali, `competition_info` kaliti) — buni admin panel orqali istalgan vaqt tahrirlash mumkin.

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
    students/                   — Talabalar CRUD + Excel/CSV orqali ommaviy yuklash
    submissions/                — Javoblarni ko'rish va baholash
    content/                    — "Musobaqa haqida" matnini tahrirlash (rich text)
  api/                           — Barcha REST endpointlar
lib/
  db.ts                         — Postgres connection pool
  auth.ts                       — JWT admin sessiyasi
  guard.ts                      — Admin API himoyasi
  pdf.ts                        — A4 QR vizitka PDF generatori
  settings.ts                   — Sayt sozlamalari (musobaqa haqida matni) + oddiy HTML sanitizatsiya
  parseStudentsWorkbook.ts      — Talabalar Excel/CSV faylini o'qish
migrations/
  001_init.sql                  — Asosiy DB sxemasi
  002_settings.sql               — `settings` jadvali (admin tahrirlaydigan matnlar)
  003_students.sql              — `students` jadvali + `submissions.student_id`
scripts/migrate.js              — Barcha migratsiyalar + admin foydalanuvchi + namuna guruhlar + standart matn
```

## "Musobaqa haqida" bo'limi

Bosh sahifadagi scanner blokidan keyin admin tahrirlay oladigan matn bloki chiqadi. Admin panelda **Musobaqa haqida** bo'limiga kirib (`/admin/menejer/content`), matnni **qalin (bold)**, *kursiv (italic)* qilishi va havolalar qo'shishi mumkin — o'zgarishlar darhol bosh sahifada ko'rinadi. Matn `settings` jadvalida (`competition_info` kaliti) saqlanadi va serverda oddiy allow-list sanitizatsiyadan o'tadi (faqat xavfsiz teglar: `b/strong`, `i/em`, `u`, `a`, `p`, `ul/ol/li`, `br`, `span`).

## Talabalar va shaxsiy reyting

Musobaqa endi nafaqat guruhlar, balki **talabalar** o'rtasida ham boradi. Savolga javob berishda talaba avval guruhini, so'ng aynan o'zini (guruh bo'yicha filtrlangan ro'yxatdan) tanlaydi — shu orqali har bir javob muayyan talabaga bog'lanadi.

- Admin panelda **Talabalar** bo'limi (`/admin/menejer/students`): talabalarni birma-bir qo'shish (ism familiya, ID, guruh — guruh nomlar ro'yxatidan tanlanadi) yoki **"Ro'yxatni yuklash"** tugmasi orqali Excel/CSV fayl bilan ommaviy yuklash mumkin.
  - Fayl ustunlari: **1-ustun** — ism familiya, **2-ustun** — guruh nomi (mavjud guruh nomi bilan bir xil bo'lishi shart), **3-ustun** — talaba ID. Birinchi qator sarlavha deb hisoblanadi va e'tiborga olinmaydi.
  - Talaba ID bo'yicha qayta yuklansa, mavjud talaba yangilanadi (ism/guruh); guruh nomi topilmasa, o'sha qator xatolik sifatida qaytariladi (avval guruhni yarating).
- `/stats` sahifasida endi **Guruhlar** va **Talabalar** deb ikkita bo'lim (tab) bor — ikkalasida ham reyting bir xil qoidada: to'g'ri javoblar soni bo'yicha, teng bo'lsa ko'proq javob bergan ustunroq turadi (foiz faqat ma'lumot sifatida ko'rsatiladi, saralashga ta'sir qilmaydi).

## Muhim eslatmalar

- Talaba tomoni login talab qilmaydi — barcha `/api/*` (admin bo'lmagan) endpointlar ochiq, lekin savolning **to'g'ri javobi** hech qachon talaba tomoniga qaytarilmaydi (`/api/questions/[code]` faqat savol matnini beradi).
- Admin API'lari (`/api/admin/*`) cookie-based JWT sessiya bilan himoyalangan.
- **Bir guruh — bir savol — bir javob** qoidasi `submissions` jadvalidagi `UNIQUE (question_id, group_id)` cheklovi orqali ta'minlanadi.
- Guruh o'chirilganda, agar unga tegishli javoblar mavjud bo'lsa, tizim uni butunlay o'chirmasdan "nofaol" holatga o'tkazadi (tarixni saqlab qolish uchun).
- PDF: bitta savol uchun "PDF" tugmasi bosilsa, o'sha savolning kartasi 8 nusxada (bitta A4 sahifada 2×4 grid) chiqadi — bu bir xil QR kodni bir nechta joyga (turli auditoriya/koridorlarga) yopishtirish uchun qulay. "Hammasini PDF" tugmasi esa barcha faol savollarni ketma-ket, har sahifada 8 tadan joylashtirib chiqaradi.
