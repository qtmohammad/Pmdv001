# نظام الدعم الفني مع الإشعارات الفورية
# Support System with Instant Notifications

---

## 🎯 نظرة عامة | Overview

تم إنشاء **نظام دعم فني متكامل** مع إشعارات فورية يعمل بالكامل على خطة Firebase المجانية (Spark) بدون الحاجة لـ Cloud Functions!

A **complete support system** with instant notifications running entirely on Firebase's free Spark plan without Cloud Functions!

---

## ✨ الميزات الرئيسية | Main Features

### للمستخدمين | For Users
- 📝 إنشاء تذاكر دعم مع موضوع ورسالة
- 💬 محادثة تفاعلية مع الإدارة
- 🔔 **إشعارات فورية** عند رد الإدارة
- 📊 متابعة حالة التذاكر (مفتوحة/تم الرد/مغلقة)
- 🌍 دعم كامل للعربية والإنجليزية
- 📱 تصميم متجاوب

### للإدارة | For Admin
- 📋 عرض جميع التذاكر
- 🔖 فلترة حسب الحالة
- 💬 الرد على التذاكر
- 🔔 **إشعارات فورية** عند ورود تذاكر جديدة
- 🔒 إغلاق وإعادة فتح التذاكر
- 👥 عرض معلومات المستخدمين

---

## 🚀 البدء السريع | Quick Start

### 1️⃣ إعداد Firebase (5 دقائق)

```bash
# 1. افتح Firebase Console
https://console.firebase.google.com

# 2. فعّل Cloud Messaging
Project Settings → Cloud Messaging → تأكد من التفعيل

# 3. احصل على VAPID Key
Cloud Messaging → Web Push certificates → Generate key pair

# 4. ضعه في /lib/fcm.ts
const VAPID_KEY = 'YOUR_KEY_HERE';
```

### 2️⃣ إعداد Service Worker

```javascript
// في /public/firebase-messaging-sw.js
// استبدل Firebase config
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  // ... بقية المعلومات
});
```

### 3️⃣ إعداد Firestore Rules

انسخ القواعد من `firebase-rules-ready.txt` وانشرها.

### 4️⃣ إعداد سيرفر الإشعارات

```bash
cd notification-server
npm install

# حمّل Service Account Key من Firebase
# ضعه في notification-server/serviceAccountKey.json

# شغّل السيرفر
npm start

# أو انشره على Vercel/Railway مجاناً
vercel
```

### 5️⃣ حدّث URL السيرفر

```typescript
// في /lib/fcm.ts
const NOTIFICATION_SERVER_URL = 'https://your-app.vercel.app/api/send-notification';
```

---

## 📱 كيف يعمل النظام | How It Works

### سيناريو 1: مستخدم ينشئ تذكرة

```
1. المستخدم → يكتب موضوع ورسالة
2. يُحفظ في Firestore مع needsAdminNotification: true
3. الإدارة → تستمع للتغييرات
4. إشعار فوري يظهر للمدير! 🔔
```

### سيناريو 2: مدير يرد على تذكرة

```
1. المدير → يكتب رداً
2. يُحفظ في Firestore
3. sendNotification() → ترسل FCM token للسيرفر
4. السيرفر → يرسل إشعار عبر Admin SDK
5. إشعار فوري يظهر للمستخدم! 🔔
```

---

## 📊 هيكل البيانات | Data Structure

### supportTickets
```typescript
{
  userId: "user123",
  userEmail: "user@example.com",
  userName: "أحمد محمد",
  subject: "مشكلة في التفعيل",
  message: "لا أستطيع...",
  status: "open" | "replied" | "closed",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  needsAdminNotification: true  // للإشعارات
}
```

### supportTickets/{id}/messages
```typescript
{
  sender: "user" | "admin",
  text: "نص الرسالة",
  createdAt: Timestamp
}
```

### fcmTokens
```typescript
{
  userId: "user123",
  token: "fcm_token_...",
  isAdmin: false,
  updatedAt: Date
}
```

---

## 🔔 نظام الإشعارات | Notification System

### المكونات الرئيسية:

1. **FCM Client** (`/lib/fcm.ts`)
   - طلب صلاحيات الإشعارات
   - حفظ FCM tokens
   - إرسال طلبات للسيرفر

2. **Service Worker** (`/public/firebase-messaging-sw.js`)
   - استقبال الإشعارات في الخلفية
   - عرض notifications

3. **Notification Server** (`/notification-server/`)
   - استقبال طلبات من التطبيق
   - إرسال إشعارات عبر Admin SDK

### مميزات الإشعارات:

✅ تعمل والتطبيق مفتوح (Foreground)
✅ تعمل والتطبيق مغلق (Background)
✅ إشعارات للمتصفح (Desktop)
✅ إشعارات PWA (Mobile)
✅ قابلة للنقر (تفتح التطبيق)

