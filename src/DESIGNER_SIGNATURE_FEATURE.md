# ميزة توقيع المصمم (Designer Signature Feature)

## نظرة عامة

تم إضافة ميزة جديدة للتحكم في ظهور/إخفاء توقيع المصمم لكل منتج مخصص لكل مشتري. هذه الميزة تعمل بنفس طريقة حالة المنتج (isActive)، حيث يمكن للمدير تحديد ما إذا كان توقيع المصمم ظاهرًا أو مخفيًا لكل مشتري على حدة.

## التحديثات المُنفذة

### 1. إضافة حقل جديد في واجهة UserProduct

**الملف:** `ManageBuyersPage.tsx`

تم إضافة الحقل الجديد:
```typescript
interface UserProduct {
  productId: string;
  planId: string;
  allowedDomains?: number;
  isActive?: boolean;
  expiryType?: 'lifetime' | 'date';
  expiryDate?: string;
  purchaseId?: string;
  designerSignatureVisible?: boolean; // ← جديد
}
```

### 2. تحديث State المتغيرات

تم إضافة الحقل إلى:
- `assignData`: عند إضافة منتج جديد لمشتري
- `editProductData`: عند تعديل منتج موجود

**القيمة الافتراضية:** `true` (توقيع المصمم ظاهر بشكل افتراضي)

### 3. إضافة واجهة المستخدم

تم إضافة حقل اختيار في حوارين:

#### أ. حوار إضافة منتج (Assign Product Dialog)
```xml
<div className="space-y-2">
  <Label>{t('designerSignature')}</Label>
  <Select
    value={assignData.designerSignatureVisible ? 'visible' : 'hidden'}
    onValueChange={(value) => setAssignData({ ...assignData, designerSignatureVisible: value === 'visible' })}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="visible">{t('visible')}</SelectItem>
      <SelectItem value="hidden">{t('hidden')}</SelectItem>
    </SelectContent>
  </Select>
</div>
```

#### ب. حوار تعديل تفاصيل المنتج (Edit Product Details Dialog)
نفس التصميم، ولكن يستخدم `editProductData` بدلاً من `assignData`.

**ملاحظة:** الحقل يظهر لجميع أنواع المنتجات (Firebase و Domain).

### 4. حفظ البيانات في Firestore

عند إضافة أو تعديل منتج، يتم حفظ قيمة `designerSignatureVisible` في:
- وثيقة المشتري في Firestore
- مصفوفة `products`
- لكل منتج مخصص

**مثال:**
```json
{
  "buyers": {
    "buyer_id_123": {
      "name": "محمد أحمد",
      "email": "mohamed@example.com",
      "products": [
        {
          "productId": "PROD-001",
          "planId": "basic",
          "isActive": true,
          "designerSignatureVisible": false  // ← مخفي
        },
        {
          "productId": "PROD-002",
          "planId": "pro",
          "isActive": true,
          "designerSignatureVisible": true   // ← ظاهر
        }
      ]
    }
  }
}
```

### 5. الترجمات

تم إضافة الترجمات التالية في `LanguageContext.tsx`:

```typescript
{
  visible: { ar: 'ظاهر', en: 'Visible' },
  hidden: { ar: 'مخفي', en: 'Hidden' },
  designerSignature: { ar: 'توقيع المصمم', en: 'Designer Signature' }
}
```

## كيفية الاستخدام

### من لوحة إدارة المشترين:

1. **عند إضافة منتج جديد:**
   - اذهب إلى "إدارة المشترين"
   - اختر مشتري وانقر "تعيين"
   - اختر المنتج والخطة
   - في حقل "توقيع المصمم"، اختر:
     - **ظاهر**: سيظهر توقيع المصمم في المنتج للمشتري
     - **مخفي**: سيتم إخفاء توقيع المصمم

2. **عند تعديل منتج موجود:**
   - في قائمة المشترين، انقر على أيقونة "تعديل" بجانب المنتج
   - قم بتغيير حالة "توقيع المصمم" حسب الحاجة
   - انقر "تحديث"

## السلوك التلقائي

- **القيمة الافتراضية:** `true` (ظاهر)
- **المنتجات القديمة:** إذا لم يكن الحقل موجودًا، سيتم اعتباره `true` بشكل افتراضي

## التكامل مع Realtime Database

✅ **تم التحديث:** الآن يتم حفظ `designerSignatureVisible` في كل من **Firestore** و **Realtime Database**

### حفظ البيانات في RTDB:

