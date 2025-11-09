# 🚀 خطوات التثبيت والتشغيل - دليل مبسط

## ⚡ التثبيت السريع (5 دقائق)

### الخطوة 1️⃣: التحقق من Node.js
افتح Terminal أو CMD واكتب:
```bash
node --version
```

إذا لم يكن مثبتاً، حمله من: https://nodejs.org/ (اختر النسخة LTS)

---

### الخطوة 2️⃣: تحميل المشروع
احفظ جميع الملفات في مجلد واحد على جهازك (مثلاً: `D:\my-support-system`)

---

### الخطوة 3️⃣: فتح Terminal في مجلد المشروع

**على Windows:**
1. افتح مجلد المشروع
2. اضغط Shift + زر الفأرة الأيمن
3. اختر "Open PowerShell window here" أو "Open in Terminal"

**على Mac/Linux:**
1. افتح Terminal
2. اكتب: `cd /path/to/project`

---

### الخطوة 4️⃣: تثبيت الحزم
اكتب في Terminal:
```bash
npm install
```
⏰ انتظر 2-5 دقائق حتى يكتمل التحميل

---

### الخطوة 5️⃣: إعداد Firebase

#### أ) إنشاء ملف .env
1. ابحث عن ملف `.env.example` في مجلد المشروع
2. انسخه وأعد تسميته إلى `.env` (بدون example)
3. افتح ملف `.env`

#### ب) الحصول على بيانات Firebase
1. اذهب إلى: https://console.firebase.google.com
2. اختر مشروعك (أو أنشئ مشروع جديد)
3. من الصفحة الرئيسية، اضغط على أيقونة الترس ⚙️ > Project Settings
4. في تبويب "General"، انزل إلى "Your apps"
5. إذا لم يكن لديك تطبيق Web، اضغط على أيقونة `</>`
6. سجل التطبيق وانسخ الـ Configuration

#### ج) ملء ملف .env
الصق البيانات في ملف `.env`:

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

### الخطوة 6️⃣: تشغيل المشروع
في Terminal، اكتب:
```bash
npm run dev
```

✅ **تم بنجاح!** سيفتح المتصفح تلقائياً على: http://localhost:3000

---

## 🔧 إعداد Firebase (بعد أول تشغيل)

### 1. تفعيل Authentication
1. في Firebase Console، اذهب إلى **Authentication**
2. اضغط "Get Started"
3. فعّل "Email/Password"

### 2. إنشاء Firestore Database
1. في Firebase Console، اذهب إلى **Firestore Database**
2. اضغط "Create database"
3. اختر "Start in test mode" (سنضبط القواعد لاحقاً)
4. اختر موقع الخادم (يُفضل القريب منك)

### 3. تطبيق قواعد Firestore
1. في Firestore، اذهب إلى تبويب **Rules**
2. انسخ القواعد من ملف `firestore-complete-rules.txt`
3. الصقها واضغط "Publish"

### 4. إنشاء Realtime Database
1. في Firebase Console، اذهب إلى **Realtime Database**
2. اضغط "Create Database"
3. اختر موقع الخادم
4. اختر "Start in locked mode"

### 5. تطبيق قواعد Realtime Database
1. في Realtime Database، اذهب إلى تبويب **Rules**
2. انسخ القواعد من ملف `realtime-database-rules.json`
3. الصقها واضغط "Publish"

---

## ⚠️ حل مشكلة Firestore Index (مهم!)

عند أول استخدام للنظام، قد يظهر خطأ Index. لحله:

### الطريقة السريعة:
1. افتح ملف `FIX_INDEX_ERROR.html` في المتصفح مباشرة
2. اتبع التعليمات التفاعلية خطوة بخطوة

### أو يدوياً:
1. في Firebase Console، اذهب إلى **Firestore Database** > **Indexes**
2. اضغط "Create Index"
3. أضف هذه الفهارس:

**Index 1: للاستعلامات اليومية**
- Collection ID: `supportTickets`
- Fields:
  - `buyerUserId` (Ascending)
  - `createdAt` (Descending)
  - `isDeleted` (Ascending)

**Index 2: للمدير**
- Collection ID: `supportTickets`
- Fields:
  - `status` (Ascending)
  - `createdAt` (Descending)
  - `isDeleted` (Ascending)

---

## 🎯 إنشاء أول حساب مدير

1. شغّل المشروع وافتح المتصفح
2. سجل حساب جديد من صفحة التسجيل
3. افتح Firebase Console > Authentication
4. ابحث عن المستخدم الذي أنشأته
5. انسخ `User UID` الخاص به
6. اذهب إلى Firestore Database > ابدأ مجموعة `users`
7. أنشئ مستند جديد:
   - Document ID: `[User UID الذي نسخته]`
   - Fields:
     ```
     role: "admin"
     email: "[بريدك الإلكتروني]"
     createdAt: [timestamp حالي]
     ```

الآن يمكنك الدخول كمدير!

---

## 📋 قائمة التحقق السريعة

- [ ] تثبيت Node.js
- [ ] تحميل المشروع
- [ ] تشغيل `npm install`
- [ ] إنشاء ملف `.env`
- [ ] ملء بيانات Firebase في `.env`
- [ ] تشغيل `npm run dev`
- [ ] تفعيل Authentication
- [ ] إنشاء Firestore Database
- [ ] تطبيق قواعد Firestore
- [ ] إنشاء Realtime Database
- [ ] تطبيق قواعد Realtime Database
- [ ] إنشاء حساب مدير
- [ ] تعيين دور ال��دير في Firestore

---

## 🆘 مشاكل شائعة وحلولها

### ❌ "npm: command not found"
**الحل:** ثبت Node.js من https://nodejs.org/

### ❌ "Port 3000 is already in use"
**الحل:**
```bash
npm run dev -- --port 3001
```

### ❌ Firebase لا يعمل
**الحل:** تأكد من:
- صحة بيانات `.env`
- إنشاء ملف `.env` في المجلد الرئيسي
- إعادة تشغيل Terminal بعد إنشاء `.env`

### ❌ "Cannot find module"
**الحل:**
```bash
rm -rf node_modules
npm install
```

---

## 📚 الخطوات التالية

بعد التثبيت الناجح:

1. ✅ اقرأ `README.md` لفهم المشروع
2. ✅ اقرأ `SUPPORT_QUICK_START.md` لبدء استخدام نظام الدعم
3. ✅ راجع `MEMBERSHIP_SYSTEM.md` لفهم نظام العضويات
4. ✅ اقرأ `FCM_SETUP_GUIDE.md` لإعداد الإشعارات

---

## 💡 نصائح مهمة

- 📌 احفظ ملف `.env` سرياً
- 📌 لا ترفع `.env` على GitHub
- 📌 اعمل نسخة احتياطية من بيانات Firebase
- 📌 راجع التوثيق عند الحاجة

---

## 🎉 تم بنجاح!

أنت الآن جاهز لاستخدام نظام الدعم الفني!

للمساعدة، راجع:
- `TROUBLESHOOTING.md` - حل المشاكل
- `COMMON_ERRORS.md` - الأخطاء الشائعة
- `QUICK_START.md` - دليل البدء السريع

---

**نتمنى لك تجربة ممتعة! 🚀**
