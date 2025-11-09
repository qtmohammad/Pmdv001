# 🖼️ دليل إعداد Cloudinary - Cloudinary Setup Guide

## 📋 نظرة عامة

تم دمج Cloudinary في المشروع لتمكين رفع الصور في:
- ✅ **حسابات المستخدمين**: صورة شخصية
- ✅ **المنتجات**: صورة رمزية + صورة رئيسية
- ✅ **تذاكر الدعم**: حتى 3 صور لكل تذكرة

---

## 🚀 الإعداد السريع

### الخطوة 1: إنشاء حساب Cloudinary

1. اذهب إلى: https://cloudinary.com/users/register/free
2. سجل حساب جديد (مجاني)
3. أكد بريدك الإلكتروني

### الخطوة 2: الحصول على Cloud Name

1. بعد تسجيل الدخول، ستجد **Dashboard**
2. في الأعلى، ستجد:
   - **Cloud Name**: انسخه
   - **API Key**: (غير مطلوب للرفع من المتصفح)
   - **API Secret**: (غير مطلوب)

### الخطوة 3: إنشاء Upload Preset

1. اذهب إلى: **Settings** > **Upload**
2. في قسم **Upload presets**، انقر **Add upload preset**
3. املأ المعلومات:
   - **Preset name**: `support-system-uploads` (أو أي اسم تريده)
   - **Signing Mode**: اختر **Unsigned** ⚠️ مهم
   - **Folder**: يمكنك اختيار مجلد افتراضي (مثل `support-system`)
   - ��ترك باقي الإعدادات كما هي
4. انقر **Save**

### الخطوة 4: إضافة البيانات إلى `.env`

افتح ملف `.env` وأضف:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=support-system-uploads
```

### الخطوة 5: إعادة تشغيل المشروع

```bash
npm run dev
```

✅ **تم!** الآن يمكن رفع الصور.

---

## 📁 بنية المجلدات في Cloudinary

الصور يتم تنظيمها تلقائياً في مجلدات:

```
support-system/
├── users/               # صور المستخدمين
├── products/            # صور المنتجات
└── support-tickets/     # صور تذاكر الدعم
```

---

## 🎯 الاستخدام في التطبيق

### 1. الصورة الشخصية (Profile Picture)

**الموقع**: حساب المستخدم (Account Page)

**كيفية الاستخدام**:
1. اذهب إلى **الحساب** (Account)
2. في قسم **المعلومات الشخصية**
3. ستجد مكون رفع الصورة الشخصية
4. اسحب وأفلت الصورة أو انقر لاختيار ملف
5. انقر **حفظ** (Save)

**المواصفات**:
- نوع الملف: JPG, PNG, GIF, WebP
- الحد الأقصى: 5 ميجابايت
- الأبعاد المثلى: 200×200 بكسل
- الشكل: مربع (Square)

---

### 2. صور المنتجات

#### أ) الصورة الرمزية (Product Icon)

**الموقع**: إضافة/تعديل منتج

**كيفية الاستخدام**:
1. اذهب إلى **إضافة منتجات** أو **تعديل المنتجات**
2. ستجد مكون **أيقونة المنتج**
3. ارفع صورة صغيرة تمثل المنتج
4. احفظ المنتج

**المواصفات**:
- نوع الملف: JPG, PNG, GIF, WebP
- الحد الأقصى: 5 ميجابايت
- الأبعاد المثلى: 150×150 بكسل
- الشكل: مربع (Square)

#### ب) الصورة الرئيسية (Main Image)

**كيفية الاستخدام**:
1. في نفس صفحة المنتج
2. ستجد مكون **الصورة الرئيسية للمنتج**
3. ارفع صورة أكبر للمنتج
4. احفظ المنتج

**المواصفات**:
- نوع الملف: JPG, PNG, GIF, WebP
- الحد الأقصى: 5 ميجابايت
- الأبعاد المثلى: 800×600 بكسل
- الشكل: أفقي (Landscape)

---

### 3. صور تذاكر الدعم

**الموقع**: صفحة الدعم الفني (Support Page)

**كيفية الاستخدام**:
1. اذهب إلى **تذاكر الدعم**
2. انقر **تذكرة جديدة**
3. املأ العنوان والوصف
4. في قسم **إرفاق صور**، يمكنك رفع حتى 3 صور
5. اسحب وأفلت الصور أو انقر للاختيار
6. يمكنك رفع عدة صور مرة واحدة
7. أرسل التذكرة

**المواصفات**:
- نوع الملف: JPG, PNG, GIF, WebP
- الحد الأقصى: 5 ميجابايت لكل صورة
- العدد الأقصى: 3 صور
- الأبعاد: حتى 1200×1200 بكسل

---

## 🔧 الإعدادات المتقدمة

### تغيير الحد الأقصى لحجم الصورة

في ملف `/lib/cloudinary.ts`:

```typescript
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 10  // غير 5 إلى 10 مثلاً
): { valid: boolean; error?: string } => {
  // ...
};
```

### تغيير عدد الصور المسموح بها في التذاكر

في ملف `/components/SupportPage.tsx`:

```typescript
<MultiImageUploader
  maxImages={5}  // غير 3 إلى 5 مثلاً
  // ...
