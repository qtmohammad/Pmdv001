# 🎯 الهيكل الجديد لـ Realtime Database
# 🎯 New Realtime Database Structure

## 📋 نظرة عامة / Overview

تم تحديث هيكل Realtime Database لاستخدام معرفات مخصصة بدلاً من معرف المستخدم:
- **للتطبيقات (Firebase Apps)**: ProjectID (يدخله المستخدم)
- **للدومينات (Domains)**: PurchaseID (يتم إنشاؤه تلقائياً)

The Realtime Database structure has been updated to use custom identifiers instead of user ID:
- **For Firebase Apps**: ProjectID (entered by user)
- **For Domains**: PurchaseID (automatically generated)

---

## 🏗️ الهيكل الجديد / New Structure

### 1️⃣ منتجات التطبيقات (Firebase Apps)

```
licenses/apps/{ProductID}/{ProjectID}/
├── isActive: boolean
├── expiryType: 'lifetime' | 'date'
└── expiryDate?: string (if expiryType is 'date')
```

**ملاحظة:** لا يوجد حقل appIds - فقط معرف المشروع (ProjectID) في المسار

#### مثال / Example:
```json
{
  "licenses": {
    "apps": {
      "APP-001": {
        "my-firebase-proj": {
          "isActive": true,
          "expiryType": "lifetime"
        },
        "another-project-id": {
          "isActive": true,
          "expiryType": "date",
          "expiryDate": "2025-12-31"
        },
        "dev-project": {
          "isActive": true,
          "expiryType": "lifetime"
        }
      }
    }
  }
}
```

---

### 2️⃣ منتجات الدومينات (Domain Products)

```
licenses/domains/{ProductID}/{PurchaseID}/
├── isActive: boolean
└── domains: string[]
```

#### مثال / Example:
```json
{
  "licenses": {
    "domains": {
      "DOMAIN-001": {
        "ma9sa323rf": {
          "isActive": true,
          "domains": ["example.com", "example.net"]
        },
        "kb7td192ps": {
          "isActive": true,
          "domains": ["mysite.com"]
        }
      }
    }
  }
}
```

---

## 🔑 المعرفات المستخدمة / Used Identifiers

### ProductID
- **الوصف / Description**: معرف المنتج المخصص الذي يدخله المدير / Custom product ID entered by admin
- **مثال / Example**: `APP-001`, `DOMAIN-001`, `FIREBASE-PRO`
- **متطلبات / Requirements**: يجب أن يكون فريد / Must be unique
- **يُحفظ في / Stored in**: Firestore (products collection) & Firestore (buyers → products)

### ProjectID (للتطبيقات فقط / For Apps Only)
- **الوصف / Description**: معرف مشروع Firebase الذي يدخله المستخدم / Firebase Project ID entered by user
- **مثال / Example**: `my-firebase-project`, `app-prod-2024`
- **من يدخله / Entered by**: المستخدم من صفحة "منتجاتي" / User from "My Products" page
- **يُحفظ في / Stored in**: Realtime Database only

### PurchaseID (للدومينات فقط / For Domains Only)
- **الوصف / Description**: معرف شراء فريد يتم إنشاؤه تلقائياً / Unique purchase ID automatically generated
- **الطول / Length**: 10 أحرف / 10 characters
- **الأحرف / Characters**: حروف إنجليزية صغيرة (a-z) + أرقام (0-9) / Lowercase letters (a-z) + numbers (0-9)
- **مثال / Example**: `ma9sa323rf`, `kb7td192ps`, `x4y9z2a8b5`
- **من ينشئه / Created by**: النظام تلقائياً عند تعيين منتج دومين لمشتري / System automatically when assigning domain product
- **يُحفظ في / Stored in**: Firestore (buyers → products) & Realtime Database

---

## 📊 الفرق بين الهيكل القديم والجديد / Old vs New Structure

### ❌ الهيكل القديم (Old Structure)
```json
{
  "licenses": {
    "apps": {
      "ProductID": {
        "UserID": {
          "isActive": true,
          "appIds": [...]
        }
      }
    },
    "domains": {
      "ProductID": {
        "UserID": {
          "isActive": true,
          "domains": [...]
        }
      }
    }
  }
}
```

