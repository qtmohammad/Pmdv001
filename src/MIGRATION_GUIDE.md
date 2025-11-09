# دليل نقل البيانات من البنية القديمة إلى الجديدة
# Migration Guide: Old Structure to New Structure

## 📋 نظرة عامة / Overview

إذا كان لديك بيانات محفوظة في البنية القديمة، يمكنك استخدام هذا الدليل لنقلها إلى البنية الجديدة.

If you have data saved in the old structure, you can use this guide to migrate it to the new structure.

---

## 🔄 البنية القديمة مقابل الجديدة / Old vs New Structure

### القديمة / Old:
```
licenses/
  {UserUID}/
    {ProductID}/
      appIds: [...]
      domains: [...]
```

### الجديدة / New:
```
licenses/
  apps/
    {ProductID}/
      appIds: [...]
  domains/
    {ProductID}/
      domains: [...]
```

---

## 🛠️ طريقة النقل اليدوي / Manual Migration

### الخطوة 1: تصدير البيانات القديمة / Export Old Data

1. افتح Firebase Console
   Open Firebase Console

2. انتقل إلى Realtime Database
   Navigate to Realtime Database

3. انقر على `licenses` واختر "Export JSON"
   Click on `licenses` and select "Export JSON"

4. احفظ الملف باسم `old-licenses.json`
   Save the file as `old-licenses.json`

---

### الخطوة 2: تحويل البيانات / Transform Data

استخدم السكريبت التالي في متصفح الويب أو Node.js:

Use the following script in a web browser or Node.js:

```javascript
// قراءة البيانات القديمة
// Read old data
const oldData = {
  "user123": {
    "product-abc": {
      "appIds": ["1:123:android:abc"],
      "domains": []
    }
  },
  "user456": {
    "product-xyz": {
      "appIds": [],
      "domains": ["example.com", "test.com"]
    }
  }
};

// تحويل إلى البنية الجديدة
// Transform to new structure
function migrateData(oldData) {
  const newData = {
    apps: {},
    domains: {}
  };

  // المرور على جميع المستخدمين
  // Loop through all users
  for (const userId in oldData) {
    const userProducts = oldData[userId];
    
    // المرور على جميع منتجات المستخدم
    // Loop through all user products
    for (const productId in userProducts) {
      const productData = userProducts[productId];
      
      // إذا كان المنتج يحتوي على appIds
      // If product contains appIds
      if (productData.appIds && productData.appIds.length > 0) {
        newData.apps[productId] = {
          appIds: productData.appIds
        };
      }
      
      // إذا كان المنتج يحتوي على domains
      // If product contains domains
      if (productData.domains && productData.domains.length > 0) {
        newData.domains[productId] = {
          domains: productData.domains
        };
      }
    }
  }

  return newData;
}

// تنفيذ التحويل
// Execute transformation
const newData = migrateData(oldData);
console.log(JSON.stringify(newData, null, 2));

// النتيجة ستكون:
// The result will be:
/*
{
  "apps": {
    "product-abc": {
      "appIds": ["1:123:android:abc"]
    }
  },
  "domains": {
    "product-xyz": {
      "domains": ["example.com", "test.com"]
    }
  }
}
*/
```

---

### الخطوة 3: استيراد البيانات الجديدة / Import New Data

1. انسخ البيانات الجديدة المُحولة
   Copy the transformed new data

2. في Firebase Console، انتقل إلى Realtime Database
   In Firebase Console, navigate to Realtime Database

3. انقر على `licenses` ثم انقر على الزر الثلاثي النقاط
   Click on `licenses` then click the three dots menu

4. اختر "Import JSON"
   Select "Import JSON"

5. الصق البيانات الجديدة واختر "Merge"
   Paste the new data and select "Merge"

---

## 🔥 استخدام Firebase Admin SDK (للمطورين المتقدمين)

### For Advanced Developers

إذا كنت تفضل استخدام كود برمجي لنقل البيانات:

If you prefer using code to migrate data:

```javascript
const admin = require('firebase-admin');

// تهيئة Firebase Admin
// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.database();

async function migrateData() {
  try {
    // قراءة البيانات القديمة
    // Read old data
    const oldDataSnapshot = await db.ref('licenses').once('value');
    const oldData = oldDataSnapshot.val();

    if (!oldData) {
      console.log('No data to migrate');
      return;
    }

    const newData = {
      apps: {},
      domains: {}
    };

    // تحويل البيانات
    // Transform data
    for (const userId in oldData) {
      const userProducts = oldData[userId];
      
      for (const productId in userProducts) {
        const productData = userProducts[productId];
        
        if (productData.appIds && productData.appIds.length > 0) {
          newData.apps[productId] = {
            appIds: productData.appIds
          };
        }
        
        if (productData.domains && productData.domains.length > 0) {
          newData.domains[productId] = {
            domains: productData.domains
          };
        }
      }
    }

    // حفظ البيانات الجديدة
    // Save new data
    await db.ref('licenses').set(newData);
    
    console.log('Migration completed successfully!');
    console.log('New data:', JSON.stringify(newData, null, 2));

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// تنفيذ النقل
// Execute migration
migrateData();
```

---

## ⚠️ تحذيرات مهمة / Important Warnings

1. **عمل نسخة احتياطية أولاً**
   **Backup First**
   
   قبل أي تعديل، قم بتصدير نسخة كاملة من قاعدة البيانات
   Before any changes, export a complete backup of your database

2. **التضارب في البيانات**
   **Data Conflicts**
   
   إذا كان نفس المنتج مُسند لأكثر من مستخدم في البنية القديمة، ستحتاج لتحديد أي بيانات تريد الاحتفاظ بها
   If the same product is assigned to multiple users in the old structure, you'll need to decide which data to keep

3. **اختبار التطبيق**
   **Test the Application**
   
   بعد النقل، تأكد من اختبار جميع وظائف التطبيق
   After migration, make sure to test all application functions

4. **قواعد الأمان**
   **Security Rules**
   
   لا تنسى تحديث قواعد Realtime Database (راجع ملف `realtime-database-rules.json`)
   Don't forget to update Realtime Database rules (see `realtime-database-rules.json` file)

---

## ✅ قائمة التحقق بعد النقل / Post-Migration Checklist

- [ ] تم نسخ احتياطي للبيانات القديمة
      Old data backed up

- [ ] تم تحويل البيانات إلى البنية الجديدة
      Data transformed to new structure

- [ ] تم استيراد البيانات الجديدة بنجاح
      New data imported successfully

- [ ] تم تحديث قواعد Realtime Database
      Realtime Database rules updated

- [ ] تم اختبار التطبيق والتأكد من عمله بشكل صحيح
      Application tested and working correctly

- [ ] تم حذف البيانات القديمة (اختياري)
      Old data deleted (optional)

---

## 🔍 التحقق من النقل / Verify Migration

للتأكد من نجاح النقل، تحقق من:

To verify successful migration, check:

1. افتح Firebase Console > Realtime Database
   Open Firebase Console > Realtime Database

2. تحقق من وجود المسارات الجديدة:
   Verify new paths exist:
   - `licenses/apps/{productId}`
   - `licenses/domains/{productId}`

3. تحقق من البيانات داخل كل منتج
   Verify data within each product

4. جرّب إضافة وحذف دومين/app ID من التطبيق
   Try adding and removing a domain/app ID from the application

---

## 📞 الدعم / Support

إذا واجهت أي مشاكل أثناء النقل:

If you encounter any issues during migration:

1. راجع البيانات الأصلية المُصدرة
   Review the original exported data

2. تأكد من أن قواعد Realtime Database محدثة
   Ensure Realtime Database rules are updated

3. تحقق من أذونات المستخدم
   Check user permissions

4. راجع console logs للأخطاء
   Review console logs for errors

---

## 🚨 في حالة حدوث خطأ / In Case of Error

إذا حدث خطأ أثناء النقل:

If an error occurs during migration:

1. **لا تقم بحذف البيانات القديمة**
   **Do not delete old data**

2. أعد استيراد النسخة الاحتياطية
   Restore the backup

3. راجع الأخطاء وحاول مرة أخرى
   Review errors and try again

4. يمكنك النقل تدريجياً (منتج واحد في كل مرة)
   You can migrate gradually (one product at a time)

---

**آخر تحديث:** 4 نوفمبر 2025  
**Last Updated:** November 4, 2025
