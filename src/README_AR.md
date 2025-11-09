# 🎯 نظام الدعم الفني المتكامل - Firebase Support System

نظام دعم فني شامل مبني على Firebase يعمل بالكامل على الخطة المجانية (Spark Plan).

---

## ⚡ البدء السريع

### 1️⃣ إصلاح الـ Imports (مهم!)
```bash
npm run fix-imports
```

### 2️⃣ تثبيت الحزم
```bash
npm install
```

### 3️⃣ إعداد Firebase
- انسخ `.env.example` إلى `.env`
- ضع بيانات Firebase الخاصة بك

### 4️⃣ تشغيل المشروع
```bash
npm run dev
```

📖 **للتفاصيل الكاملة:** اقرأ `START_HERE_AR.md`

---

## ✨ الميزات الرئيسية

### 🎫 نظام الدعم الفني
- ✅ إرسال ومتابعة تذاكر الدعم
- ✅ محادثات فورية بين المستخدم والمدير
- ✅ حالات التذاكر: جديدة، قيد المعالجة، مغلقة
- ✅ إشعارات فورية (FCM)
- ✅ حذف التذاكر (Soft Delete)

### 👥 نظام العضويات
- ✅ عضو مميز: تذكرتين يومياً
- ✅ عضو مشترك: تذكرة واحدة يومياً
- ✅ إمكانية المدير تعديل الحدود

### 📦 إدارة المنتجات
- ✅ إضافة وتعديل وحذف المنتجات
- ✅ دعم نوعين: Domain و App
- ✅ ربط المنتجات بالمشترين
- ✅ معرف فريد لكل منتج (Product ID)

### 👤 إدارة المشترين
- ✅ إضافة مشترين جدد
- ✅ تعيين المنتجات للمشترين
- ✅ إدارة نوع العضوية
- ✅ إضافة Domain أو App ID

### 🌐 دعم متعدد اللغات
- ✅ العربية والإنجليزية
- ✅ RTL/LTR تلقائي
- ✅ ترجمة كاملة للواجهة

### 🎨 واجهة مستخدم حديثة
- ✅ تصميم متجاوب (Responsive)
- ✅ وضع مظلم/فاتح (Dark/Light Mode)
- ✅ مكونات Shadcn UI
- ✅ Tailwind CSS

---

## 📁 البنية الأساسية

```
firebase-support-system/
├── components/          # مكونات React
├── contexts/           # React Contexts
├── lib/                # إعدادات Firebase
├── styles/             # ملفات CSS
├── public/             # Service Worker
└── [ملفات التوثيق]
```

---

## 📚 الأدلة والتوثيق

### 🚀 البدء
- `START_HERE_AR.md` - **ابدأ من هنا!**
- `DOWNLOAD_AND_RUN.md` - دليل التنزيل والتشغيل
- `INSTALLATION_STEPS_AR.md` - خطوات التثبيت المفصلة
- `QUICK_START.md` - البدء السريع

### 🔧 الإعداد
- `FIREBASE_SETUP.md` - إعداد Firebase
- `FIRESTORE_RULES.md` - قواعد Firestore
- `RTDB_RULES_SETUP.md` - قواعد Realtime Database
- `FCM_SETUP_GUIDE.md` - إعداد الإشعارات

### 🐛 حل المشاكل
- `FIX_IMPORTS_GUIDE.md` - إصلاح أرقام الإصدارات
- `FIX_INDEX_ERROR.html` - حل خطأ Firestore Index
- `TROUBLESHOOTING.md` - حل المشاكل العامة
- `COMMON_ERRORS.md` - الأخطاء الشائعة

### 📖 الميزات
- `SUPPORT_SYSTEM_README.md` - نظام الدعم الفني
- `MEMBERSHIP_SYSTEM.md` - نظام العضويات
- `DELETE_SUPPORT_TICKETS.md` - حذف التذاكر
- `RTL_SUPPORT.md` - دعم RTL/LTR

---

## 🛠️ التقنيات المستخدمة

- **React** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Firebase** - قاعدة البيانات والمصادقة
  - Authentication
  - Firestore Database
  - Realtime Database
  - Cloud Messaging (FCM)
- **Tailwind CSS** - تنسيق الواجهة
- **Shadcn UI** - مكونات الواجهة
- **Vite** - أداة البناء
- **React Router** - التنقل بين الصفحات

---

## ⚙️ الأوامر المتاحة

```bash
# إصلاح أرقام الإصدارات
npm run fix-imports

# تشغيل المشروع
npm run dev

# بناء المشروع
npm run build

# معاينة النسخة المبنية
npm run preview

# فحص الأخطاء
npm run lint
```

---

## 🔐 الأمان

- ✅ قواعد Firebase محددة بدقة
- ✅ التحقق من الصلاحيات
- ✅ متغيرات البيئة للمفاتيح السرية
- ✅ Soft Delete للتذاكر (لمنع الاستغلال)

---

## 📦 يعمل على الخطة المجانية

المشروع مصمم للعمل بالكامل على **Firebase Spark Plan** (المجانية):
- ✅ بدون Cloud Functions
- ✅ استخدام Firestore Triggers
- ✅ سيرفر إشعارات خارجي مجاني

---

## 🎯 الفئة المستهدفة

هذا المشروع مثالي لـ:
- 💼 الشركات الصغيرة
- 🛍️ أصحاب المتاجر الإلكترونية
- 📱 مطوري التطبيقات
- 🌐 أصحاب المواقع
- 👨‍💻 المطورين المستقلين

---

## 🆘 الدعم والمساعدة

إذا واجهت أي مشكلة:

1. راجع `START_HERE_AR.md`
2. راجع `TROUBLESHOOTING.md`
3. راجع `FIX_IMPORTS_GUIDE.md` (لمشاكل التثبيت)
4. راجع `FIX_INDEX_ERROR.html` (لمشاكل Firestore Index)

---

## 📄 الترخيص

هذا المشروع متاح للاستخدام الشخصي والتجاري.

---

## 🙏 شكر وتقدير

- Firebase - قاعدة البيانات السحابية
- Shadcn UI - مكونات الواجهة
- Tailwind CSS - إطار التنسيق
- Lucide Icons - الأيقونات

---

## 📞 التواصل

للاستفسارات والدعم، راجع ملفات التوثيق الشاملة المرفقة.

---

**🚀 ابدأ الآن:** اقرأ `START_HERE_AR.md`

**📅 آخر تحديث:** نوفمبر 2024  
**📌 الإصدار:** 1.0.0