### ✅ الهيكل الجديد (New Structure)
```json
{
  "licenses": {
    "apps": {
      "ProductID": {
        "ProjectID": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": [...]
        }
      }
    },
    "domains": {
      "ProductID": {
        "PurchaseID": {
          "isActive": true,
          "domains": [...]
        }
      }
    }
  }
}
```

---

## 🔄 تدفق العمل / Workflow

### 1️⃣ تعيين منتج تطبيق لمشتري / Assign Firebase App to Buyer

```
📝 المدير / Admin:
1. يفتح "إدارة المشترين" / Opens "Manage Buyers"
2. يختار مشتري / Selects a buyer
3. يضغط "تعيين منتجات" / Clicks "Assign Products"
4. يختار منتج تطبيق (ProductID) / Selects a Firebase app product
5. يختار خطة / Selects a plan
6. يختار حالة المنتج (active/inactive) / Sets product status
7. يختار نوع الصلاحية (lifetime/date) / Sets validity type
8. إذا كانت date، يختار تاريخ الانتهاء / If date, sets expiry date

💾 يتم الحفظ في / Saved in:
- ✅ Firestore: buyers/{UserID}/products
  {
    productId: "APP-001",
    planId: "plan-1",
    isActive: true,
    expiryType: "lifetime"
  }
- ❌ Realtime Database: لا شيء / Nothing (saved when user enters ProjectID)
```

### 2️⃣ تعيين منتج دومين لمشتري / Assign Domain Product to Buyer

```
📝 المدير / Admin:
1. يفتح "إدارة المشترين" / Opens "Manage Buyers"
2. يختار مشتري / Selects a buyer
3. يضغط "تعيين منتجات" / Clicks "Assign Products"
4. يختار منتج دومين (ProductID) / Selects a domain product
5. يختار خطة / Selects a plan
6. يدخل عدد الدومينات المسموح بها / Enters allowed domains count
7. يختار حالة المنتج (active/inactive) / Sets product status

💾 يتم الحفظ في / Saved in:
- ✅ Firestore: buyers/{UserID}/products
  {
    productId: "DOMAIN-001",
    planId: "plan-1",
    allowedDomains: 5,
    isActive: true,
    purchaseId: "ma9sa323rf"  ← تلقائياً / Auto-generated
  }
- ✅ Realtime Database: licenses/domains/DOMAIN-001/ma9sa323rf
  {
    isActive: true,
    domains: []
  }
```

### 3️⃣ المستخدم يدير منتج تطبيق / User Manages Firebase App

```
👤 المستخدم / User:
1. يفتح "منتجاتي" / Opens "My Products"
2. يرى قائمة منتجاته / Sees product list
3. لمنتج التطبيق / For Firebase app:
   - يرى قائمة معرفات المشاريع المضافة (إن وجدت)
   - كل عنصر يعرض فقط: ProjectID
   
4. لإضافة معرف مشروع جديد / To add new Project ID:
   a. يضغط "إضافة" / Clicks "Add"
   b. في الحوار / In dialog:
      - يدخل ProjectID / Enters ProjectID
   c. يضغط "إضافة" / Clicks "Add"
   
💾 يتم الحفظ في / Saved in:
- ✅ Realtime Database: licenses/apps/{ProductID}/{ProjectID}
  {
    isActive: true,
    expiryType: "lifetime"
  }

5. لحذف معرف مشروع / To delete Project ID:
   - يضغط زر الحذف / Clicks delete button
   - يتم حذف المسار بالكامل من RTDB / Entire path deleted from RTDB
   - licenses/apps/{ProductID}/{ProjectID} (removed)
```

### 4️⃣ المستخدم يدير منتج دومين / User Manages Domain Product

```
👤 المستخدم / User:
1. يفتح "منتجاتي" / Opens "My Products"
2. يرى قائمة منتجاته / Sees product list
3. لمنتجات الدومين / For domain products:
   - PurchaseID موجود بالفعل في Firestore / PurchaseID already exists in Firestore
   - يتم تحميل البيانات تلقائياً من RTDB / Data loaded automatically from RTDB
   
💾 يتم قراءة من / Read from:
- ✅ Realtime Database: licenses/domains/{ProductID}/{PurchaseID}

4. يمكن للمستخدم / User can:
   - إضافة دومين (ضمن الحد المسموح) / Add domain (within limit)
   - حذف دومين / Delete domain

💾 يتم الحفظ في / Saved in:
- ✅ Realtime Database: licenses/domains/{ProductID}/{PurchaseID}
```

