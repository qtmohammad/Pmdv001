# دليل البدء السريع - نظام الدعم الفني
# Quick Start - Support System

دليل سريع لتشغيل نظام الدعم الفني في 10 دقائق!

---

## ⚡ الإعداد في 5 خطوات

### 1️⃣ إعداد FCM (دقيقتان)

```bash
# افتح Firebase Console
https://console.firebase.google.com

# اذهب إلى: Project Settings → Cloud Messaging
# انسخ VAPID Key من Web Push certificates
```

ضع المفتاح في `/lib/fcm.ts`:
```typescript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

---

### 2️⃣ تحديث Service Worker (دقيقة)

افتح `/public/firebase-messaging-sw.js` وضع Firebase config:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
});
```

---

### 3️⃣ نشر Firestore Rules (دقيقة)

انسخ من `firebase-rules-ready.txt` وانشر في Firebase Console.

---

### 4️⃣ إعداد السيرفر (3 دقائق)

```bash
cd notification-server
npm install

# حمّل Service Account Key من Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key
# احفظه باسم: serviceAccountKey.json

npm start
```

**للاستضافة المجانية (Vercel):**
```bash
npm i -g vercel
vercel
```

---

### 5️⃣ حدّث URL السيرفر (30 ثانية)

في `/lib/fcm.ts`:
```typescript
const NOTIFICATION_SERVER_URL = 'https://your-app.vercel.app/api/send-notification';
```

---

## ✅ اختبار سريع

### كمستخدم:
1. سجّل دخول
2. اذهب لـ "الدعم الفني"
3. فعّل الإشعارات
4. أنشئ تذكرة

### كمدير:
1. سجّل دخول (تأكد من `isAdmin: true` في Firestore)
2. اذهب لـ "إدارة الدعم"
3. فعّل الإشعارات
4. ارد على التذكرة

✅ يجب أن تصل الإشعارات!

---

## 🐛 استكشاف الأخطاء السريع

### الإشعارات لا تعمل؟

1. **تحقق من VAPID Key:** `/lib/fcm.ts`
2. **تحقق من Service Worker:** DevTools → Application → Service Workers
3. **تحقق من FCM Tokens:** Firestore → fcmTokens collection
4. **تحقق من السيرفر:** افتح URL في المتصفح (يجب أن ترى `{"status":"OK"}`)

### Permission Denied؟

انسخ قواعد من `firebase-rules-ready.txt` وانشرها.

---

## 📚 للمزيد

- `FCM_SETUP_GUIDE.md` - دليل تفصيلي
- `SUPPORT_SYSTEM_README.md` - شرح النظام
- `notification-server/README.md` - الاستضافة

---

🎉 **تهانينا! النظام جاهز!**
