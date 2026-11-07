# Young Adults CRM — Frontend

O'quv markaz CRM tizimining veb-interfeysi: **React 18 + TypeScript + Vite + MUI + Tailwind**.
Hozircha backend yo'q — ma'lumotlar brauzer ichidagi demo bazadan olinadi (pastga qarang).

## Ishga tushirish

```bash
npm install
npm run dev              # http://localhost:5173
```

**Backend kerak emas.** Hozircha ma'lumotlar brauzer ichidagi demo bazada (`localStorage`) saqlanadi
(`src/api/mock/`). Sahifani yangilasangiz ham o'zgarishlar saqlanib qoladi.

**Kirish:** telefon `91 517 97 74`, parol `1111` (login sahifasida oldindan to'ldirilgan).
Demo o'qituvchi: `93 986 66 76` / `1111`.

Demo ma'lumotlarni boshidan boshlash uchun brauzer konsolida: `localStorage.clear()` va sahifani yangilang.

## Tema va til

- **Dark / light rejim:** yuqori paneldagi 🌙/☀️ tugmasi. Tanlov saqlanadi; birinchi marta qurilma sozlamasiga qarab tanlanadi.
- **Til (UZ / RU / EN):** yuqori paneldagi til tugmasi (login sahifasida ham bor). Standart til — o'zbekcha.
- Tarjimalar `src/i18n/dict/*.ts` fayllarida `[English, O'zbekcha, Русский]` ko'rinishida. Yangi matn qo'shilganda shu yerga bitta qator
  qo'shish kifoya — ilova matnni avtomatik tarjima qiladi. Lug'atda yo'q matnlar (ismlar, kurs nomlari kabi ma'lumotlar) o'zgarishsiz qoladi.
- Ranglar `src/index.css` dagi CSS o'zgaruvchilarda (`--surface`, `--ink`, `--primary` ...). Yangi komponentlarda qattiq hex o'rniga
  shularni ishlating, shunda dark rejim avtomatik ishlaydi.

## Backend ulanganda

Backend tayyor bo'lgach `.env` faylida `VITE_API_URL=https://api.sizning-domen.uz/api` yozing —
ilova avtomatik haqiqiy serverga o'tadi (sahifa kodlari o'zgarmaydi).

## Build

```bash
npm run build            # natija: dist/
```

SPA bo'lgani uchun hostingda barcha yo'llar `index.html` ga yo'naltirilishi kerak
(nginx: `location / { try_files $uri /index.html; }`; Netlify uchun `public/_redirects` tayyor).

## Tuzilma

- `src/api/` — API klienti, turlar va resurs funksiyalari; `src/api/mock/` — demo ma'lumotlar bazasi
- `src/Context/` — Auth (kirish/chiqish), Data (guruh/o'qituvchi/o'quvchilar), Branch, Toast
- `src/layouts/` — Header, Sidebar, umumiy qobiq
- `src/pages/` — sahifalar
- `src/theme.ts`, `src/index.css` — dizayn tokenlari (ranglar, radius, soyalar), dark/light
- `src/i18n/` — 3 tilli tarjima (lug'at + tarjimon)
- `src/components/RightDrawer/` — o'ngdan chiqadigan umumiy panel

## Eslatma

Ayrim sahifalar faqat interfeys sifatida ishlaydi (ma'lumot saqlanmaydi): Settings → SMS/VoIP/Forms/Blog/Tags/Billing/Roadmap/Archive/Holidays,
Reports → Conversion/Attendance/Students-left/Logs, Finance → Salaries.