---

## 🎨 واجهة المستخدم / User Interface

### صفحة "منتجاتي" - منتج تطبيق / "My Products" - Firebase App

```
┌─────────────────────────────────────┐
│ 📱 Firebase App Pro                 │
│ ───────────────────────────────────│
│                                     │
│ مشاريع Firebase: 3 مشاريع          │
│                          [+ إضافة] │
│                                     │
│ • my-firebase-project         [🗑️] │
│ • another-project             [🗑️] │
│ • dev-project                 [🗑️] │
└─────────────────────────────────────┘

حوار إضافة معرف مشروع / Add Project ID Dialog:
┌─────────────────────────────────────┐
│ إضافة معرف مشروع                   │
│ ───────────────────────────────────│
│                                     │
│ معرف مشروع Firebase                │
│ [my-firebase-project____________] │
│ أدخل معرف مشروع Firebase الخاص بك │
│                                     │
│              [إضافة]               │
└─────────────────────────────────────┘
```

### صفحة "منتجاتي" - منتج دومين / "My Products" - Domain

```
┌─────────────────────────────────────┐
│ 🌐 Domain License Pro               │
│ ───────────────────────────────────│
│                                     │
│ الدومينات: 2 / 5 مستخدم            │
│                          [+ إضافة] │
│                                     │
│ • example.com             [🗑️]     │
│ • mysite.net              [🗑️]     │
└─────────────────────────────────────┘
```

---

## 💡 الفوائد / Benefits

### 1️⃣ مرونة أكبر للمستخدم / Greater User Flexibility
✅ يمكن للمستخدم إدارة عدة مشاريع Firebase بنفس المنتج
✅ User can manage multiple Firebase projects with same product
✅ لا حاجة لإعادة الشراء لكل مشروع
✅ No need to repurchase for each project

### 2️⃣ عزل أفضل للبيانات / Better Data Isolation
✅ كل مشروع Firebase له بياناته المستقلة
✅ Each Firebase project has independent data
✅ سهولة نقل البيانات بين المشاريع
✅ Easy to transfer data between projects

### 3️⃣ تتبع أفضل للدومينات / Better Domain Tracking
✅ كل عملية شراء لها PurchaseID فريد
✅ Each purchase has unique PurchaseID
✅ سهولة تتبع وإدارة المبيعات
✅ Easy to track and manage sales

### 4️⃣ بساطة في الكود / Code Simplicity
✅ لا حاجة لاستخدام UserID في RTDB
✅ No need to use UserID in RTDB
✅ الكود أكثر وضوحاً وسهولة في الصيانة
✅ Code is clearer and easier to maintain

---

## 🧪 أمثلة عملية / Practical Examples

### مثال 1: مستخدم لديه منتج تطبيق واحد مع 3 مشاريع
### Example 1: User with 1 app product and 3 projects

```json
{
  "licenses": {
    "apps": {
      "APP-001": {
        "project-dev": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": ["1:111:android:dev"]
        },
        "project-staging": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": ["1:222:android:staging"]
        },
        "project-production": {
          "isActive": true,
          "expiryType": "date",
          "expiryDate": "2025-12-31",
          "appIds": ["1:333:android:prod"]
        }
      }
    }
  }
}
```

### مثال 2: مستخدم لديه منتجي دومين
### Example 2: User with 2 domain products

```json
{
  "licenses": {
    "domains": {
      "DOMAIN-BASIC": {
        "ab12cd34ef": {
          "isActive": true,
          "domains": ["site1.com", "site2.com"]
        }
      },
      "DOMAIN-PRO": {
        "xy98zw76uv": {
          "isActive": true,
          "domains": [
            "mainsite.com",
            "blog.mainsite.com",
            "shop.mainsite.com",
            "api.mainsite.com"
          ]
        }
      }
    }
  }
}
```

---

## 🔍 استعلامات شائعة / Common Queries

### 1. الحصول على جميع مشاريع منتج معين / Get all projects for a product
```javascript
const projectsRef = ref(rtdb, `licenses/apps/${productId}`);
const snapshot = await get(projectsRef);
const projects = snapshot.val(); // {projectId1: {...}, projectId2: {...}}
```

