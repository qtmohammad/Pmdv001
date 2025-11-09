# ✅ تطبيق ProjectID في حوار إضافة App ID
# ✅ ProjectID Implementation in Add App ID Dialog

## 📋 التحديثات المطبقة / Applied Updates

### 1️⃣ تعديل واجهة البيانات / Data Interface Update

```typescript
// قبل / Before
interface LicenseData {
  appIds?: string[];
  domains?: string[];
}

// بعد / After
interface AppIdEntry {
  projectId: string;
  appId: string;
}

interface LicenseData {
  appIds?: AppIdEntry[];  // ← Changed from string[] to AppIdEntry[]
  domains?: string[];
}
```

### 2️⃣ تحديث State

```typescript
// تمت إزالة / Removed
const [projectIds, setProjectIds] = useState<Record<string, string>>({});

// تمت الإضافة / Added
const [newProjectId, setNewProjectId] = useState('');
```

---

## 🔄 تدفق العمل الجديد / New Workflow

### للمستخدم / For User

#### 1. فتح حوار إضافة App ID / Open Add App ID Dialog
```
المستخدم يضغط "إضافة" → يفتح حوار
User clicks "Add" → Dialog opens
```

#### 2. ملء البيانات / Fill Data
```
┌─────────────────────────────────────┐
│ إضافة معرف تطبيق                   │
│ Add App ID                         │
│ ───────────────────────────────────│
│                                     │
│ معرف مشروع Firebase                │
│ Firebase Project ID                │
│ [my-firebase-project____________] │
│ أدخل معرف مشروع Firebase الخاص بك │
│ Enter your Firebase project ID    │
│                                     │
│ معرف التطبيق                       │
│ App ID                             │
│ [1:123456789:android:abc123____] │
│                                     │
│              [إضافة]               │
│              [Add]                 │
└─────────────────────────────────────┘
```

#### 3. الحفظ / Save
```
✅ يتحقق النظام من:
   1. ProjectID ليس فارغاً
   2. App ID ليس فارغاً
   3. هذا ProjectID لا يحتوي بالفعل على App ID

✅ System checks:
   1. ProjectID is not empty
   2. App ID is not empty
   3. This ProjectID doesn't already have an App ID
```

#### 4. النتيجة / Result
```
💾 يتم الحفظ في RTDB / Saved in RTDB:
licenses/apps/{ProductID}/{ProjectID}/
{
  "isActive": true,
  "expiryType": "lifetime",
  "appIds": ["1:123456789:android:abc123"]
}

📱 يتم عرضه في الواجهة / Displayed in UI:
┌─────────────────────────────────────┐
│ معرف المشروع: my-firebase-project  │
│ Project ID: my-firebase-project    │
│ معرف التطبيق:                      │
│ App ID:                            │
│ 1:123456789:android:abc123    [🗑️] │
└─────────────────────────────────────┘
```

---

## 💻 التحديثات البرمجية / Code Updates

### 1. تحميل البيانات / Load Data

```typescript
// في loadProducts()
if (product.type === 'firebase') {
  // Load all projects for this product
  const appLicenseRef = ref(rtdb, `licenses/apps/${userProduct.productId}`);
  const snapshot = await get(appLicenseRef);
  const appIds: AppIdEntry[] = [];
  
  if (snapshot.exists()) {
    const projectsData = snapshot.val();
    // Loop through all ProjectIDs
    for (const [projectId, data] of Object.entries(projectsData)) {
      const projectData = data as any;
      if (projectData.appIds && Array.isArray(projectData.appIds)) {
        projectData.appIds.forEach((appId: string) => {
          appIds.push({ projectId, appId });
        });
      }
    }
  }
  
  licensesData[userProduct.productId] = { 
    appIds  // ← Array of {projectId, appId}
  };
}
```

### 2. إضافة App ID / Add App ID

