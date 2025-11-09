# استكشاف الأخطاء - نظام الدعم الفني
# Troubleshooting - Support System

دليل سريع لحل المشاكل الشائعة في نظام الدعم الفني.

---

## 🔥 الأخطاء الشائعة | Common Errors

### ❌ Error: "The query requires an index"

**الرسالة الكاملة:**
```
FirebaseError: [code=failed-precondition]: The query requires an index...
```

**السبب:** 
Firestore يتطلب composite index عند استخدام `where` و `orderBy` معاً.

**✅ الحل (تم تطبيقه):**
النظام الآن يستخدم **Client-Side Sorting** بدون الحاجة لـ indexes إضافية.

**للمزيد:** راجع [`FIRESTORE_INDEXES_GUIDE.md`](./FIRESTORE_INDEXES_GUIDE.md)

---

### ❌ Error: "Permission Denied" عند إنشاء تذكرة

**السبب:** 
Firestore Rules غير منشورة أو غير صحيحة.

**✅ الحل:**
1. افتح [`firebase-rules-ready.txt`](./firebase-rules-ready.txt)
2. انسخ القواعد كاملة
3. افتح Firebase Console → Firestore Database → Rules
4. الصق القواعد واضغط **Publish**

---

### ❌ الإشعارات لا تعمل

**الأعراض:**
- لا تصل إشعارات عند إنشاء تذكرة
- لا تصل إشعارات عند الرد

**✅ الحلول:**

#### 1. تحقق من VAPID Key

```typescript
// في /lib/fcm.ts
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // ❌ لم يتم تحديثه

const VAPID_KEY = 'BG8x...actual_key...xyz'; // ✅ مفتاح حقيقي
```

**كيف تحصل عليه:**
1. Firebase Console → Project Settings
2. Cloud Messaging → Web Push certificates
3. انسخ المفتاح

#### 2. تحقق من Service Worker

افتح DevTools (F12) → Application → Service Workers

يجب أن ترى:
```
✅ firebase-messaging-sw.js - Activated and running
```

إذا لم تره:
1. تحقق من وجود `/public/firebase-messaging-sw.js`
2. تحقق من Firebase config في الملف
3. أعد تحميل الصفحة (Ctrl+Shift+R)

#### 3. تحقق من FCM Tokens

افتح Firestore → Collection: `fcmTokens`

يجب أن ترى documents بـ:
```
{
  userId: "user123",
  token: "fcm_token_long_string...",
  isAdmin: false,
  updatedAt: Timestamp
}
```

إذا لم تر:
- المستخدم لم يفعّل الإشعارات
- اضغط "تفعيل الإشعارات" في الصفحة

#### 4. تحقق من سيرفر الإشعارات

افتح URL السيرفر في المتصفح:
```
https://your-app.vercel.app/
```

يجب أن ترى:
```json
{
  "status": "OK",
  "message": "Notification server is running",
  "timestamp": "2024-..."
}
```

إذا لم تره:
- السيرفر غير مستضاف
- راجع [`notification-server/README.md`](./notification-server/README.md)

#### 5. تحقق من URL السيرفر في الكود

```typescript
// في /lib/fcm.ts
const NOTIFICATION_SERVER_URL = 'YOUR_NOTIFICATION_SERVER_URL'; // ❌

const NOTIFICATION_SERVER_URL = 'https://your-app.vercel.app/api/send-notification'; // ✅
```

---

### ❌ لا أستطيع رؤية صفحة "إدارة الدعم"

**السبب:** 
المستخدم ليس admin.

**✅ الحل:**
1. افتح Firestore Database
2. اذهب إلى collection `buyers` (أو `users` حسب نظامك)
3. ابحث عن document المستخدم (userId)
4. أضف أو عدّل الحقل:
   ```
   isAdmin: true
   ```
5. أعد تحميل الصفحة

---

### ❌ التذاكر لا تظهر

**للمستخدمين:**

**التحقق:**
- افتح Firestore → `supportTickets`
- ابحث عن documents بـ `userId` الخاص بك

**الحل:**
- تأكد من إنشاء تذكرة جديدة
- تحقق من Firestore Rules
- راجع Console للأخطاء (F12)

**للإدارة:**

**التحقق:**
- تأكد من أن `isAdmin: true` في Firestore
- افتح Console وتحقق من الأخطاء

---

### ❌ الرسائل لا تظهر فوراً

**السبب:**
النظام يستخدم Real-time listeners لكن قد تكون هناك مشكلة.

**✅ الحل:**
1. تحقق من اتصال الإنترنت
2. افتح Console (F12) وابحث عن أخطاء
3. أعد تحميل الصفحة
4. تحقق من Firestore Rules للـ messages subcollection

---

### ❌ Service Worker Error في Console

**الأخطاء الشائعة:**

#### "Failed to register service worker"

**الحل:**
1. تأكد من أن `/public/firebase-messaging-sw.js` موجود
2. تأكد من تشغيل التطبيق على HTTPS أو localhost
3. Service Workers لا تعمل على HTTP

#### "Firebase config is invalid"

