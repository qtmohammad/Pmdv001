# تحديث نظام حالة المنتجات
# Product Status System Update

## 📋 نظرة عامة / Overview

تم إضافة نظام متكامل لإدارة حالة المنتجات وصلاحيتها، مع حفظ البيانات في كل من Firestore و Realtime Database.

A complete system has been added to manage product status and validity, with data saved in both Firestore and Realtime Database.

---

## ✨ الميزات الجديدة / New Features

### 1. لمنتجات Firebase Apps

**الحقول المضافة / Added Fields:**
- ✅ **حالة المنتج / Product Status**: `isActive` (boolean)
  - `true` = المنتج يعمل / Product is active
  - `false` = المنتج لا يعمل / Product is inactive

- ✅ **نوع الصلاحية / Validity Type**: `expiryType` (string)
  - `'lifetime'` = صلاحية مدى الحياة / Lifetime validity
  - `'date'` = صلاحية محددة بتاريخ / Date-based validity

- ✅ **تاريخ الانتهاء / Expiry Date**: `expiryDate` (string, optional)
  - يظهر فقط عند اختيار صلاحية محددة بتاريخ
  - Only shown when date-based validity is selected

### 2. لمنتجات Domain License

**الحقول المضافة / Added Fields:**
- ✅ **حالة المنتج / Product Status**: `isActive` (boolean)
  - `true` = المنتج يعمل / Product is active
  - `false` = المنتج لا يعمل / Product is inactive

---

## 🗄️ تخزين البيانات / Data Storage

### في Firestore:
```javascript
buyers/{buyerId}/products: [
  {
    productId: "product-123",
    planId: "plan-abc",
    isActive: true,
    expiryType: "lifetime", // للمنتجات من نوع Firebase فقط
    expiryDate: "2025-12-31" // اختياري، فقط إذا كان expiryType = 'date'
  }
]
```

### في Realtime Database:
```javascript
// للمنتجات من نوع Firebase Apps
licenses/apps/{productId}/{buyerId}: {
  isActive: true,
  expiryType: "lifetime",
  expiryDate: "2025-12-31", // اختياري
  appIds: ["1:123456789:android:abc123"]
}

// للمنتجات من نوع Domain
licenses/domains/{productId}/{buyerId}: {
  isActive: true,
  domains: ["example.com", "test.com"]
}
```

---

## 💻 الاستخدام / Usage

### 1. في صفحة إدارة المشترين / Manage Buyers Page

عند تعيين منتج جديد لمشتري:
1. اختر المنتج والخطة
2. حدد حالة المنتج (يعمل/لا يعمل)
3. **للمنتجات من نوع Firebase فقط**: اختر نوع الصلاحية
   - مدى الحياة: المنتج يعمل بدون حد زمني
   - تاريخ محدد: حدد تاريخ انتهاء الصلاحية

When assigning a new product to a buyer:
1. Select product and plan
2. Set product status (active/inactive)
3. **For Firebase products only**: Choose validity type
   - Lifetime: Product works without time limit
   - Specific Date: Set expiry date

### 2. في صفحة منتجاتي / My Products Page

**عرض الحالة / Status Display:**
- ✅ أيقونة خضراء: المنتج نشط
- ❌ أيقونة حمراء: المنتج غير نشط
- ♾️ رمز اللانهاية: صلاحية مدى الحياة
- 📅 تاريخ: تاريخ انتهاء الصلاحية

**التحذيرات / Warnings:**
- ⚠️ إذا كان المنتج غير نشط: "هذا المنتج غير نشط حالياً. يرجى التواصل مع الدعم."
- ⚠️ إذا انتهت صلاحية المنتج: "انتهت صلاحية هذا المنتج. يرجى التواصل مع الدعم للتجديد."

**القيود / Restrictions:**
- 🚫 لا يمكن إضافة/حذف التراخيص (App IDs أو Domains) إذا كان المنتج غير نشط أو منتهي الصلاحية
- 🚫 Cannot add/remove licenses (App IDs or Domains) if product is inactive or expired

---

## 🎨 التصميم / Design

### ألوان الحالة / Status Colors:
- **نشط / Active**: أخضر / Green
- **غير نشط / Inactive**: أحمر / Red
- **منتهي الصلاحية / Expired**: أحمر / Red