/>
```

### تخصيص تحويلات الصور

في ملف `/lib/cloudinary.ts`:

```typescript
export const IMAGE_TRANSFORMATIONS = {
  AVATAR: {
    width: 300,        // غير الأبعاد
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  },
  // ...
};
```

---

## 💾 حفظ البيانات في Firestore

### بنية البيانات:

#### 1. المستخدمون (buyers collection):
```json
{
  "uid": "user123",
  "name": "اسم المستخدم",
  "email": "user@example.com",
  "profileImage": "https://res.cloudinary.com/...",
  "profileImagePublicId": "support-system/users/abc123"
}
```

#### 2. المنتجات (products collection):
```json
{
  "productId": "PROD-001",
  "name": "اسم المنتج",
  "iconImage": "https://res.cloudinary.com/...",
  "iconImagePublicId": "support-system/products/icon_xyz",
  "mainImage": "https://res.cloudinary.com/...",
  "mainImagePublicId": "support-system/products/main_xyz"
}
```

#### 3. تذاكر الدعم (supportTickets collection):
```json
{
  "ticketId": "TICKET-001",
  "title": "عنوان التذكرة",
  "description": "الوصف",
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "support-system/support-tickets/img1"
    },
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "support-system/support-tickets/img2"
    }
  ]
}
```

---

## 🎨 التحسينات التلقائية

Cloudinary يقوم تلقائياً بـ:
- ✅ ضغط الصور للحفاظ على الجودة وتقليل الحجم
- ✅ تحويل الصيغ تلقائياً (WebP للمتصفحات الداعمة)
- ✅ تحسين الجودة حسب الجهاز
- ✅ Lazy Loading للصور
- ✅ Responsive Images

---

## 📊 الحصة المجانية (Free Tier)

الخطة المجانية في Cloudinary تشمل:
- ✅ **25 GB تخزين**
- ✅ **25 GB Bandwidth شهرياً**
- ✅ **رفع غير محدود**
- ✅ **Transformations محدودة**

**يكفي لـ**:
- ~5,000-10,000 صورة
- ~50,000 مشاهدة شهرياً

---

## 🔒 الأمان

### ⚠️ ملاحظات مهمة:

1. **Unsigned Upload Preset**:
   - آمن للاستخدام من المتصفح
   - لا يتطلب API Secret
   - يمكن تقييد الرفع من المتصفح فقط

2. **حذف الصور**:
   - الحذف يتطلب تطبيق Backend
   - حالياً: يتم حذف المرجع من Firestore فقط
   - الصورة تبقى في Cloudinary

3. **التحكم بالوصول**:
   - يمكن جعل المجلدات خاصة
   - يمكن تفعيل Authentication
   - راجع Cloudinary Docs لمزيد من الأمان

---

## 🐛 حل المشاكل

### ❌ "Upload failed"

**الأسباب المحتملة**:
1. Upload Preset خطأ أو غير موجود
2. Cloud Name خطأ
3. الصورة أكبر من الحد المسموح
4. نوع الملف غير مدعوم

**الحل**:
```bash
# تحقق من .env
cat .env | grep CLOUDINARY

# تأكد من:
# 1. Cloud Name صحيح
# 2. Upload Preset صحيح
# 3. Upload Preset من نوع Unsigned
```

### ❌ "CORS Error"

**السبب**: إعدادات CORS في Cloudinary

**الحل**:
1. اذهب إلى Cloudinary Dashboard
2. Settings > Security
3. في **Allowed fetch domains**، أضف:
   - `localhost:3000`
   - `localhost:5173`
   - نطاقك (domain) عند النشر

### ❌ الصورة لا تظهر

**الحل**:
1. تحقق من Console للأخطاء
2. تحقق من أن URL الصورة صحيح
3. تحقق من Firestore أن URL محفوظ

---

## 📚 موارد إضافية

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [React Integration](https://cloudinary.com/documentation/react_integration)

---

## 🎯 نصائح للأداء الأفضل

### 1. تحسين الصور قبل الرفع
- استخدم أدوات ضغط الصور
- قلل الأبعاد إذا كانت كبيرة جداً
- استخدم صيغة WebP عند الإمكان

### 2. استخدام CDN
- Cloudinary يوفر CDN عالمي
- الصور يتم cache تلقائياً
- سرعة تحميل أفضل

### 3. Lazy Loading
- استخدم `loading="lazy"` في tags
- تحسين أداء الصفحة

---

## ✅ قائمة التحقق

- [ ] إنشاء حساب Cloudinary
- [ ] الحصول على Cloud Name
- [ ] إنشاء Upload Preset (Unsigned)
- [ ] إضافة البيانات في `.env`
- [ ] إعادة تشغيل المشروع
- [ ] اختبار رفع صورة شخصية
- [ ] اختبار رفع صور المنتجات
- [ ] اختبار رفع صور تذاكر الدعم

---

**📅 آخر تحديث:** نوفمبر 2024  
**📌 الإصدار:** 1.0.0
