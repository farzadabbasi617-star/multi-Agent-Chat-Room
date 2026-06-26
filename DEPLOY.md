# 🚀 راهنمای کامل استقرار (بدون نیاز به ترمینال)

این پروژه آماده است تا روی **Render + Neon** قرار بگیرد.

---

## مرحله ۱: ساخت بک‌اند روی Render (مهم‌ترین بخش)

1. برو به [render.com](https://render.com) و لاگین کن (با GitHub).
2. روی **New +** → **Web Service** کلیک کن.
3. مخزن `multi-Agent-Chat-Room` را انتخاب کن.
4. تنظیمات زیر را دقیق وارد کن:

| فیلد                | مقدار وارد کن                     |
|---------------------|-----------------------------------|
| **Name**            | `arena-chat-backend`              |
| **Region**          | Oregon (یا نزدیک‌ترین)            |
| **Root Directory**  | `backend`                         |
| **Build Command**   | `npm install`                     |
| **Start Command**   | `npm start`                       |
| **Plan**            | Free                              |

5. پایین صفحه **Environment Variables** را باز کن و این متغیر را اضافه کن:

   - **Key**: `DATABASE_URL`
   - **Value**: رشته کامل اتصال Neon تو (همون که قبلاً داشتی)

6. روی **Create Web Service** کلیک کن.

بعد از اینکه ساخت تمام شد، یک آدرس مثل این بهت می‌دهد:
**`https://arena-chat-backend-xxxx.onrender.com`**

این آدرس را کپی کن.

---

## مرحله ۲: به‌روزرسانی فرانت‌اند (اتصال به سرور واقعی)

1. در ریپازیتوری GitHub برو به فایل:
   `js/socket-client.js`

2. این خط را پیدا کن:
   ```js
   const PRODUCTION_SERVER = 'https://YOUR-RENDER-BACKEND-URL.onrender.com';
   ```

3. آدرس واقعی که از Render گرفتی را جایگزین کن. مثلاً:
   ```js
   const PRODUCTION_SERVER = 'https://arena-chat-backend-abc123.onrender.com';
   ```

4. فایل را **Commit** کن (یا از طریق GitHub ویرایش کن و Commit بزن).

---

## مرحله ۳: دیپلوی فرانت‌اند (ساده‌ترین راه)

### گزینه پیشنهادی: Vercel (رایگان و سریع)

1. برو به [vercel.com](https://vercel.com) و با GitHub لاگین کن.
2. روی **Add New Project** کلیک کن.
3. مخزن `multi-Agent-Chat-Room` را انتخاب کن.
4. در بخش **Root Directory** بنویس: `chat-app`
5. روی **Deploy** کلیک کن.

بعد از تمام شدن، یک آدرس مثل `https://multi-agent-chat-room.vercel.app` بهت می‌دهد.

---

## مرحله ۴: تست نهایی

1. آدرس فرانت‌اند (از Vercel) را باز کن.
2. چند تب مرورگر باز کن.
3. در یک تب پیام بنویس.
4. باید فوراً در همه تب‌ها ظاهر شود و در دیتابیس Neon ذخیره شود.

---

## نکات مهم

- **سرور Render خواب می‌رود**: اولین بار ممکن است ۳۰-۵۰ ثانیه طول بکشد.
- برای جلوگیری از خوابیدن می‌توانی از [UptimeRobot](https://uptimerobot.com) استفاده کنی (رایگان).
- هر بار که کد را در GitHub تغییر بدی، Render و Vercel خودکار آپدیت می‌شوند.

---

## اگر مشکلی داشتی

بگو دقیقاً کجا گیر کردی:
- آیا بک‌اند روی Render ساخته شد؟
- آدرس بک‌اند را داری؟
- فرانت‌اند را روی Vercel دیپلوی کردی؟

من راهنمایی دقیق می‌کنم.