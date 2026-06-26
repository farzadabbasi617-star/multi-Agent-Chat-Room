# چت روم Arena - نسخه واقعی (Neon + Render)

چت روم کاملاً واقعی و چندنفره با ذخیره‌سازی دائمی در **Neon Postgres** و استقرار روی **Render**.

## ویژگی‌های فعلی

- ارسال پیام واقعی (Real-time) با Socket.io
- ذخیره دائمی پیام‌ها در Neon Postgres
- نمایش کاربران آنلاین
- اندیکاتور تایپ کردن
- چندین اتاق چت
- ساخت اتاق جدید
- کاملاً آماده استقرار روی اینترنت

---

## نحوه استقرار روی اینترنت (Render + Neon)

**کل فرآیند حدود ۱۵–۲۰ دقیقه طول می‌کشد.**

### گام ۱: ساخت دیتابیس در Neon (رایگان)

1. برو به [neon.tech](https://neon.tech) و ثبت‌نام کن.
2. یک پروژه جدید بساز.
3. در داشبورد پروژه، **Connection String** را کپی کن (رشته‌ای که با `postgresql://` شروع می‌شود).

### گام ۲: آپلود پروژه در GitHub

پوشه `chat-app` را در یک مخزن GitHub آپلود کن.

### گام ۳: استقرار بک‌اند روی Render

1. به [render.com](https://render.com) برو و New Web Service بساز.
2. مخزن GitHub خودت را انتخاب کن.
3. این تنظیمات را اعمال کن:

   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. در بخش Environment Variables این متغیر را اضافه کن:

   - `DATABASE_URL` = (رشته‌ای که از Neon کپی کردی)

5. Deploy کن. بعد از آماده شدن، آدرس بک‌اند (مثلاً `https://arena-chat-backend.onrender.com`) را کپی کن.

### گام ۴: به‌روزرسانی آدرس سرور در فرانت‌اند

فایل `chat-app/js/socket-client.js` را باز کن و این خط را پیدا کن:

```js
const PRODUCTION_SERVER = 'https://YOUR-RENDER-APP-NAME.onrender.com';
```

آدرس واقعی بک‌اند Render خودت را جایگزین کن.

### گام ۵: استقرار فرانت‌اند

**بهترین و ساده‌ترین راه:** Vercel

1. به [vercel.com](https://vercel.com) برو.
2. New Project → مخزن GitHub را انتخاب کن.
3. **Root Directory** را روی `chat-app` بگذار.
4. Deploy کن.

بعد از اتمام، آدرس فرانت‌اند را باز کن.

---

## اجرای محلی (برای تست)

### ۱. بک‌اند

```bash
cd backend
npm install
# فایل .env را بساز و DATABASE_URL را از Neon بگذار
npm run dev
```

### ۲. فرانت‌اند

```bash
cd ..
npx serve .
```

---

## ساختار پروژه

```
chat-app/
├── backend/
│   ├── server.js          ← سرور اصلی + Socket.io + Neon
│   ├── db.js              ← اتصال به Neon Postgres
│   ├── package.json
│   ├── render.yaml
│   └── Procfile
├── js/
│   ├── socket-client.js   ← اتصال فرانت‌اند به سرور
│   └── ...
├── index.html
└── DEPLOY.md              ← راهنمای کامل استقرار
```

---

## نکات مهم

- پیام‌ها برای همیشه در Neon ذخیره می‌شوند.
- Render در پلن رایگان ممکن است بعد از مدتی بخوابد (۳۰–۵۰ ثانیه طول می‌کشد تا بیدار شود).
- برای جلوگیری از خوابیدن می‌توانید از سرویس‌هایی مثل UptimeRobot استفاده کنید.

---

**حالا برو فایل `DEPLOY.md` را بخوان** و قدم به قدم پیش برو.

اگر جایی گیر کردی، بگو تا کمک کنم.