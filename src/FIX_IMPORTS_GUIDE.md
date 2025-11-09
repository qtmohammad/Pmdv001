# 🔧 دليل إصلاح مشكلة أرقام الإصدارات في الـ Imports

## 🎯 المشكلة

بعض الملفات تحتوي على أرقام إصدارات في عبارات الـ import مثل:

```typescript
import { toast } from 'sonner@2.0.3';
import * as AccordionPrimitive from "@radix-ui/react-accordion@1.2.3";
import { ChevronDownIcon } from "lucide-react@0.487.0";
```

هذه الطريقة تعمل في بيئة Figma Make، لكنها **لا تعمل في بيئة Node.js المحلية** وتسبب أخطاء.

## ✅ الحل الصحيح

يجب إزالة أرقام الإصدارات من جميع الـ imports:

```typescript
import { toast } from 'sonner';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
```

---

## 🚀 الطريقة 1: إصلاح تلقائي باستخدام السكريبت (موصى به)

### الخطوة 1: تشغيل السكريبت
افتح Terminal في مجلد المشروع واكتب:

```bash
node fix-imports.js
```

### الخطوة 2: مراجعة النتائج
السكريبت سيُظهر لك:
- ✅ عدد الملفات المعالجة
- ✅ عدد الملفات المعدلة
- ✅ قائمة بالملفات التي تم إصلاحها

### الخطوة 3: اختبار المشروع
```bash
npm run dev
```

---

## 🛠️ الطريقة 2: إصلاح يدوي (للملفات الفردية)

إذا كنت تريد إصلاح ملف واحد فقط:

### 1. افتح الملف
مثلاً `components/SupportPage.tsx`

### 2. ابحث واستبدل
استخدم Find & Replace في محررك:

**ابحث عن:**
```regex
@\d+\.\d+\.\d+
```

**استبدل بـ:**
```
(اتركه فارغاً)
```

### 3. تأكد من النتيجة
قبل:
```typescript
import { toast } from 'sonner@2.0.3';
```

بعد:
```typescript
import { toast } from 'sonner';
```

---

## 📝 قائمة الملفات المتأثرة

### ملفات Components الرئيسية:
- ✅ `components/AccountPage.tsx`
- ✅ `components/AddProductsPage.tsx`
- ✅ `components/EditProductsPage.tsx`
- ✅ `components/ForgotPasswordPage.tsx`
- ✅ `components/LoginPage.tsx`
- ✅ `components/ManageBuyersPage.tsx`
- ✅ `components/ManageMembershipsPage.tsx`
- ✅ `components/MyProductsPage.tsx`
- ✅ `components/RegisterPage.tsx`
- ✅ `components/SupportPage.tsx`
- ✅ `components/SupportAdminPage.tsx`

### ملفات UI Components (جميعها في `components/ui/`):
- ✅ `accordion.tsx`
- ✅ `alert-dialog.tsx`
- ✅ `alert.tsx`
- ✅ `aspect-ratio.tsx`
- ✅ `avatar.tsx`
- ✅ `badge.tsx`
- ✅ `breadcrumb.tsx`
- ✅ `button.tsx`
- ✅ `calendar.tsx`
- ✅ `carousel.tsx`
- ✅ `chart.tsx`
- ✅ `checkbox.tsx`
- ✅ `collapsible.tsx`
- ✅ `command.tsx`
- ✅ `context-menu.tsx`
- ✅ `dialog.tsx`
- ✅ `drawer.tsx`
- ✅ `dropdown-menu.tsx`
- ✅ `form.tsx`
- ✅ `hover-card.tsx`
- ✅ `input-otp.tsx`
- ✅ `label.tsx`
- ✅ `menubar.tsx`
- ✅ `navigation-menu.tsx`
- ✅ `pagination.tsx`
- ✅ `popover.tsx`
- ✅ `progress.tsx`
- ✅ `radio-group.tsx`
- ✅ `resizable.tsx`
- ✅ `scroll-area.tsx`
- ✅ `select.tsx`
- ✅ `separator.tsx`
- ✅ `sheet.tsx`
- ✅ `sidebar.tsx`
- ✅ `slider.tsx`
- ✅ `sonner.tsx`
- ✅ `switch.tsx`
- ✅ `tabs.tsx`
- ✅ `toggle-group.tsx`
- ✅ `toggle.tsx`
- ✅ `tooltip.tsx`