```typescript
const addLicenseItem = async (productId: string, type: 'appIds' | 'domains') => {
  if (product.type === 'firebase') {
    // Require ProjectID input
    if (!newProjectId.trim()) {
      toast.error(t('pleaseEnterProjectId'));
      return;
    }
    
    const projectId = newProjectId.trim();
    const appId = newItem.trim();
    
    // Check if this project already has an App ID
    const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectId}`);
    const snapshot = await get(licenseRef);
    const existingData = snapshot.val() || {};
    const existingAppIds = existingData.appIds || [];
    
    if (existingAppIds.length >= 1) {
      toast.error('Maximum 1 App ID per project');
      return;
    }
    
    // Save to RTDB
    const updatedData = {
      isActive: true,
      expiryType: 'lifetime',
      appIds: [appId]
    };
    
    await set(licenseRef, updatedData);
    
    // Update local state
    const currentAppIds = licenses[productId]?.appIds || [];
    setLicenses({
      ...licenses,
      [productId]: {
        ...licenses[productId],
        appIds: [...currentAppIds, { projectId, appId }]
      }
    });
  }
};
```

### 3. حذف App ID / Delete App ID

```typescript
const removeLicenseItem = async (productId: string, type: 'appIds' | 'domains', index: number) => {
  if (product.type === 'firebase' && type === 'appIds') {
    // Get projectId from the item being removed
    const currentAppIds = licenses[productId]?.appIds || [];
    const itemToRemove = currentAppIds[index];
    
    if (!itemToRemove) return;
    
    const { projectId, appId } = itemToRemove;
    const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectId}`);
    
    // Remove the entire project node
    await remove(licenseRef);
    
    // Update local state
    const updatedAppIds = currentAppIds.filter((_, i) => i !== index);
    setLicenses({
      ...licenses,
      [productId]: {
        ...licenses[productId],
        appIds: updatedAppIds
      }
    });
  }
};
```

### 4. واجهة العرض / Display UI

```tsx
<div className="space-y-2">
  {license.appIds?.map((item, index) => (
    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Project ID */}
          <p className="text-xs text-gray-500 mb-1">{t('projectId')}:</p>
          <p className="text-sm font-medium truncate" dir="ltr">
            {item.projectId}
          </p>
          
          {/* App ID */}
          <p className="text-xs text-gray-500 mt-2 mb-1">{t('appId')}:</p>
          <p className="text-sm truncate" dir="ltr">
            {item.appId}
          </p>
        </div>
        
        {/* Delete Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeLicenseItem(product.productId, 'appIds', index)}
          className="flex-shrink-0"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  ))}
  
  {(!license.appIds || license.appIds.length === 0) && (
    <p className="text-sm text-gray-500">{t('noAppIdsAdded')}</p>
  )}
</div>
```

---

## 🎯 الفوائد / Benefits

### ✅ سهولة الاستخدام / Ease of Use
- المستخدم يدخل كل المعلومات في مكان واحد
- User enters all info in one place
- لا حاجة لحقول منفصلة
- No need for separate fields

### ✅ وضوح أفضل / Better Clarity
- كل App ID مرتبط بوضوح مع ProjectID الخاص به
- Each App ID clearly linked to its ProjectID
- سهل التتبع والإدارة
- Easy to track and manage

### ✅ تجربة مستخدم محسنة / Improved UX
- عرض واضح ومنظم
- Clear and organized display
- سهل الفهم والاستخدام
- Easy to understand and use

---

## 📊 مثال عملي / Practical Example

### سيناريو: مستخدم لديه 3 مشاريع Firebase

```json
{
  "licenses": {
    "apps": {
      "APP-PRO": {
        "dev-project": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": ["1:111:android:devapp"]
        },
        "staging-project": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": ["1:222:android:stagingapp"]
        },
        "prod-project": {
          "isActive": true,
          "expiryType": "date",
          "expiryDate": "2025-12-31",
          "appIds": ["1:333:android:prodapp"]
        }
      }
    }
  }
}
```

### عرض في الواجهة / Display in UI

```
📱 Firebase App Pro
───────────────────────────────────

معرفات التطبيقات: 3 مستخدم         [+ إضافة]

┌────────────────────────────────┐
│ معرف المشروع: dev-project     │
│ معرف التطبيق:                  │
│ 1:111:android:devapp      [🗑️] │
└────────────────────────────────┘

┌────────────────────────────────┐
│ معرف المشروع: staging-project │
│ معرف التطبيق:                  │
│ 1:222:android:stagingapp  [🗑️] │
└────────────────────────────────┘

┌────────────────────────────────┐
│ معرف المشروع: prod-project    │
│ معرف التطبيق:                  │
│ 1:333:android:prodapp     [🗑️] │
└────────────────────────────────┘
```

---

## ✅ ما تم إنجازه / What Was Done

1. ✅ تحديث واجهة `LicenseData` لاستخدام `AppIdEntry[]`
2. ✅ إضافة حقل ProjectID في حوار إضافة App ID
3. ✅ تحديث `loadProducts()` لتحميل البيانات من جميع المشاريع
4. ✅ تحديث `addLicenseItem()` للحفظ بالهيكل الجديد
5. ✅ تحديث `removeLicenseItem()` للحذف حسب ProjectID
6. ✅ تحديث واجهة العرض لإظهار ProjectID + App ID
7. ✅ إضافة الترجمات المطلوبة
8. ✅ إزالة حقل إدخال ProjectID المنفصل
9. ✅ تحديث التوثيق

---

## 🧪 اختبار / Testing

### خطوات الاختبار / Test Steps

1. **إضافة App ID جديد / Add New App ID**
   ```
   ✅ فتح حوار الإضافة
   ✅ إدخال ProjectID
   ✅ إدخال App ID
   ✅ الضغط على "إضافة"
   ✅ التحقق من الحفظ في RTDB
   ✅ التحقق من العرض في الواجهة
   ```

2. **إضافة عدة مشاريع / Add Multiple Projects**
   ```
   ✅ إضافة ProjectID مختلف
   ✅ إضافة App ID جديد
   ✅ التحقق من ظهور كلا المشروعين
   ```

3. **محاولة إضافة App ID ثاني لنفس المشروع / Try Adding 2nd App ID to Same Project**
   ```
   ✅ إدخال نفس ProjectID
   ✅ محاولة إضافة App ID آخر
   ✅ التحقق من ظهور رسالة خطأ
   ```

4. **حذف App ID / Delete App ID**
   ```
   ✅ الضغط على زر الحذف
   ✅ التحقق من الحذف من RTDB
   ✅ التحقق من الإزالة من الواجهة
   ```

5. **إعادة تحميل الصفحة / Reload Page**
   ```
   ✅ تحديث الصفحة
   ✅ التحقق من تحميل جميع المشاريع
   ✅ التحقق من صحة البيانات المعروضة
   ```

---

## 🚀 الخطوات التالية / Next Steps

1. ✅ **تم التطبيق** - اختبر إضافة App IDs
2. ✅ **تم التطبيق** - اختبر حذف App IDs
3. ⏳ تحديث قواعد RTDB إذا لزم الأمر
4. ⏳ اختبار مع بيانات حقيقية

---

**تاريخ التحديث / Update Date:** 5 نوفمبر 2025 / November 5, 2025

🎉 **التطبيق جاهز للاستخدام!**  
🎉 **Implementation ready to use!**
