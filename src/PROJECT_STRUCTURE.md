# 📁 بنية المشروع - Project Structure

## 🎯 نظرة عامة

هذا دليل شامل لفهم بنية المشروع وموقع كل ملف ووظيفته.

---

## 📂 البنية الكاملة

```
firebase-support-system/
│
├── 📄 index.html                    # صفحة HTML الرئيسية
├── 📄 package.json                  # معلومات المشروع والحزم المطلوبة
├── 📄 vite.config.ts                # إعدادات Vite
├── 📄 tsconfig.json                 # إعدادات TypeScript
├── 📄 postcss.config.js             # إعدادات PostCSS
├── 📄 .env                          # متغيرات البيئة (يجب إنشاؤه)
├── 📄 .env.example                  # مثال على ملف البيئة
├── 📄 .gitignore                    # الملفات المستثناة من Git
│
├── 📁 src/
│   └── 📄 main.tsx                  # نقطة الدخول الرئيسية
│
├── 📁 public/
│   └── 📄 firebase-messaging-sw.js  # Service Worker للإشعارات
│
├── 📁 components/                   # مكونات React
│   ├── 📄 AccountPage.tsx           # صفحة الحساب
│   ├── 📄 AddProductsPage.tsx       # صفحة إضافة المنتجات
│   ├── 📄 EditProductsPage.tsx      # صفحة تعديل المنتجات
│   ├── 📄 ForgotPasswordPage.tsx    # صفحة استعادة كلمة المرور
│   ├── 📄 Layout.tsx                # التخطيط الرئيسي
│   ├── 📄 LoginPage.tsx             # صفحة تسجيل الدخول
│   ├── 📄 ManageBuyersPage.tsx      # صفحة إدارة المشترين
│   ├── 📄 ManageMembershipsPage.tsx # صفحة إدارة العضويات
│   ├── 📄 MyProductsPage.tsx        # صفحة منتجاتي
│   ├── 📄 PermissionAlert.tsx       # تنبيه الصلاحيات
│   ├── 📄 RegisterPage.tsx          # صفحة التسجيل
│   ├── 📄 SupportAdminPage.tsx      # لوحة تحكم الدعم للإدارة
│   ├── 📄 SupportPage.tsx           # صفحة الدعم للمستخدمين
│   │
│   ├── 📁 figma/
│   │   └── 📄 ImageWithFallback.tsx # مكون الصور (محمي)
│   │
│   └── 📁 ui/                       # مكونات Shadcn UI
│       ├── 📄 accordion.tsx
│       ├── 📄 alert-dialog.tsx
│       ├── 📄 alert.tsx
│       ├── 📄 avatar.tsx
│       ├── 📄 badge.tsx
│       ├── 📄 button.tsx
│       ├── 📄 card.tsx
│       ├── 📄 checkbox.tsx
│       ├── 📄 dialog.tsx
│       ├── 📄 dropdown-menu.tsx
│       ├── 📄 input.tsx
│       ├── 📄 label.tsx
│       ├── 📄 popover.tsx
│       ├── 📄 radio-group.tsx
│       ├── 📄 select.tsx
│       ├── 📄 separator.tsx
│       ├── 📄 switch.tsx
│       ├── 📄 table.tsx
│       ├── 📄 tabs.tsx
│       ├── 📄 textarea.tsx
│       ├── 📄 tooltip.tsx
│       └── 📄 [... other UI components]
│
├── 📁 contexts/                     # React Contexts
│   ├── 📄 AuthContext.tsx           # سياق المصادقة
│   ├── 📄 LanguageContext.tsx       # سياق اللغة (RTL/LTR)
│   └── 📄 ThemeContext.tsx          # سياق الوضع المظلم/الفاتح
│
├── 📁 lib/                          # مكتبات مساعدة
│   ├── 📄 firebase.ts               # إعداد Firebase
│   ├── 📄 firebase-check.ts         # التحقق من Firebase
│   ├── 📄 fcm.ts                    # إعدادات الإشعارات
│   └── 📄 membershipSettings.ts     # إعدادات العضويات
│
├── 📁 styles/
│   └── 📄 globals.css               # الأنماط العامة وإعدادات Tailwind
│
├── 📁 notification-server/          # سيرفر الإشعارات
│   ├── 📄 README.md
│   ├── 📄 index.js
│   └── 📄 package.json
│
├── 📁 guidelines/
│   └── 📄 Guidelines.md             # إرشادات عامة
│
├── 📄 App.tsx                       # المكون الرئيسي
│
├── 🔥 Firebase Configuration Files
│   ├── 📄 firestore.indexes.json           # فهارس Firestore
│   ├── 📄 realtime-database-rules.json     # قواعد Realtime Database
│   ├── 📄 firestore-complete-rules.txt     # قواعد Firestore
│   └── 📄 firebase-rules-ready.txt         # قواعد جاهزة
│
└── 📚 Documentation Files (ملفات التوثيق)
    ├── 📄 README.md                       # الدليل الرئيسي
    ├── 📄 DOWNLOAD_AND_RUN.md             # دليل التنزيل والتشغيل (هذا الملف)
    ├── 📄 INSTALLATION_STEPS_AR.md        # خطوات التثبيت المبسطة
    ├── 📄 PROJECT_STRUCTURE.md            # بنية المشروع (هذا الملف)
    │
    ├── 🚀 Quick Start & Setup
    │   ├── 📄 QUICK_START.md              # البدء السريع
    │   ├── 📄 SETUP_CHECKLIST.md          # قائمة التحقق
    │   ├── 📄 FIREBASE_SETUP.md           # إعداد Firebase
    │   ├── 📄 FIRESTORE_RULES.md          # قواعد Firestore
    │   ├── 📄 RTDB_RULES_SETUP.md         # قواعد Realtime Database
    │   └── 📄 FCM_SETUP_GUIDE.md          # إعداد الإشعارات
    │
    ├── 🎯 Support System Documentation
    │   ├── 📄 SUPPORT_SYSTEM_README.md    # دليل نظام الدعم
    │   ├── 📄 SUPPORT_QUICK_START.md      # البدء السريع للدعم
    │   ├── 📄 SUPPORT_TROUBLESHOOTING.md  # حل مشاكل الدعم
    │   └── 📄 DELETE_SUPPORT_TICKETS.md   # حذف التذاكر
    │
    ├── 👥 Membership System
    │   ├── 📄 MEMBERSHIP_SYSTEM.md            # نظام العضويات
    │   ├── 📄 MEMBERSHIP_LIMITS_FIX.md        # إصلاح الحدود
    │   ├── 📄 DAILY_LIMITS_IMPLEMENTATION.md  # تطبيق الحدود اليومية
    │   ├── 📄 TESTING_MEMBERSHIP_LIMITS.md    # اختبار الحدود
    │   └── 📄 SOFT_DELETE_FIX.md             # إصلاح الحذف الناعم
    │
    ├── 🔍 Firestore Indexes
    │   ├── 📄 FIRESTORE_INDEXES_GUIDE.md      # دليل الفهارس
    │   ├── 📄 FIRESTORE_INDEX_QUICK_FIX.md    # إصلاح سريع
    │   ├── 📄 INDEX_ERROR_SOLUTION.md         # حل خطأ الفهرس
    │   ├── 📄 FIX_INDEX_ERROR.html           # أداة تفاعلية
    │   ├── 📄 🚨_FIX_INDEX_ERROR_NOW.md      # حل فوري
    │   └── 📄 START_HERE_لحل_خطأ_INDEX.txt  # ابدأ هنا
    │
    ├── 🌐 RTL/LTR Support
    │   ├── 📄 RTL_SUPPORT.md              # دعم RTL
    │   ├── 📄 RTL_CLASS_USAGE.md          # استخدام كلاس RTL
    │   └── 📄 RTL_EXAMPLES.md             # أمثلة RTL
    │
    ├── 🗃️ Realtime Database
    │   ├── 📄 REALTIME_DATABASE_STRUCTURE.md  # بنية قاعدة البيانات
    │   ├── 📄 MIGRATION_GUIDE.md              # دليل الترحيل
    │   ├── 📄 CHANGELOG_RTDB.md               # سجل التغييرات
    │   ├── 📄 ⚡_RTDB_STRUCTURE_UPDATE.md     # تحديث البنية
    │   └── 📄 🚀_START_HERE_RTDB_UPDATE.md   # ابدأ هنا للتحديث
    │
    ├── 🐛 Troubleshooting
    │   ├── 📄 TROUBLESHOOTING.md          # حل المشاكل العامة
    │   ├── 📄 COMMON_ERRORS.md            # الأخطاء الشائعة
    │   ├── 📄 ⚡️DAILY_LIMIT_DELETE_FIX.md # إصلاح الحذف والحد اليومي
    │   ├── 📄 ⚡_SOLUTION_SUMMARY.md      # ملخص الحلول
    │   └── 📄 حل_مشكلة_الحذف.md          # حل مشكلة الحذف (عربي)
    │
    ├── 📖 Additional Documentation
    │   ├── 📄 BEFORE_AFTER_COMPARISON.md  # مقارنة قبل/بعد
    │   ├── 📄 📚_READING_ORDER.md         # ترتيب القراءة
    │   └── 📄 Attributions.md            # المساهمات والمصادر
    │
    └── 📄 [... other documentation files]
```