### 2. الحصول على بيانات مشروع محدد / Get specific project data
```javascript
const projectRef = ref(rtdb, `licenses/apps/${productId}/${projectId}`);
const snapshot = await get(projectRef);
const data = snapshot.val();
```

### 3. إضافة App ID لمشروع / Add App ID to project
```javascript
const appIdsRef = ref(rtdb, `licenses/apps/${productId}/${projectId}/appIds`);
const snapshot = await get(appIdsRef);
const currentAppIds = snapshot.val() || [];
await set(appIdsRef, [...currentAppIds, newAppId]);
```

### 4. الحصول على جميع عمليات شراء دومين لمنتج / Get all domain purchases for a product
```javascript
const purchasesRef = ref(rtdb, `licenses/domains/${productId}`);
const snapshot = await get(purchasesRef);
const purchases = snapshot.val(); // {purchaseId1: {...}, purchaseId2: {...}}
```

### 5. إضافة دومين لعملية شراء / Add domain to purchase
```javascript
const domainsRef = ref(rtdb, `licenses/domains/${productId}/${purchaseId}/domains`);
const snapshot = await get(domainsRef);
const currentDomains = snapshot.val() || [];
await set(domainsRef, [...currentDomains, newDomain]);
```

---

## ⚠️ ملاحظات هامة / Important Notes

### للمطورين / For Developers

1. **لا تستخدم UserID في RTDB أبداً / Never use UserID in RTDB**
   - للتطبيقات: استخدم ProjectID / For apps: use ProjectID
   - للدومينات: استخدم PurchaseID / For domains: use PurchaseID

2. **ProductID يجب أن يكون فريد / ProductID must be unique**
   - تحقق من عدم وجود ProductID مكرر قبل الإنشاء
   - Check for duplicate ProductID before creation

3. **PurchaseID يتم إنشاؤه تلقائياً / PurchaseID is auto-generated**
   - لا تحاول إنشائه يدوياً / Don't try to create manually
   - يتم إنشاؤه فقط للدومينات / Created only for domains

4. **ProjectID يدخله المستخدم / ProjectID entered by user**
   - لا يتم حفظه في Firestore / Not saved in Firestore
   - يتم استخدامه فقط في RTDB / Used only in RTDB

### للمدراء / For Admins

1. **اختر معرف منتج واضح / Choose clear product ID**
   - مثال جيد / Good: `APP-BASIC`, `DOMAIN-PRO-2024`
   - مثال سيئ / Bad: `abc123`, `prod1`

2. **لا يمكن تغيير ProductID / Cannot change ProductID**
   - بعد الإنشاء، لا يمكن تعديله / Cannot edit after creation
   - تأكد من صحته قبل الحفظ / Verify before saving

3. **للدومينات: حدد عدد الدومينات بدقة / For domains: set domain count carefully**
   - لا يمكن زيادته إلا بتحديث يدوي
   - Can only be increased by manual update

---

## ✅ ما تم إنجازه / What Was Done

1. ✅ تحديث `AuthContext.tsx` - إضافة purchaseId
2. ✅ تحديث `ManageBuyersPage.tsx`:
   - إضافة دالة generatePurchaseId
   - تحديث handleAssignProduct
   - تحديث handleUpdateProductDetails
   - تحديث removeProductFromBuyer
3. ✅ تحديث `MyProductsPage.tsx`:
   - إضافة state لـ projectIds
   - إضافة دالة loadProjectData
   - تحديث loadProducts
   - تحديث addLicenseItem
   - تحديث removeLicenseItem
   - إضافة UI لإدخال ProjectID
4. ✅ تحديث `LanguageContext.tsx` - إضافة الترجمات

---

## 🚀 الخطوات التالية / Next Steps

1. ✅ اختبر تعيين منتج تطبيق / Test assigning Firebase app
2. ✅ اختبر تعيين منتج دومين / Test assigning domain product
3. ✅ اختبر إدخال ProjectID وإضافة App IDs / Test entering ProjectID and adding App IDs
4. ✅ اختبر إضافة وحذف الدومينات / Test adding/removing domains
5. ⏳ تحديث قواعد RTDB إذا لزم الأمر / Update RTDB rules if needed

---

**تاريخ التحديث / Update Date:** 5 نوفمبر 2025 / November 5, 2025

🎉 **الهيكل الجديد جاهز للاستخدام!**  
🎉 **New structure ready to use!**
