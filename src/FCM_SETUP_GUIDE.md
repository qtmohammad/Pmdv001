# دليل إعداد نظام الدعم الفني مع FCM
# Support System with FCM Setup Guide

دليل شامل لإعداد نظام دعم فني مع إشعارات فورية بدون Cloud Functions (خطة Spark المجانية).

Complete guide to set up a support system with instant notifications without Cloud Functions (Free Spark plan).

---

## 📋 نظرة عامة | Overview

النظام يتضمن:
- ✅ تذاكر دعم فني مع محادثة تفاعلية
- ✅ إشعارات فورية عبر Firebase Cloud Messaging
- ✅ يعمل على خطة Firebase المجانية (Spark)
- ✅ بدون الحاجة لـ Cloud Functions
- ✅ سيرفر بسيط يمكن استضافته مجاناً

---

## 🚀 الإعداد السريع | Quick Setup

### الخطوة 1: إعداد Firebase Cloud Messaging

#### 1.1 تفعيل Cloud Messaging

1. افتح [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى **Project Settings** (⚙️)
4. اختر تبويب **Cloud Messaging**
5. تأكد من تفعيل **Cloud Messaging API**

#### 1.2 الحصول على VAPID Key

1. في نفس الصفحة (**Cloud Messaging** tab)
2. اذهب إلى قسم **Web Push certificates**
3. اضغط **Generate key pair**
4. انسخ الـ **Key pair** (VAPID key)
5. افتح ملف `/lib/fcm.ts` وضع المفتاح في:
   ```typescript
   const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
   ```

#### 1.3 إعداد Service Worker

1. افتح ملف `/public/firebase-messaging-sw.js`
2. استبدل Firebase config بمعلومات مشروعك:
   ```javascript
   firebase.initializeApp({
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   });
   ```

---

### الخطوة 2: إعداد Firestore Rules

أضف القواعد التالية إلى Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Support Tickets
    match /supportTickets/{ticketId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true);
      
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && 
                       (request.resource.data.userId == request.auth.uid ||
                        get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true);
      
      match /messages/{messageId} {
        allow read: if request.auth != null && 
                       (get(/databases/$(database)/documents/supportTickets/$(ticketId)).data.userId == request.auth.uid || 
                        get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true);
        
        allow create: if request.auth != null;
      }
    }
    
    // FCM Tokens
    match /fcmTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

### الخطوة 3: إعداد سيرفر الإشعارات

#### 3.1 تحميل Service Account Key

1. في Firebase Console → **Project Settings** → **Service Accounts**
2. اضغط **Generate New Private Key**
3. احفظ الملف باسم `serviceAccountKey.json`
4. ضعه في مجلد `notification-server/`

#### 3.2 تثبيت وتشغيل السيرفر محلياً

```bash
cd notification-server
npm install
npm start
```

السيرفر سيعمل على `http://localhost:3001`

#### 3.3 استضافة السيرفر (مجاناً)

##### خيار 1: Vercel (الأسهل)

```bash
npm i -g vercel
cd notification-server
vercel
```

**ملاحظة مهمة:** في Vercel Dashboard:
1. اذهب إلى Project Settings → Environment Variables
2: أضف متغير جديد:
   - Name: `SERVICE_ACCOUNT`
   - Value: محتوى ملف `serviceAccountKey.json` كـ JSON string

ثم عدّل `index.js`:
```javascript
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT || '{}');
```

##### خيار 2: Railway

