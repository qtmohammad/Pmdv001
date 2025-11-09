# ✅ نظام معرفات المشاريع المبسط
# ✅ Simplified Project IDs System

## 📋 الهيكل النهائي / Final Structure

### لمنتجات Firebase Apps

```
licenses/apps/{ProductID}/{ProjectID}/
├── isActive: boolean
├── expiryType: 'lifetime' | 'date'
└── expiryDate?: string (if expiryType is 'date')
```

**بسيط وواضح:** فقط معرف المشروع (ProjectID) بدون أي حقول إضافية!

---

## 🔄 التدفق / Workflow

### 1. عرض المنتج / Display Product

```typescript
interface LicenseData {
  projectIds?: string[];  // قائمة معرفات المشاريع فقط
  domains?: string[];
}
```

### 2. إضافة معرف مشروع / Add Project ID

```
👤 المستخدم يضغط "إضافة" / User clicks "Add"
   ↓
📝 يدخل ProjectID / Enters ProjectID
   "my-firebase-project"
   ↓
💾 يحفظ في RTDB / Saves to RTDB
   licenses/apps/{ProductID}/my-firebase-project/
   {
     isActive: true,
     expiryType: "lifetime"
   }
   ↓
✅ يظهر في القائمة / Shows in list
```

### 3. حذف معرف مشروع / Delete Project ID

```
👤 المستخدم يضغط 🗑️ / User clicks delete
   ↓
🔥 يحذف المسار بالكامل / Deletes entire path
   licenses/apps/{ProductID}/{ProjectID}
   ↓
✅ يزال من القائمة / Removed from list
```

---

## 💻 الكود / Code

### تحميل البيانات / Load Data

```typescript
if (product.type === 'firebase') {
  // Load all project IDs for this product
  const appLicenseRef = ref(rtdb, `licenses/apps/${userProduct.productId}`);
  const snapshot = await get(appLicenseRef);
  const projectIds: string[] = [];
  
  if (snapshot.exists()) {
    const projectsData = snapshot.val();
    // Get all ProjectID keys
    projectIds.push(...Object.keys(projectsData));
  }
  
  licensesData[userProduct.productId] = { 
    projectIds  // Array of project IDs
  };
}
```

### إضافة معرف مشروع / Add Project ID

