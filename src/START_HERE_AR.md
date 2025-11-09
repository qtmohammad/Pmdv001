# 🚀 ابدأ هنا - دليل التشغيل السريع

## ⚡ التشغيل في 3 خطوات فقط

### الخطوة 1️⃣: إصلاح أرقام الإصدارات في الـ Imports
**⚠️ مهم جداً - نفذ هذا أولاً!**

افتح Terminal في مجلد المشروع واكتب:

```bash
npm run fix-imports
```

أو:

```bash
node fix-imports.js
```

ستظهر رسالة تخبرك بعدد الملفات التي تم إصلاحها.

---

### الخطوة 2️⃣: تثبيت الحزم

```bash
npm install
```

⏰ سيستغرق هذا من 2-5 دقائق.

---

### الخطوة 3️⃣: إعداد Firebase

#### أ) إنشاء ملف `.env`
1. انسخ ملف `.env.example`
2. أعد تسميته إلى `.env`
3. افتحه وضع بيانات Firebase الخاصة بك

#### ب) الحصول على بيانات Firebase
1. اذهب إلى: https://console.firebase.google.com
2. اختر مشروعك (أو أنشئ مشروع جديد)
3. اذهب إلى ⚙️ > Project Settings > General
4. انسخ Firebase Configuration

#### ج) مثال على ملف .env
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

---

### الخطوة 4️⃣: تشغيل المشروع

```bash
npm run dev
```

✅ **تم!** سيفتح المتصفح تلقائياً على: http://localhost:3000

---

## 🔧 إعداد Firebase (بعد أول تشغيل)

### 1. تفعيل Authentication
- Firebase Console > Authentication > Get Started
- فعّل Email/Password

### 2. إنشاء Firestore Database
- Firebase Console > Firestore Database > Create
- اختر "Test mode"

### 3. تطبيق قواعد Firestore
- Firestore > Rules
- انسخ من `firestore-complete-rules.txt`

### 4. إنشاء Realtime Database
- Firebase Console > Realtime Database > Create
- اختر "Locked mode"

### 5. تطبيق قواعد Realtime Database
- Realtime Database > Rules
- انسخ من `realtime-database-rules.json`

### 6. إصلاح Firestore Index
عند ظهور خطأ Index:
- افتح `FIX_INDEX_ERROR.html` في المتصفح
- اتبع التعليمات

---

## 📚 للمزيد من التفاصيل

- 📖 `DOWNLOAD_AND_RUN.md` - دليل شامل للتنزيل والتشغيل
- 📖 `INSTALLATION_STEPS_AR.md` - خطوات التثبيت المفصلة
- 📖 `FIX_IMPORTS_GUIDE.md` - دليل إصلاح الـ Imports
- 📖 `README.md` - نظرة عامة على المشروع

---

## 🐛 مشاكل شائعة

### ❌ "Cannot find module 'package@1.2.3'"
**الحل:**
```bash
npm run fix-imports
```

### ❌ "Port 3000 is already in use"
**الحل:**
```bash
npm run dev -- --port 3001
```

### ❌ Firebase لا يعمل
**الحل:** تأكد من:
- إنشاء ملف `.env` بشكل صحيح
- صحة بيانات Firebase
- إعادة تشغيل Terminal

---

## ✅ قائمة التحقق السريعة

- [ ] شغّلت `npm run fix-imports`
- [ ] شغّلت `npm install`
- [ ] أنشأت ملف `.env` وملأته ببيانات Firebase
- [ ] شغّلت `npm run dev`
- [ ] المشروع يعمل على http://localhost:3000
- [ ] فعّلت Authentication في Firebase
- [ ] أنشأت Firestore Database
- [ ] طبّقت قواعد Firestore
- [ ] أنشأت Realtime Database
- [ ] طبّقت قواعد Realtime Database

---

## 🎉 تهانينا!

المشروع الآن جاهز للاستخدام!

**التالي:** اقرأ `SUPPORT_QUICK_START.md` لبدء استخدام نظام الدعم الفني.

---

**التاريخ:** نوفمبر 2024