**المجموع:** ~52 ملف

---

## 🔍 الحزم المتأثرة

### Radix UI Components:
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

### حزم أخرى:
- `lucide-react`
- `sonner`
- `class-variance-authority`
- `react-hook-form`
- `react-day-picker`
- `embla-carousel-react`
- `recharts`
- `cmdk`
- `vaul`
- `input-otp`
- `react-resizable-panels`
- `next-themes`

---

## ⚠️ ملاحظات مهمة

### 1. استثناء `react-hook-form`
حزمة `react-hook-form` تحتاج إلى الإصدار 7.55.0 حسب التعليمات:

```typescript
// يجب أن تبقى كما هي
import { ... } from "react-hook-form@7.55.0";
```

### 2. حزمة `sonner`
للاستيراد من `sonner`، استخدم هذا فقط في ملف `sonner.tsx`:

```typescript
// في components/ui/sonner.tsx فقط
import { toast } from "sonner@2.0.3";
```

في باقي الملفات:
```typescript
// في جميع الملفات الأخرى
import { toast } from "sonner";
```

### 3. package.json
تأكد من أن `package.json` يحتوي على الإصدارات الصحيحة:

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.3",
    "lucide-react": "^0.294.0",
    "sonner": "^1.3.1",
    // ... etc
  }
}
```

---

## 🧪 كيفية الاختبار بعد الإصلاح

### 1. حذف node_modules وإعادة التثبيت
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. تشغيل المشروع
```bash
npm run dev
```

### 3. التحقق من عدم وجود أخطاء
افتح المتصفح وتحقق من Console للتأكد من عدم وجود أخطاء.

---

## 🐛 حل المشاكل

### المشكلة: "Cannot find module 'package@1.2.3'"
**السبب:** لم يتم إزالة رقم الإصدار من الـ import

**الحل:**
```bash
# شغّل السكريبت مرة أخرى
node fix-imports.js
```

### المشكلة: السكريبت لا يعمل
**السبب:** قد يكون Node.js غير مثبت

**الحل:**
```bash
# تأكد من تثبيت Node.js
node --version

# إذا لم يكن مثبتاً، حمله من:
# https://nodejs.org/
```

### المشكلة: الملفات لم تتغير
**السبب:** قد تكون الملفات للقراءة فقط

**الحل:**
```bash
# على Linux/Mac
chmod -R +w components/ contexts/ lib/ src/

# على Windows
# تحقق من خصائص الملفات وأزل "Read-only"
```

---

## ✅ قائمة التحقق السريعة

- [ ] شغّلت السكريبت `node fix-imports.js`
- [ ] حذفت `node_modules` و `package-lock.json`
- [ ] شغّلت `npm install`
- [ ] شغّلت `npm run dev`
- [ ] لا توجد أخطاء في Terminal
- [ ] لا توجد أخطاء في Browser Console
- [ ] المشروع يعمل بشكل صحيح

---

## 📚 موارد إضافية

- [Node.js Documentation](https://nodejs.org/docs/)
- [NPM Package Versions](https://docs.npmjs.com/about-semantic-versioning)
- [Vite Import Syntax](https://vitejs.dev/guide/features.html#npm-dependency-resolving-and-pre-bundling)

---

## 🎉 بعد الإصلاح

بعد تشغيل السكريبت بنجاح:

1. ✅ جميع الـ imports ستكون نظيفة
2. ✅ المشروع سيعمل محلياً بدون مشاكل
3. ✅ npm سيتعامل مع الإصدارات من `package.json`
4. ✅ يمكنك تحديث الحزم بسهولة باستخدام `npm update`

---

**تاريخ التحديث:** نوفمبر 2024  
**الإصدار:** 1.0.0