1. سجل في [Railway](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. اختر repository
4. Root Directory: `notification-server`
5. أضف Environment Variable للـ Service Account

##### خيار 3: Render

1. سجل في [Render](https://render.com)
2. **New** → **Web Service**
3. Root Directory: `notification-server`
4. Build Command: `npm install`
5. Start Command: `npm start`

#### 3.4 تحديث URL السيرفر في التطبيق

بعد النشر، افتح `/lib/fcm.ts` وحدث:

```typescript
const NOTIFICATION_SERVER_URL = 'https://your-app.vercel.app/api/send-notification';
```

---

### الخطوة 4: اختبار النظام

#### 4.1 كمستخدم عادي:

1. سجل دخول بحساب عادي
2. اضغط **"الدعم الفني"** في القائمة
3. اضغط **"تفعيل الإشعارات"** (السماح للمتصفح)
4. أنشئ تذكرة جديدة
5. يجب أن يصل إشعار للمدير (إذا كان مفعل الإشعارات)

#### 4.2 كمدير:

1. سجل دخول بحساب مدير (isAdmin: true في Firestore)
2. اضغط **"إدارة الدعم"** في القائمة
3. فعّل الإشعارات
4. افتح التذكرة وأرسل رداً
5. يجب أن يصل إشعار للمستخدم

---

## 🔧 هيكل المشروع | Project Structure

```
├── components/
│   ├── SupportPage.tsx           # صفحة المستخدمين
│   └── SupportAdminPage.tsx      # صفحة الإدارة
├── lib/
│   └── fcm.ts                    # وظائف FCM
├── public/
│   └── firebase-messaging-sw.js  # Service Worker
└── notification-server/          # سيرفر الإشعارات
    ├── index.js
    ├── package.json
    └── README.md
```

---

## 📊 هيكل البيانات | Data Structure

### Collection: `supportTickets`

```typescript
{
  id: string,
  userId: string,
  userEmail: string,
  userName: string,
  subject: string,
  message: string,
  status: 'open' | 'replied' | 'closed',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  needsAdminNotification: boolean,  // للإشعارات
  needsUserNotification: boolean    // للإشعارات
}
```

### Subcollection: `supportTickets/{id}/messages`

```typescript
{
  id: string,
  sender: 'user' | 'admin',
  text: string,
  createdAt: Timestamp
}
```

### Collection: `fcmTokens`

```typescript
{
  userId: string,
  token: string,
  isAdmin: boolean,
  updatedAt: Date
}
```

---

## 🔔 كيفية عمل الإشعارات | How Notifications Work

### سيناريو 1: مستخدم ينشئ تذكرة

1. المستخدم يملأ النموذج ويرسل
2. يتم إنشاء document في `supportTickets` مع `needsAdminNotification: true`
3. صفحة الإدارة تستمع للتغييرات (Firestore listener)
4. عند اكتشاف تذكرة جديدة:
   - يُعرض إشعار في المتصفح مباشرة
   - يُحدث الـ flag إلى `false`

### سيناريو 2: مدير يرد على تذكرة

1. المدير يكتب رداً ويرسل
2. يُضاف message جديد مع `sender: 'admin'`
3. يُحدث ticket مع `needsUserNotification: true`
4. يُستدعى `sendNotification()` التي:
   - تحصل على FCM token للمستخدم من Firestore
   - ترسل request لسيرفر الإشعارات
5. السيرفر يرسل الإشعار عبر Firebase Admin SDK
6. المستخدم يستقبل الإشعار (سواء كان التطبيق مفتوحاً أو مغلقاً)

---

## 🔒 الأمان | Security

### حماية سيرفر الإشعارات:

أضف API Key في `notification-server/index.js`:

```javascript
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

في `/lib/fcm.ts`:

```typescript
const response = await fetch(NOTIFICATION_SERVER_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-key'
  },
  body: JSON.stringify({ tokens, title, body }),
});
```

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### ❌ الإشعارات لا تصل

**السبب المحتمل 1:** VAPID Key خطأ
- **الحل:** تحقق من VAPID key في `/lib/fcm.ts`

**السبب المحتمل 2:** Service Worker لا يعمل
- **الحل:** 
  - افتح DevTools → Application → Service Workers
  - تأكد من تسجيل `firebase-messaging-sw.js`
  - أعد تحميل الصفحة

**السبب المحتمل 3:** FCM Token غير محفوظ
- **الحل:** 
  - افتح Firestore → `fcmTokens`
  - تحقق من وجود document بـ userId المستخدم

**السبب المحتمل 4:** سيرفر الإشعارات لا يعمل
- **الحل:**
  - افتح URL السيرفر في المتصفح
  - يجب أن ترى: `{"status":"OK"}`
  - تحقق من logs في Vercel/Railway

### ❌ Permission Denied في Firestore

**الحل:** راجع Firestore Rules أعلاه وتأكد من نشرها.

### ❌ Service Worker Error

**الحل:** تأكد من:
1. Firebase config صحيح في `firebase-messaging-sw.js`
2. الملف موجود في `/public/`
3. المتصفح يدعم Service Workers

---

## 💡 نصائح للإنتاج | Production Tips

### 1. استخدام Environment Variables

لا تضع مفاتيح حساسة في الكود:

```typescript
// في .env
VITE_VAPID_KEY=your-vapid-key
VITE_NOTIFICATION_SERVER=https://your-server.com

// في fcm.ts
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;
```

### 2. Rate Limiting

أضف حماية من spam في السيرفر:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 3. تنظيف FCM Tokens القديمة

أنشئ cron job لحذف tokens غير المستخدمة:

```javascript
// في السيرفر
const cleanOldTokens = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const snapshot = await db.collection('fcmTokens')
    .where('updatedAt', '<', oneMonthAgo)
    .get();
    
  snapshot.forEach(doc => doc.ref.delete());
};
```

### 4. Logging والمراقبة

استخدم logging service للمراقبة:
- [Sentry](https://sentry.io) - لتتبع الأخطاء
- [LogRocket](https://logrocket.com) - لتسجيل جلسات المستخدم

---

## 📈 التحسينات المستقبلية | Future Enhancements

- [ ] إرسال إشعارات بريدية كـ backup
- [ ] إحصائيات عن الإشعارات المرسلة
- [ ] تخصيص نوع الإشعارات (صوت، اهتزاز، إلخ)
- [ ] إشعارات مجدولة
- [ ] دعم الإشعارات على الموبايل (PWA)

---

## 🎯 ملخص التكاليف | Cost Summary

| الخدمة | التكلفة |
|--------|---------|
| Firebase (Spark) | **مجاني** |
| FCM Messages | **مجاني** (بدون حدود) |
| Vercel/Railway | **مجاني** (حتى 100k requests/month) |
| Firestore | **مجاني** (حتى 50k reads/day) |

**إجمالي:** 0$ شهرياً للاستخدام المعقول ✅

---

## 📚 موارد إضافية | Additional Resources

- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vercel Deployment](https://vercel.com/docs)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## ✅ قائمة التحقق النهائية | Final Checklist

قبل النشر:

- [ ] VAPID Key محدث في `/lib/fcm.ts`
- [ ] Firebase config محدث في Service Worker
- [ ] Firestore Rules منشورة
- [ ] سيرفر الإشعارات مستضاف وURL محدث
- [ ] اختبار الإشعارات للمستخدمين والإدارة
- [ ] إضافة API Key protection للسيرفر
- [ ] CORS محدد بدومين التطبيق
- [ ] Service Account Key آمن (في Environment Variables)

---

🎉 **تهانينا! نظام الدعم الفني مع الإشعارات جاهز!**

الآن لديك نظام دعم فني احترافي مع إشعارات فورية يعمل بالكامل على خطة Firebase المجانية!

Congratulations! Your support system with instant notifications is ready and running entirely on Firebase's free plan!