---

## 🎯 وظائف الملفات الرئيسية

### ⚙️ ملفات التكوين

| الملف | الوظيفة |
|------|---------|
| `package.json` | يحتوي على معلومات المشروع وجميع الحزم المطلوبة |
| `vite.config.ts` | إعدادات Vite (أداة البناء) |
| `tsconfig.json` | إعدادات TypeScript |
| `.env` | متغيرات البيئة (بيانات Firebase السرية) |
| `.gitignore` | الملفات التي لا يجب رفعها على Git |

### 🚀 ملفات التشغيل

| الملف | الوظيفة |
|------|---------|
| `index.html` | صفحة HTML الرئيسية |
| `src/main.tsx` | نقطة دخول التطبيق - يتم تشغيله أولاً |
| `App.tsx` | المكون الرئيسي للتطبيق |

### 🔥 ملفات Firebase

| الملف | الوظيفة |
|------|---------|
| `lib/firebase.ts` | تهيئة Firebase والاتصال بقاعدة البيانات |
| `lib/fcm.ts` | إعدادات الإشعارات (Firebase Cloud Messaging) |
| `firestore.indexes.json` | فهارس Firestore المطلوبة |
| `realtime-database-rules.json` | قواعد Realtime Database |
| `firestore-complete-rules.txt` | قواعد أمان Firestore |