```typescript
const addLicenseItem = async (productId: string, type: 'projectIds' | 'domains') => {
  if (product.type === 'firebase') {
    if (!newProjectId.trim()) {
      toast.error(t('pleaseEnterProjectId'));
      return;
    }
    
    const projectId = newProjectId.trim();
    
    // Check if this project ID already exists
    const currentProjectIds = licenses[productId]?.projectIds || [];
    if (currentProjectIds.includes(projectId)) {
      toast.error(t('projectIdAlreadyExists'));
      return;
    }
    
    // Save to RTDB
    const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectId}`);
    const updatedData = {
      isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
      expiryType: userProduct.expiryType || 'lifetime',
      ...(userProduct.expiryDate && { expiryDate: userProduct.expiryDate })
    };
    
    await set(licenseRef, updatedData);
    
    // Update local state
    setLicenses({
      ...licenses,
      [productId]: {
        ...licenses[productId],
        projectIds: [...currentProjectIds, projectId]
      }
    });
    
    toast.success(t('addedSuccessfully'));
  }
};
```

### حذف معرف مشروع / Delete Project ID

```typescript
const removeLicenseItem = async (productId: string, type: 'projectIds' | 'domains', index: number) => {
  if (product.type === 'firebase' && type === 'projectIds') {
    const currentProjectIds = licenses[productId]?.projectIds || [];
    const projectIdToRemove = currentProjectIds[index];
    
    if (!projectIdToRemove) return;
    
    // Remove the entire project node
    const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectIdToRemove}`);
    await remove(licenseRef);
    
    // Update local state
    const updatedProjectIds = currentProjectIds.filter((_, i) => i !== index);
    setLicenses({
      ...licenses,
      [productId]: {
        ...licenses[productId],
        projectIds: updatedProjectIds
      }
    });
    
    toast.success(t('removedSuccessfully'));
  }
};
```

---

## 🎨 واجهة المستخدم / User Interface

### عرض قائمة المشاريع / Display Projects List

```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <div>
      <Label>{t('firebaseProjects')}</Label>
      <p className="text-xs text-gray-500">
        {license.projectIds?.length || 0} {t('projects')}
      </p>
    </div>
    <Dialog open={dialogOpen === `${product.productId}-projectIds`}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={showWarning}>
          <Plus className="w-4 h-4" />
          {t('add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addProjectId')}</DialogTitle>
          <DialogDescription>{t('addFirebaseProjectId')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('firebaseProjectId')}</Label>
            <Input
              placeholder="my-firebase-project"
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('enterProjectIdDesc')}
            </p>
          </div>
          <Button onClick={() => addLicenseItem(product.productId, 'projectIds')}>
            {t('add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  
  {/* قائمة المشاريع / Projects List */}
  <div className="space-y-2">
    {license.projectIds?.map((projectId, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <span className="text-sm font-medium truncate flex-1" dir="ltr">
          {projectId}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeLicenseItem(product.productId, 'projectIds', index)}
          disabled={showWarning}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    ))}
    
    {(!license.projectIds || license.projectIds.length === 0) && (
      <p className="text-sm text-gray-500">{t('noProjectsAdded')}</p>
    )}
  </div>
</div>
```

---

## 📊 مثال عملي / Practical Example

### مستخدم لديه 3 مشاريع Firebase

#### في RTDB:
```json
{
  "licenses": {
    "apps": {
      "APP-PRO": {
        "dev-project": {
          "isActive": true,
          "expiryType": "lifetime"
        },
        "staging-project": {
          "isActive": true,
          "expiryType": "lifetime"
        },
        "prod-project": {
          "isActive": true,
          "expiryType": "date",
          "expiryDate": "2025-12-31"
        }
      }
    }
  }
}
```

#### في الواجهة:
```
┌─────────────────────────────────────┐
│ 📱 Firebase App Pro                 │
│ ───────────────────────────────────│
│ مشاريع Firebase: 3 مشاريع          │
│                          [+ إضافة] │
│                                     │
│ • dev-project                 [🗑️] │
│ • staging-project             [🗑️] │
│ • prod-project                [🗑️] │
└─────────────────────────────────────┘
```

---

## 🎯 الفوائد / Benefits

### ✅ البساطة / Simplicity
- **بسيط جداً:** فقط معرف المشروع
- **Very simple:** Just project ID
- لا حقول معقدة
- No complex fields

### ✅ الوضوح / Clarity
- **واضح:** ماذا تخزن
- **Clear:** What you store
- سهل الفهم
- Easy to understand

### ✅ سهولة الإدارة / Easy Management
- **إضافة سريعة:** حقل واحد فقط
- **Quick add:** Only one field
- حذف فوري
- Instant delete

### ✅ الأداء / Performance
- **سريع:** لا بيانات زائدة
- **Fast:** No extra data
- استعلامات أبسط
- Simpler queries

---

## 📝 الترجمات / Translations

### إضافات جديدة / New Additions

```typescript
firebaseProjects: { ar: 'مشاريع Firebase', en: 'Firebase Projects' },
projects: { ar: 'مشاريع', en: 'projects' },
addProjectId: { ar: 'إضافة معرف مشروع', en: 'Add Project ID' },
addFirebaseProjectId: { ar: 'أضف معرف مشروع Firebase جديد', en: 'Add a new Firebase project ID' },
noProjectsAdded: { ar: 'لم يتم إضافة أي مشاريع', en: 'No projects added' },
projectIdAlreadyExists: { ar: 'معرف المشروع موجود مسبقاً', en: 'Project ID already exists' },
pleaseEnterProjectId: { ar: 'الرجاء إدخال معرف المشروع', en: 'Please enter Project ID' },
```

---

## ✅ ما تم إنجازه / What Was Completed

1. ✅ تحديث واجهة `LicenseData` - إزالة `AppIdEntry`
2. ✅ تبسيط State - إزالة `newItem`، إضافة `newDomain`
3. ✅ تحديث `loadProducts()` - جلب قائمة ProjectIDs فقط
4. ✅ تحديث `addLicenseItem()` - إضافة ProjectID بدون appIds
5. ✅ تحديث `removeLicenseItem()` - حذف ProjectID
6. ✅ تبسيط واجهة المستخد�� - عرض قائمة بسيطة
7. ✅ تحديث الحوار - حقل واحد فقط
8. ✅ إضافة التحقق من التكرار
9. ✅ تحديث الترجمات
10. ✅ تحديث التوثيق

---

## 🧪 اختبار / Testing

### خطوات الاختبار / Test Steps

#### 1. إضافة معرف مشروع / Add Project ID
```
✅ فتح حوار الإضافة
✅ إدخال ProjectID: "my-project"
✅ الضغط على "إضافة"
✅ التحقق من الحفظ في RTDB
✅ التحقق من الظهور في القائمة
```

#### 2. محاولة إضافة معرف مشروع مكرر / Try Adding Duplicate
```
✅ محاولة إضافة نفس ProjectID
✅ التحقق من ظهور رسالة خطأ
✅ عدم الحفظ في RTDB
```

#### 3. إضافة عدة مشاريع / Add Multiple Projects
```
✅ إضافة "dev-project"
✅ إضافة "staging-project"
✅ إضافة "prod-project"
✅ التحقق من ظهور جميع المشاريع
```

#### 4. حذف معرف مشروع / Delete Project ID
```
✅ الضغط على زر الحذف لمشروع
✅ التحقق من الحذف من RTDB
✅ التحقق من الإزالة من القائمة
```

#### 5. إعادة تحميل الصفحة / Reload Page
```
✅ تحديث الصفحة
✅ التحقق من تحميل جميع المشاريع
✅ التحقق من صحة البيانات
```

---

## 📍 الهيكل النهائي مقابل القديم / Final vs Old Structure

### ❌ القديم / Old (معقد)
```json
{
  "licenses": {
    "apps": {
      "APP-001": {
        "my-project": {
          "isActive": true,
          "expiryType": "lifetime",
          "appIds": ["1:123:android:abc"]  // ← غير ضروري
        }
      }
    }
  }
}
```

### ✅ الجديد / New (بسيط)
```json
{
  "licenses": {
    "apps": {
      "APP-001": {
        "my-project": {
          "isActive": true,
          "expiryType": "lifetime"
          // ← لا حقول إضافية!
        },
        "another-project": {
          "isActive": true,
          "expiryType": "lifetime"
        }
      }
    }
  }
}
```

---

## 🚀 الاستخدام / Usage

### للمطورين / For Developers

```typescript
// Get user's project IDs for a product
const projectIds = licenses[productId]?.projectIds || [];

// Check if user has any projects
if (projectIds.length > 0) {
  console.log(`User has ${projectIds.length} projects`);
}

// Check if specific project exists
if (projectIds.includes('my-project')) {
  console.log('User has access to my-project');
}
```

### للمستخدمين / For Users

1. **لإضافة مشروع جديد:**
   - اضغط زر "إضافة"
   - أدخل معرف مشروع Firebase
   - اضغط "إضافة"

2. **لحذف مشروع:**
   - اضغط زر 🗑️ بجانب المشروع
   - تم!

---

**تاريخ التحديث / Update Date:** 5 نوفمبر 2025  
**الحالة / Status:** ✅ جاهز للاستخدام / Ready to Use

🎉 **النظام الآن أبسط وأسرع!**  
🎉 **System is now simpler and faster!**