#### 1. للمنتجات من نوع Domain (في ManageBuyersPage.tsx):
```typescript
const rtdbData = {
  isActive: assignData.isActive,
  designerSignatureVisible: assignData.designerSignatureVisible,  // ← تم الإضافة
  domains: [],
  owner: {
    did: selectedBuyer.id,
    name: selectedBuyer.name,
    email: selectedBuyer.email
  }
};
await set(rtdbRef, rtdbData);
```

#### 2. للمنتجات من نوع Firebase (في MyProductsPage.tsx):
```typescript
const updatedData = {
  isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
  expiryType: userProduct.expiryType || 'lifetime',
  ...(userProduct.expiryDate && { expiryDate: userProduct.expiryDate }),
  designerSignatureVisible: userProduct.designerSignatureVisible !== undefined ? userProduct.designerSignatureVisible : true,  // ← تم الإضافة
  owner: {
    did: userData?.uid || '',
    name: userData?.displayName || '',
    email: userData?.email || ''
  }
};
await set(licenseRef, updatedData);
```

### هيكل البيانات في RTDB:

#### منتجات Firebase:
```json
{
  "licenses": {
    "apps": {
      "PROD-001": {
        "my-project-id": {
          "isActive": true,
          "expiryType": "lifetime",
          "designerSignatureVisible": false,
          "owner": {
            "did": "user123",
            "name": "محمد أحمد",
            "email": "mohamed@example.com"
          }
        }
      }
    }
  }
}
```

#### منتجات Domain:
```json
{
  "licenses": {
    "domains": {
      "PROD-002": {
        "abc1234567": {
          "isActive": true,
          "designerSignatureVisible": true,
          "domains": ["example.com"],
          "owner": {
            "did": "user123",
            "name": "محمد أحمد",
            "email": "mohamed@example.com"
          }
        }
      }
    }
  }
}
```

### ملاحظات مهمة:
- ✅ يتم حفظ `designerSignatureVisible` تلقائياً عند إضافة منتج domain
- ✅ يتم حفظ `designerSignatureVisible` عند إضافة ProjectID لمنتج firebase
- ✅ يتم تحديث القيمة عند تعديل بيانات المنتج
- ✅ القيمة الافتراضية: `true` (ظاهر) في كل من Firestore و RTDB

## أمثلة الاستخدام

### مثال 1: منتج مجاني - إخفاء التوقيع
```
المشتري: محمد أحمد
المنتج: نموذج مجاني
توقيع المصمم: مخفي ✓
```

### مثال 2: منتج مدفوع - إظهار التوقيع
```
المشتري: سارة علي
المنتج: قالب احترافي
توقيع المصمم: ظاهر ✓
```

### مثال 3: عميل VIP - إخفاء التوقيع
```
المشتري: شركة XYZ
المنتج: حل مخصص
توقيع المصمم: مخفي ✓
```

## قراءة البيانات من التطبيق

عند قراءة بيانات المشتري في التطبيق، يمكنك الوصول إلى هذا الحقل:

```typescript
// في MyProductsPage أو أي مكون آخر
const userProduct = userData?.products.find(p => p.productId === 'PROD-001');

if (userProduct?.designerSignatureVisible === false) {
  // أخفي توقيع المصمم
  console.log('توقيع المصمم مخفي');
} else {
  // أظهر توقيع المصمم (القيمة الافتراضية)
  console.log('توقيع المصمم ظاهر');
}
```

## الخلاصة

✅ تم إضافة حقل `designerSignatureVisible` لواجهة UserProduct  
✅ تم إضافة واجهة مستخدم في حواري الإضافة والتعديل  
✅ تم إضافة الترجمات للعربية والإنجليزية  
✅ يتم ح��ظ البيانات في Firestore  
✅ القيمة الافتراضية: `true` (ظاهر)  
✅ يعمل مع جميع أنواع المنتجات (Firebase & Domain)  

## الخطوات التالية (اختياري)

إذا كنت تريد استخدام هذا الحقل في المنتجات:

1. **في منتجات الويب/التطبيق:**
   - قراءة قيمة `designerSignatureVisible` من Firestore
   - إظهار/إخفاء التوقيع بناءً على القيمة
   
2. **في Realtime Database:**
   - إضافة الحقل عند حفظ البيانات
   - تحديث قواعد الأمان للسماح بقراءة هذا الحقل

3. **التحقق:**
   - التأكد من أن جميع المنتجات القديمة تعمل بشكل صحيح
   - اختبار إظهار/إخفاء التوقيع في المنتجات الفعلية