### التنبيهات / Alerts:
- المنتجات غير النشطة أو المنتهية تظهر مع خلفية حمراء فاتحة
- Inactive or expired products show with light red background

---

## 🔧 ملفات متأثرة / Affected Files

### 1. المكونات / Components:
- ✅ `/components/ManageBuyersPage.tsx`
  - إضافة حقول الحالة في نماذج التعيين والتعديل
  - حفظ البيانات في Firestore و RTDB
  - عرض الحالة في جدول المشترين

- ✅ `/components/MyProductsPage.tsx`
  - قراءة البيانات من RTDB
  - عرض حالة المنتج وتاريخ الانتهاء
  - تعطيل العمليات للمنتجات غير النشطة

### 2. السياقات / Contexts:
- ✅ `/contexts/LanguageContext.tsx`
  - إضافة جميع الترجمات المطلوبة

### 3. الوثائق / Documentation:
- ✅ `/REALTIME_DATABASE_STRUCTURE.md`
  - تحديث الهيكل الجديد
- ✅ `/realtime-database-rules.json`
  - تحديث قواعد الأمان

---

## 🔄 التوافق الرجعي / Backward Compatibility

- ✅ البيانات تُحفظ في Firestore و RTDB معاً
- ✅ إذا لم تكن البيانات موجودة في RTDB، يتم قراءتها من Firestore
- ✅ القيم الافتراضية:
  - `isActive`: `true`
  - `expiryType`: `'lifetime'`

- ✅ Data is saved in both Firestore and RTDB
- ✅ If data doesn't exist in RTDB, it's read from Firestore
- ✅ Default values:
  - `isActive`: `true`
  - `expiryType`: `'lifetime'`

---

## 📝 أمثلة / Examples

### مثال 1: منتج Firebase نشط مع صلاحية مدى الحياة
```javascript
{
  productId: "firebase-app-1",
  planId: "plan-premium",
  isActive: true,
  expiryType: "lifetime"
}
```

### مثال 2: منتج Firebase غير نشط مع تاريخ انتهاء
```javascript
{
  productId: "firebase-app-2",
  planId: "plan-basic",
  isActive: false,
  expiryType: "date",
  expiryDate: "2025-12-31"
}
```

### مثال 3: منتج Domain نشط
```javascript
{
  productId: "domain-license-1",
  planId: "plan-standard",
  isActive: true,
  allowedDomains: 5
}
```

---

## ⚠️ ملاحظات مهمة / Important Notes

1. **للمنتجات من نوع Firebase فقط**:
   - يتم عرض نوع الصلاحية وتاريخ الانتهاء
   - يمكن اختيار صلاحية مدى الحياة أو تاريخ محدد

2. **للمنتجات من نوع Domain**:
   - يتم عرض حالة المنتج فقط (نشط/غير نشط)
   - لا يوجد تاريخ انتهاء

3. **التحقق من الصلاحية**:
   - يتم التحقق من تاريخ الانتهاء تلقائياً في واجهة المستخدم
   - المنتجات المنتهية الصلاحية تُعامل كمنتجات غير نشطة

4. **الأمان**:
   - قواعد RTDB محدثة لضمان وصول كل مشتري لبياناته فقط
   - البيانات محمية على مستوى buyerId

---

## 🚀 الخطوات التالية / Next Steps

1. ✅ تحديث قواعد Realtime Database (إلزامي)
2. ✅ اختبار تعيين المنتجات للمشترين
3. ✅ التحقق من عرض الحالة بشكل صحيح
4. ⬜ إضافة إشعارات عند اقتراب تاريخ الانتهاء (اختياري)
5. ⬜ إضافة تقارير للمنتجات المنتهية (اختياري)

---

## 📞 الدعم / Support

للمساعدة أو الإبلاغ عن مشاكل:
1. تحقق من قواعد Realtime Database
2. تأكد من صحة buyerId في الطلبات
3. راجع console.log للأخطاء

For help or to report issues:
1. Check Realtime Database rules
2. Ensure buyerId is correct in requests
3. Review console.log for errors

---

**تاريخ التحديث:** 5 نوفمبر 2025  
**Update Date:** November 5, 2025