### 🎨 مكونات الواجهة

| الملف | الوظيفة |
|------|---------|
| `components/LoginPage.tsx` | صفحة تسجيل الدخول |
| `components/RegisterPage.tsx` | صفحة التسجيل |
| `components/SupportPage.tsx` | صفحة الدعم الفني للمستخدمين |
| `components/SupportAdminPage.tsx` | لوحة تحكم الدعم للمديرين |
| `components/ManageBuyersPage.tsx` | إدارة المشترين والمنتجات |
| `components/ManageMembershipsPage.tsx` | إدارة أنواع العضويات |
| `components/Layout.tsx` | التخطيط العام (Navigation Bar, etc.) |

### 🔐 Contexts (السياقات)

| الملف | الوظيفة |
|------|---------|
| `contexts/AuthContext.tsx` | إدارة حالة تسجيل الدخول والمستخدم |
| `contexts/LanguageContext.tsx` | إدارة اللغة (عربي/إنجليزي) و RTL/LTR |
| `contexts/ThemeContext.tsx` | إدارة الوضع المظلم/الفاتح |

### 🎨 الأنماط

| الملف | الوظيفة |
|------|---------|
| `styles/globals.css` | الأنماط العامة وإعدادات Tailwind CSS |

---

## 🔄 تدفق التطبيق (Application Flow)

```
1. index.html
   ↓
2. src/main.tsx
   ↓
3. App.tsx (يحتوي على Providers)
   ├── AuthContext (المصادقة)
   ├── LanguageContext (اللغة)
   └── ThemeContext (الوضع المظلم)
   ↓
4. Layout.tsx (التخطيط العام)
   ↓
5. Pages (الصفحات)
   ├── LoginPage
   ├── RegisterPage
   ├── SupportPage
   ├── SupportAdminPage
   └── [... other pages]
```

