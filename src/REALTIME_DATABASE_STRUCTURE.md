# Firebase Realtime Database Structure

## تحديث: نظام المالكين (Owner System)

تم تحديث هيكل قاعدة البيانات لإضافة معلومات المالك (owner) لكل منتج، مما يضمن أن كل مشتري يرى فقط المنتجات والبيانات الخاصة به.

## التحديثات الأخيرة

### 1. نظام المالكين (Owner System)
تم إضافة معلومات المالك (did, name, email) لكل سجل في RTDB لضمان فصل بيانات المشترين.

### 2. توقيع المصمم (Designer Signature)
تم إضافة ميزة التحكم في ظهور/إخفاء توقيع المصمم لكل منتج ولكل مشتري.
- **الموقع:** Firestore فقط (ضمن بيانات المشتري)
- **القيمة الافتراضية:** `true` (ظاهر)
- **يمكن تعديلها:** من لوحة إدارة المشترين

## هيكل قاعدة البيانات

### 1. منتجات التطبيقات (Firebase Apps)

```
licenses/
  └── apps/
      └── {ProductID}/
          └── {ProjectID}/
              ├── isActive: boolean
              ├── expiryType: "lifetime" | "date"
              ├── expiryDate: string (optional)
              └── owner/
                  ├── did: string (معرف المشتري)
                  ├── name: string (اسم المشتري)
                  └── email: string (بريد المشتري)
```

**مثال:**
```json
{
  "licenses": {
    "apps": {
      "firebase-product-123": {
        "my-project-id": {
          "isActive": true,
          "expiryType": "lifetime",
          "owner": {
            "did": "user123",
            "name": "محمد أحمد",
            "email": "mohamed@example.com"
          }
        },
        "another-project-id": {
          "isActive": true,
          "expiryType": "date",
          "expiryDate": "2025-12-31",
          "owner": {
            "did": "user456",
            "name": "علي حسن",
            "email": "ali@example.com"
          }
        }
      }
    }
  }
}
```

### 2. منتجات الدومينات (Domain Products)

```
licenses/
  └── domains/
      └── {ProductID}/
          └── {PurchaseID}/
              ├── isActive: boolean
              ├── domains: string[]
              └── owner/
                  ├── did: string (معرف المشتري)
                  ├── name: string (اسم المشتري)
                  └── email: string (بريد المشتري)
```

**مثال:**
```json
{
  "licenses": {
    "domains": {
      "domain-product-456": {
        "abc1234567": {
          "isActive": true,
          "domains": ["example.com", "example.net"],
          "owner": {
            "did": "user123",
            "name": "محمد أحمد",
            "email": "mohamed@example.com"
          }
        },
        "xyz9876543": {
          "isActive": true,
          "domains": ["mysite.com"],
          "owner": {
            "did": "user789",
            "name": "سارة علي",
            "email": "sara@example.com"
          }
        }
      }
    }
  }
}
```

## الملاحظات المهمة

### 1. معرف الشراء (PurchaseID)
- يتم إنشاؤه تلقائياً عند إضافة منتج domain لمشتري
- يتكون من 10 أحرف (حروف صغيرة + أرقام)
- فريد لكل عملية شراء

### 2. معرف المنتج (ProductID)
- يتم استخدام `productId` المخصص من قبل المدير (وليس معرف الوثيقة التلقائي)
- يجب أن يكون فريداً لكل منتج

### 3. معلومات المالك (Owner)
- **did**: معرف المستخدم الفريد من Firebase Auth
- **name**: اسم المشتري من بيانات المستخدم
- **email**: بريد المشتري

## التحديثات على الملفات

### 1. ManageBuyersPage.tsx
**التغييرات:**
- عند إضافة منتج domain لمشتري، يتم حفظ معلومات owner في RTDB
- يتم توليد PurchaseID فريد لكل عملية شراء

**الكود:**
```typescript
const rtdbData = {
  isActive: assignData.isActive,
  domains: [],
  owner: {
    did: selectedBuyer.id,
    name: selectedBuyer.name,
    email: selectedBuyer.email
  }
};
```

### 2. MyProductsPage.tsx
**التغييرات:**
- عند إضافة ProjectID لمنتج firebase، يتم حفظ معلومات owner
- عند تحميل البيانات، يتم تصفية ProjectIDs حسب owner فقط
- عند إضافة/حذف domain، يتم الحفاظ على معلومات owner

**كود التصفية:**
```typescript
Object.keys(projectsData).forEach(projectId => {
  const projectData = projectsData[projectId];
  // عرض المشاريع التي تخص المستخدم الحالي فقط
  if (projectData.owner && projectData.owner.did === userData.uid) {
    projectIds.push(projectId);
  }
});
```

**كود الحفظ:**
```typescript
const updatedData = {
  isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
  expiryType: userProduct.expiryType || 'lifetime',
  ...(userProduct.expiryDate && { expiryDate: userProduct.expiryDate }),
  owner: {
    did: userData?.uid || '',
    name: userData?.displayName || '',
    email: userData?.email || ''
  }
};
```

## سيناريوهات الاستخدام

### السيناريو 1: إضافة منتج Firebase لمشتري
1. المدير يضيف منتج firebase للمشتري من صفحة Manage Buyers
2. يتم حفظ البيانات في Firestore فقط (لا يتم الحفظ في RTDB بعد)
3. المشتري يدخل إلى حسابه ويضيف ProjectID
4. يتم حفظ ProjectID مع معلومات المالك في RTDB
5. المشتري يرى فقط ProjectIDs الخاصة به

### السيناريو 2: إضافة منتج Domain لمشتري
1. المدير يضيف منتج domain للمشتري
2. يتم توليد PurchaseID فريد
3. يتم حفظ البيانات في كل من Firestore و RTDB مع معلومات المالك
4. المشتري يمكنه إضافة domains ضمن الحد المسموح
5. كل مشتري يرى فقط الـ domains الخاصة به

### السيناريو 3: عدة مشترين لديهم نفس المنتج
- كل مشتري لديه PurchaseID مختلف (للمنتجات من نوع domain)
- كل مشتري يرى فقط ProjectIDs الخاصة به (للمنتجات من نوع firebase)
- لا يوجد تداخل في البيانات بين المشترين

## البيانات القديمة

البيانات المحفوظة قبل هذا التحديث (بدون معلومات owner) لن تظهر للمستخدمين. إذا كنت تريد ترحيل البيانات القديمة:

1. قم بإضافة معلومات owner يدوياً للبيانات القديمة
2. أو قم بإعادة إنشاء البيانات من خلال النظام الجديد

## قواعد الأمان المقترحة (Security Rules)

```json
{
  "rules": {
    "licenses": {
      "apps": {
        "$productId": {
          "$projectId": {
            ".read": "auth != null && data.child('owner/did').val() === auth.uid",
            ".write": "auth != null && (!data.exists() || data.child('owner/did').val() === auth.uid)"
          }
        }
      },
      "domains": {
        "$productId": {
          "$purchaseId": {
            ".read": "auth != null && data.child('owner/did').val() === auth.uid",
            ".write": "auth != null && (!data.exists() || data.child('owner/did').val() === auth.uid)"
          }
        }
      }
    }
  }
}
```

## الخلاصة

✅ تم إضافة معلومات المالك (owner) لكل منتج في RTDB  
✅ كل مشتري يرى فقط البيانات الخاصة به  
✅ يتم حفظ معلومات owner عند إنشاء أي سجل جديد  
✅ يتم الحفاظ على معلومات owner عند التحديث  
✅ تم فصل بيانات المشترين بشكل كامل