---

## 🆓 التكلفة | Cost

| الخدمة | الحد المجاني | ملاحظات |
|--------|-------------|---------|
| Firebase Spark | ✅ مجاني | 50k reads/day |
| FCM | ✅ مجاني | بدون حدود! |
| Vercel | ✅ مجاني | 100k requests/month |
| Railway | ✅ مجاني | $5 credit شهرياً |
| Render | ✅ مجاني | 750 hours/month |

**النتيجة:** 0$ شهرياً للاستخدام المعتدل! 🎉

---

## 📁 الملفات المضافة | Added Files

```
├── components/
│   ├── SupportPage.tsx              ✅ صفحة المستخدمين
│   └── SupportAdminPage.tsx         ✅ صفحة الإدارة
├── lib/
│   └── fcm.ts                       ✅ وظائف FCM
├── public/
│   └── firebase-messaging-sw.js     ✅ Service Worker
├── notification-server/
│   ├── index.js                     ✅ سيرفر الإشعارات
│   ├── package.json                 ✅
│   └── README.md                    ✅
├── FCM_SETUP_GUIDE.md               ✅ دليل الإعداد الشامل
└── SUPPORT_SYSTEM_README.md         ✅ هذا الملف
```

---

## 🔧 استكشاف الأخطاء | Troubleshooting

### ❌ الإشعارات لا تعمل

**الحل:**
1. تحقق من VAPID key في `/lib/fcm.ts`
2. تحقق من Firebase config في Service Worker
3. افتح DevTools → Application → Service Workers
4. تحقق من FCM tokens في Firestore → `fcmTokens`

### ❌ Permission Denied

**الحل:** تأكد من نشر Firestore Rules من `firebase-rules-ready.txt`

### ❌ سيرفر الإشعارات لا يستجيب

**الحل:**
1. افتح URL السيرفر في المتصفح
2. يجب أن ترى: `{"status":"OK"}`
3. راجع logs في Vercel/Railway/Render

---

## 📚 الأدلة التفصيلية | Detailed Guides

- **`FCM_SETUP_GUIDE.md`** - دليل إعداد شامل خطوة بخطوة
- **`notification-server/README.md`** - دليل السيرفر والاستضافة
- **`firebase-rules-ready.txt`** - قواعد Firestore جاهزة

---

## 🎯 خطوات الإعداد بالترتيب | Setup Steps in Order

1. ✅ احصل على VAPID Key من Firebase
2. ✅ حدّث `/lib/fcm.ts`
3. ✅ حدّث `/public/firebase-messaging-sw.js`
4. ✅ انشر Firestore Rules
5. ✅ حمّل Service Account Key
6. ✅ شغّل notification-server محلياً
7. ✅ اختبر الإشعارات
8. ✅ انشر السيرفر على Vercel/Railway
9. ✅ حدّث URL السيرفر في `/lib/fcm.ts`
10. ✅ اختبر في الإنتاج

---

## 💡 نصائح مهمة | Important Tips

### للتطوير:
- شغّل السيرفر محلياً أولاً
- استخدم ngrok لاختبار webhooks
- افتح console لرؤية FCM logs

### للإنتاج:
- استخدم Environment Variables للمفاتيح
- أضف Rate Limiting للسيرفر
- فعّل CORS لدومينك فقط
- راقب استهلاك Firestore

---

## 🚀 خطوات التحسين | Enhancement Steps

### قريباً:
- [ ] إشعارات بريدية كـ backup
- [ ] تصنيفات للتذاكر
- [ ] أولويات (عادي، عاجل)
- [ ] مرفقات (صور)
- [ ] تقييم الدعم

---

## 🎉 تهانينا!

لديك الآن نظام دعم فني احترافي مع إشعارات فورية يعمل بالكامل على خطة Firebase المجانية! 🚀

You now have a professional support system with instant notifications running entirely on Firebase's free plan! 🚀

---

## 📞 المساعدة | Help

- راجع `FCM_SETUP_GUIDE.md` للإعداد التفصيلي
- راجع `notification-server/README.md` لاستضافة السيرفر
- افتح Firebase Console Logs عند وجود مشاكل
- تحقق من Browser Console للأخطاء

---

**تم التطوير بحب باستخدام:**
- ⚛️ React + TypeScript
- 🔥 Firebase (Firestore + FCM + Auth)
- 🎨 Tailwind CSS + shadcn/ui
- 🌍 دعم RTL كامل
- 📱 Responsive Design

**Developed with ❤️ using:**
- ⚛️ React + TypeScript
- 🔥 Firebase (Firestore + FCM + Auth)
- 🎨 Tailwind CSS + shadcn/ui
- 🌍 Full RTL Support
- 📱 Responsive Design
