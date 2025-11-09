# FCM Notification Server

سيرفر بسيط لإرسال إشعارات Firebase Cloud Messaging بدون الحاجة لـ Cloud Functions.

A simple server to send Firebase Cloud Messaging notifications without Cloud Functions.

---

## 📋 المتطلبات | Requirements

- Node.js 18+ 
- حساب Firebase
- Service Account Key من Firebase

---

## 🚀 الإعداد السريع | Quick Setup

### 1. تحميل Service Account Key

1. افتح [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى **Project Settings** (⚙️)
4. اختر تبويب **Service Accounts**
5. اضغط **Generate New Private Key**
6. احفظ الملف باسم `serviceAccountKey.json` في هذا المجلد

### 2. تثبيت الحزم

```bash
cd notification-server
npm install
```

### 3. تشغيل السيرفر محلياً

```bash
npm start
```

أو للتطوير مع auto-reload:

```bash
npm run dev
```

السيرفر سيعمل على: `http://localhost:3001`

---

## 🌐 الاستضافة المجانية | Free Hosting

يمكنك استضافة هذا السيرفر مجاناً على:

### Vercel (الأسهل)

1. سجل في [Vercel](https://vercel.com)
2. ثبت Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. في مجلد notification-server:
   ```bash
   vercel
   ```
4. اتبع التعليمات

**ملاحظة:** ستحتاج لإضافة Service Account Key كـ Environment Variable في Vercel Dashboard.

### Railway

1. سجل في [Railway](https://railway.app)
2. اضغط **New Project** → **Deploy from GitHub**
3. اختر هذا المجلد
4. أضف Service Account content كـ Environment Variable

### Render

1. سجل في [Render](https://render.com)
2. اضغط **New** → **Web Service**
3. اربط GitHub repo
4. Root Directory: `notification-server`
5. Build Command: `npm install`
6. Start Command: `npm start`

---

## 📡 API Endpoint

### POST /api/send-notification

إرسال إشعار لواحد أو أكثر من المستخدمين.

**Request Body:**
```json
{
  "tokens": ["fcm_token_1", "fcm_token_2"],
  "title": "عنوان الإشعار",
  "body": "نص الإشعار"
}
```

**Response:**
```json
{
  "success": true,
  "successCount": 2,
  "failureCount": 0
}
```

**مثال باستخدام cURL:**
```bash
curl -X POST https://your-server.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["token1"],
    "title": "تذكرة جديدة",
    "body": "تم إنشاء تذكرة دعم جديدة"
  }'
```

---

## 🔒 الأمان | Security

### في الإنتاج:

1. **أضف API Key Protection:**
   ```javascript
   const API_KEY = process.env.API_KEY;
   
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

2. **حدد CORS Origins:**
   ```javascript
   app.use(cors({
     origin: 'https://your-app.com'
   }));
   ```

3. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```
   
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

---

## 🔧 استكشاف الأخطاء | Troubleshooting

### خطأ: "Cannot find module './serviceAccountKey.json'"

**الحل:** تأكد من وجود ملف Service Account Key في المجلد.

### خطأ: "Credential implementation provided to initializeApp() via the 'credential' property failed"

**الحل:** تحقق من صحة ملف Service Account Key.

### الإشعارات لا تصل

**الحل:**
1. تحقق من أن FCM Token صحيح وموجود في Firestore
2. تحقق من تفعيل Firebase Cloud Messaging في Firebase Console
3. تحقق من Console logs في السيرفر

---

## 📚 موارد إضافية | Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM HTTP v1 API](https://firebase.google.com/docs/cloud-messaging/http-server-ref)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)

---

## 💡 نصائح | Tips

- استخدم Environment Variables للـ Service Account في الإنتاج
- راقب استهلاك FCM quota (مجاني بدون حدود)
- احفظ logs للتنبيهات الفاشلة
- اختبر الإشعارات قبل النشر

---

## 🎯 بدائل بدون سيرفر | Serverless Alternatives

إذا أردت حلاً بدون سيرفر منفصل:

### 1. استخدام Firestore Triggers من المتصفح

بدلاً من السيرفر، يمكنك الاستماع للتغييرات في Firestore من صفحة الإدارة وإرسال الإشعارات مباشرة (لكن هذا يتطلب أن تكون صفحة الإدارة مفتوحة).

### 2. استخدام Cloudflare Workers (مجاني)

Cloudflare Workers يدعم تشغيل كود JavaScript على edge network مجاناً (100,000 request/day).

---

تم تطوير هذا السيرفر ليكون بسيطاً وسهل الاستضافة. يمكن توسيعه حسب احتياجاتك! 🚀
