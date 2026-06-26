# Multi-Agent Chat Room

چت روم واقعی چندنفره با **Socket.io + Node.js + Neon Postgres**

- پیام‌های واقعی و لحظه‌ای
- ذخیره دائمی پیام‌ها در Neon
- رابط کاربری زیبا و فارسی (RTL)
- آماده استقرار روی Render + Vercel

---

## وضعیت فعلی (اتصال کامل)

✅ بک‌اند به **Neon Postgres** متصل است  
✅ فرانت‌اند آماده اتصال به سرور واقعی است  
✅ پروژه روی GitHub پوش شده  
✅ راهنمای کامل استقرار موجود است

---

## لینک ریپازیتوری

**https://github.com/farzadabbasi617-star/multi-Agent-Chat-Room**

---

## نحوه راه‌اندازی سریع (Render + Vercel)

### ۱. بک‌اند را روی Render دیپلوی کن

1. به [render.com](https://render.com) برو
2. **New Web Service** → مخزن را انتخاب کن
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. در Environment Variables این را اضافه کن:
   - `DATABASE_URL` = (رشته Neon تو)

بعد از ساخت، آدرس بک‌اند را کپی کن (مثلاً `https://arena-chat-backend-xxxx.onrender.com`)

### ۲. آدرس بک‌اند را در فرانت‌اند بگذار

فایل `js/socket-client.js` را باز کن و این خط را ویرایش کن:

```js
const PRODUCTION_SERVER = 'https://YOUR-RENDER-URL.onrender.com';
```

### ۳. فرانت‌اند را روی Vercel دیپلوی کن

1. به [vercel.com](https://vercel.com) برو
2. New Project → مخزن
3. **Root Directory** = `chat-app`
4. Deploy

---

## اجرای محلی

```bash
# بک‌اند
cd backend
npm install
node server.js

# فرانت‌اند (در ترمینال جدا)
npx serve .
```

---

## فایل‌های کلیدی

- `backend/db.js` → اتصال به Neon
- `backend/server.js` → سرور Socket.io + Neon
- `js/socket-client.js` → کلاینت فرانت‌اند
- `DEPLOY.md` → راهنمای کامل استقرار

---

**پروژه کاملاً آماده اتصال به سرور واقعی است.**

فقط دو کار باقی مانده:
1. دیپلوی بک‌اند روی Render
2. گذاشتن آدرس در `socket-client.js`

بعد از آن چت واقعی چندنفره داری! 🎉