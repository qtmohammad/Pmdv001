# 📥 دليل تنزيل وتشغيل المشروع محلياً

## 🎯 نظرة عامة
هذا الدليل الشامل سيساعدك على تنزيل المشروع وتشغيله على جهازك المحلي بكل سهولة.

---

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

### 1. Node.js و npm
- قم بتحميل وتثبيت Node.js (النسخة 18 أو أحدث) من: https://nodejs.org/
- للتحقق من التثبيت، افتح Terminal/CMD واكتب:
  ```bash
  node --version
  npm --version
  ```

### 2. Git (اختياري)
- للتحميل باستخدام Git: https://git-scm.com/

### 3. محرر نصوص
- يُنصح باستخدام Visual Studio Code: https://code.visualstudio.com/

---

## 🚀 خطوات التنزيل والتشغيل

### الطريقة 1: التحميل المباشر (موصى به)

#### الخطوة 1: تحميل المشروع
1. احفظ جميع الملفات في مجلد واحد على جهازك
2. تأكد من الحفاظ على البنية الهرمية للمجلدات كما هي

#### الخطوة 2: فتح المشروع
1. افتح Terminal/CMD
2. انتقل إلى مجلد المشروع:
   ```bash
   cd path/to/your/project
   ```

#### الخطوة 3: إصلاح أرقام الإصدارات (⚠️ مهم جداً!)
**يجب تنفيذ هذا قبل تثبيت الحزم!**

الملفات تحتوي على أرقام إصدارات في الـ imports (مثل `package@1.2.3`) وهذا يسبب أخطاء.

قم بتشغيل هذا الأمر لإصلاح جميع الملفات تلقائياً:
```bash
npm run fix-imports
```

أو:
```bash
node fix-imports.js
```

ستظهر رسالة تخبرك بعدد الملفات التي تم إصلاحها (حوالي 52 ملف).

📖 **للمزيد:** راجع `FIX_IMPORTS_GUIDE.md`

#### الخطوة 4: تثبيت الحزم
قم بتشغيل الأمر التالي لتثبيت جميع الحزم المطلوبة:
```bash
npm install
```

⏰ **ملاحظة:** قد يستغرق هذا من 2-5 دقائق حسب سرعة الإنترنت.

#### الخطوة 5: إعداد Firebase
1. انسخ ملف `.env.example` وأعد تسميته إلى `.env`
2. افتح ملف `.env` وضع بيانات Firebase الخاصة بك
3. للحصول على البيانات:
   - اذهب إلى Firebase Console: https://console.firebase.google.com
   - اختر مشروعك
   - اذهب إلى Project Settings > General
   - انسخ بيانات Firebase Configuration

**مثال على ملف .env:**
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

#### الخطوة 6: تشغيل المشروع
قم بتشغيل الأمر التالي:
```bash
npm run dev
```

✅ **نجح التشغيل!** سيتم فتح المتصفح تلقائياً على: `http://localhost:3000`

---

### الطريقة 2: باستخدام Git

```bash
# 1. استنساخ المشروع (إذا كان على GitHub)
git clone [repository-url]

# 2. الانتقال إلى المجلد
cd firebase-support-system

# 3. تثبيت الحزم
npm install

# 4. إعداد ملف .env (اتبع الخطوة 4 من الطريقة 1)
cp .env.example .env

# 5. تشغيل المشروع
npm run dev
```

---

## 🔧 إعداد Firebase (مهم جداً!)

بعد تشغيل المشروع، يجب إعداد Firebase:

### 1. قواعد Firestore
اتبع التعليمات في: `FIRESTORE_RULES.md`

### 2. فهارس Firestore
⚠️ **مهم:** عند ظهور خطأ الفهرس، اتبع التعليمات في:
- `FIX_INDEX_ERROR.html` (افتح الملف مباشرة في المتصفح)
- أو اتبع `FIRESTORE_INDEX_QUICK_FIX.md`

### 3. قواعد Realtime Database
اتبع التعليمات في: `RTDB_RULES_SETUP.md`

### 4. إعداد الإشعارات (FCM)
اتبع التعليمات في: `FCM_SETUP_GUIDE.md`

---

## 📁 البنية الصحيحة للمشروع

تأكد من أن مشروعك يحتوي على البنية التالية:

```
firebase-support-system/
├── public/
│   └── firebase-messaging-sw.js
├── src/
│   └── main.tsx
├── components/
│   ├── AccountPage.tsx
│   ├── AddProductsPage.tsx
│   ├── ...
│   └── ui/
├── contexts/
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   ├── firebase.ts
│   ├── fcm.ts
│   └── ...
├── styles/
│   └── globals.css
├── App.tsx
├── index.html
├── package.json
├── vite.config.ts
├── .env (يجب إنشاؤه)
└── [ملفات التوثيق]
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: "npm: command not found"
**الحل:** قم بتثبيت Node.js من https://nodejs.org/

### المشكلة 2: "Port 3000 is already in use"
**الحل:** 
```bash
# قم بتغيير المنفذ في vite.config.ts أو أغلق التطبيق الذي يستخدم المنفذ 3000
npm run dev -- --port 3001
```

### المشكلة 3: خطأ في Firebase
**الحل:** 
- تأكد من صحة بيانات `.env`
- تأكد من تفعيل Authentication و Firestore و Realtime Database في Firebase Console

### المشكلة 4: "Cannot find module"
**الحل:**
```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
```

### المشكلة 5: خطأ Firestore Index
**الحل:** 
1. افتح ملف `FIX_INDEX_ERROR.html` في المتصفح
2. اتبع التعليمات التفاعلية
3. أو راجع `FIRESTORE_INDEX_QUICK_FIX.md`

---

## 🛠️ أوامر مفيدة

```bash
# تشغيل المشروع في وضع التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build

# معاينة النسخة المبنية
npm run preview

# فحص الأخطاء (Linting)
npm run lint

# تحديث جميع الحزم
npm update
```

---

## 📦 بناء المشروع للنشر

عندما تريد نشر المشروع على الإنترنت:

```bash
# 1. بناء المشروع
npm run build

# 2. سيتم إنشاء مجلد dist يحتوي على الملفات الجاهزة للنشر
```

يمكنك نشر محتوى مجلد `dist` على:
- Firebase Hosting
- Vercel
- Netlify
- GitHub Pages
- أي خدمة استضافة أخرى

---

## 📚 دليل البدء السريع

بعد تشغيل المشروع بنجاح، اتبع هذا الترتيب:

1. ✅ **اقرأ:** `README.md` - نظرة عامة على المشروع
2. ✅ **اقرأ:** `QUICK_START.md` - دليل البدء السريع
3. ✅ **طبق:** `FIREBASE_SETUP.md` - إعداد Firebase
4. ✅ **طبق:** `FIRESTORE_RULES.md` - قواعد Firestore
5. ✅ **طبق:** `RTDB_RULES_SETUP.md` - قواعد Realtime Database
6. ✅ **اقرأ:** `SUPPORT_QUICK_START.md` - بدء استخدام نظام الدعم

---

## 🆘 المساعدة والدعم

إذا واجهت أي مشاكل:

1. راجع ملف `TROUBLESHOOTING.md`
2. راجع ملف `COMMON_ERRORS.md`
3. راجع ملف `SUPPORT_TROUBLESHOOTING.md`
4. تأكد من اتباع جميع الخطوات بالترتيب

---

## ✨ الميزات الرئيسية

- ✅ نظام دعم فني متكامل
- ✅ إدارة المنتجات والمشترين
- ✅ نظام عضويات مرن
- ✅ إشعارات فورية (FCM)
- ✅ دعم كامل للعربية والإنجليزية (RTL/LTR)
- ✅ تصميم متجاوب (Responsive)
- ✅ وضع مظلم (Dark Mode)
- ✅ يعمل على الخطة المجانية من Firebase

---

## 📝 ملاحظات مهمة

1. **احتفظ بملف `.env` سرياً** - لا تشاركه مع أحد
2. **لا ترفع `.env` إلى Git** - هو مستثنى في `.gitignore`
3. **راجع التوثيق** - كل ميزة لها ملف توثيق خاص
4. **الخطة المجانية** - المشروع يعمل بالكامل على Spark Plan

---

## 🎉 تهانينا!

أنت الآن جاهز لبدء استخدام نظام الدعم الفني!

لأي استفسارات أو مشاكل، راجع ملفات التوثيق الشاملة المتوفرة في المشروع.

---

**تاريخ التحديث:** نوفمبر 2024  
**الإصدار:** 1.0.0