**الحل:**
افتح `/public/firebase-messaging-sw.js` وتحقق من:
```javascript
firebase.initializeApp({
  apiKey: "AIza...", // ✅ يجب أن يكون مفتاح حقيقي
  authDomain: "project.firebaseapp.com", // ✅
  projectId: "project-id", // ✅
  // ... بقية المعلومات
});
```

---

### ❌ إشعار يظهر لكن لا يفتح التطبيق

**السبب:**
notification click handler غير مضبوط.

**✅ الحل:**
تحقق من `/public/firebase-messaging-sw.js`:

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/') // ✅ يفتح التطبيق
    );
  }
});
```

---

### ❌ "Cannot parse Firebase url" في Realtime Database

**ملاحظة:** 
نظام الدعم يستخدم **Firestore** فقط، وليس Realtime Database.

إذا ظهر هذا الخطأ:
- تجاهله إذا كنت لا تستخدم Realtime Database
- أو راجع [`COMMON_ERRORS.md`](./COMMON_ERRORS.md) رقم 2

---

## 🔍 تشخيص المشاكل | Diagnostics

### أداة التشخيص السريعة

افتح Console (F12) واكتب:

```javascript
// تحقق من Firebase config
console.log('Firebase initialized:', !!window.firebase);

// تحقق من Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log(reg.scope));
});

// تحقق من Notification permission
console.log('Notification permission:', Notification.permission);

// تحقق من FCM
import { getMessaging } from 'firebase/messaging';
console.log('Messaging:', getMessaging());
```

---

## 📊 الفحوصات الأساسية | Basic Checks

قبل البدء، تأكد من:

### ✅ Firebase Setup
- [ ] Firebase config صحيح في `/lib/firebase.ts`
- [ ] Firebase config صحيح في `/public/firebase-messaging-sw.js`
- [ ] Cloud Messaging مفعّل في Firebase Console

### ✅ Firestore Rules
- [ ] Rules منشورة من `firebase-rules-ready.txt`
- [ ] تشمل `supportTickets` و `fcmTokens`

### ✅ FCM Setup
- [ ] VAPID Key محدّث في `/lib/fcm.ts`
- [ ] Service Worker مسجل ويعمل
- [ ] Notification permission ممنوحة

### ✅ Notification Server
- [ ] Service Account Key موجود
- [ ] السيرفر يعمل (محلياً أو مستضاف)
- [ ] URL محدّث في `/lib/fcm.ts`

---

## 🆘 لا يزال لا يعمل؟

### خطوات التصعيد:

1. **راجع جميع الأدلة:**
   - [`FCM_SETUP_GUIDE.md`](./FCM_SETUP_GUIDE.md)
   - [`SUPPORT_SYSTEM_README.md`](./SUPPORT_SYSTEM_README.md)
   - [`notification-server/README.md`](./notification-server/README.md)

2. **افحص Logs:**
   - Browser Console (F12)
   - Firebase Console → Functions → Logs (إذا كنت تستخدم Functions)
   - Vercel/Railway Logs (للسيرفر)

3. **اختبر كل جزء:**
   - Firestore: هل يمكنك إضافة/قراءة documents؟
   - FCM: هل token يُحفظ في Firestore؟
   - Server: هل يستجيب للطلبات؟

4. **أعد الإعداد من الصفر:**
   - احذف Service Worker (DevTools → Application → Clear storage)
   - أعد طلب Notification permission
   - أعد تحميل الصفحة بالكامل (Ctrl+Shift+R)

---

## 💡 نصائح للتطوير | Development Tips

### استخدم Console.log بكثرة

```typescript
// في fcm.ts
export const sendNotification = async (...) => {
  console.log('🔔 Sending notification...'); // ✅
  console.log('Tokens:', tokens); // ✅
  
  const response = await fetch(...);
  console.log('Response:', response); // ✅
};
```

### راقب Network Tab

DevTools → Network → Filter: Fetch/XHR

ابحث عن:
- طلبات لـ `/api/send-notification`
- استجابات من Firebase
- أخطاء 4xx/5xx

### استخدم Firestore Emulator (للتطوير)

```bash
firebase emulators:start
```

يتيح لك اختبار بدون التأثير على البيانات الحقيقية.

---

## 📚 موارد إضافية

- [Firebase Support](https://firebase.google.com/support)
- [FCM Troubleshooting](https://firebase.google.com/docs/cloud-messaging/troubleshooting)
- [Service Worker Debugging](https://developer.chrome.com/docs/workbox/troubleshooting-and-logging/)

---

## ✅ الخلاصة

معظم المشاكل تأتي من:
1. ❌ Firebase config غير صحيح
2. ❌ VAPID Key غير محدّث
3. ❌ Service Worker غير مسجل
4. ❌ Firestore Rules غير منشورة
5. ❌ Notification Server URL خطأ

تحقق من هذه النقاط الخمس أولاً! ✅

Most issues come from:
1. ❌ Incorrect Firebase config
2. ❌ VAPID Key not updated
3. ❌ Service Worker not registered
4. ❌ Firestore Rules not published
5. ❌ Wrong Notification Server URL

Check these 5 points first! ✅