---

## 📦 المجلدات الرئيسية

### 📁 components/
يحتوي على جميع مكونات React:
- **صفحات كاملة** (LoginPage, SupportPage, etc.)
- **مكونات مشتركة** (Layout, PermissionAlert)
- **مكونات UI** (في مجلد `ui/`)

### 📁 contexts/
يحتوي على React Contexts لإدارة الحالة العامة:
- المصادقة والمستخدم
- اللغة والاتجاه
- الوضع المظلم/الفاتح

### 📁 lib/
يحتوي على الدوال والإعدادات المساعدة:
- إعداد Firebase
- إعدادات الإشعارات
- إعدادات العضويات

### 📁 notification-server/
سيرفر Node.js منفصل لإرسال الإشعارات

---

## 🎯 الملفات التي تحتاج تعديلها

### 1. عند التثبيت الأولي:
- ✅ `.env` - أضف بيانات Firebase الخاصة بك
- ✅ `lib/firebase.ts` - تأكد من القراءة من .env

### 2. للتخصيص:
- 🎨 `styles/globals.css` - لتغيير الألوان والأنماط
- 🌐 `contexts/LanguageContext.tsx` - لإضافة/تعديل الترجمات
- 📄 `components/Layout.tsx` - لتعديل التخطيط العام

### 3. لإضافة ميزات:
- ➕ `components/` - أضف صفحات أو مكونات جديدة
- ➕ `lib/` - أضف دوال مساعدة جديدة

---

## 🚫 الملفات المحمية (لا تعدلها)

- ❌ `components/figma/ImageWithFallback.tsx`
- ❌ `components/ui/*` (مكونات Shadcn - معدلة حسب الحاجة فقط)
- ❌ `node_modules/` (تُدار بواسطة npm)

---

## 📚 ملفات التوثيق

جميع ملفات `.md` هي للتوثيق والمساعدة:

### 🎯 للبدء:
1. `README.md` - ابدأ هنا
2. `DOWNLOAD_AND_RUN.md` - دليل التنزيل
3. `INSTALLATION_STEPS_AR.md` - خطوات التثبيت
4. `QUICK_START.md` - البدء السريع

### 🔧 للإعداد:
- `FIREBASE_SETUP.md`
- `FIRESTORE_RULES.md`
- `RTDB_RULES_SETUP.md`
- `FCM_SETUP_GUIDE.md`

### 🐛 لحل المشاكل:
- `TROUBLESHOOTING.md`
- `COMMON_ERRORS.md`
- `SUPPORT_TROUBLESHOOTING.md`

---

## 💡 نصائح مهمة

1. **البنية منظمة:** كل شيء في مكانه المناسب
2. **الفصل واضح:** 
   - مكونات في `components/`
   - سياقات في `contexts/`
   - مساعدات في `lib/`
3. **التوثيق شامل:** كل ميزة لها ملف توثيق خاص
4. **سهل التوسع:** أضف ميزات جديدة بسهولة

---

## 🔍 كيف تجد ملف معين؟

### أريد تعديل صفحة معينة:
→ ابحث في `components/`

### أريد تعديل بيانات Firebase:
→ افتح `lib/firebase.ts` أو `.env`

### أريد تعديل الألوان أو الأنماط:
→ افتح `styles/globals.css`

### أريد تعديل الترجمات:
→ افتح `contexts/LanguageContext.tsx`

### أريد فهم ميزة معينة:
→ ابحث عن ملف التوثيق المناسب في الجذر

---

## 📊 حجم المشروع

- **إجمالي الملفات:** ~100 ملف
- **سطور الكود:** ~15,000 سطر
- **حجم node_modules:** ~300-500 MB
- **حجم البناء (dist):** ~1-2 MB

---

## 🎉 خلاصة

البنية منظمة ومنطقية:
- ✅ سهلة الفهم
- ✅ سهلة التعديل
- ✅ سهلة التوسع
- ✅ موثقة بالكامل

---

**لأي استفسارات، راجع ملفات التوثيق الأخرى!**

---

**تاريخ التحديث:** نوفمبر 2024  
**الإصدار:** 1.0.0
