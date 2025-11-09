# قواعد أمان Firestore - Firestore Security Rules

## ❌ خطأ: Permission Denied

إذا رأيت رسالة الخطأ:
```
Error fetching user data: FirebaseError: Missing or insufficient permissions
```

هذا يعني أن قواعد أمان Firestore لا تسمح بالوصول للبيانات.

---

## ✅ الحل: تحديث Firestore Rules

### الخطوة 1: فتح Firestore Rules

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **mobhm-l**
3. من القائمة الجانبية: **Build** → **Firestore Database**
4. اذهب لتبويب **Rules**

### الخطوة 2: نسخ القواعد الصحيحة

استبدل القواعد الموجودة بالكود التالي:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/buyers/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Products collection
    // Anyone authenticated can read
    // Only admins can write
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Buyers collection
    // Users can read their own data
    // Admins can read and write all buyers
    match /buyers/{buyerId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == buyerId || isAdmin());
      allow create: if true; // Allow initial buyer creation
      allow update: if isAuthenticated() && 
                       (request.auth.uid == buyerId || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
```

### الخطوة 3: نشر القواعد

1. اضغط **Publish** في أعلى الصفحة
2. انتظر رسالة التأكيد

---

## 📋 شرح القواعد

### Products (المنتجات):
- **القراءة**: أي مستخدم مسجل دخول
- **الإضافة/التعديل/الحذف**: المدراء فقط

### Buyers (المشترين):
- **القراءة**: المستخدم نفسه أو المدراء
- **الإنشاء**: مسموح للجميع (للتسجيل الأولي)
- **التعديل**: المستخدم نفسه أو المدراء
- **الحذف**: المدراء فقط

---

## ⚠️ قواعد للتطوير فقط (Test Mode)

إذا كنت في مرحلة التطوير والاختبار، يمكنك استخدام هذه القواعد المؤقتة:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ تحذير**: هذه القواعد تسمح لأي مستخدم مسجل دخول بقراءة وكتابة أي بيانات. 
**لا تستخدمها في الإنتاج!**

---

## 🔒 تعيين المدراء

بعد تطبيق القواعد، تحتاج لتعيين المدراء:

### الطريقة 1: يدويًا في Firestore

1. اذهب إلى Firestore Database → Data
2. افتح collection `buyers`
3. اختر مستند المستخدم (بـ UID الخاص به)
4. أضف حقل جديد:
   - **Field**: `isAdmin`
   - **Type**: boolean
   - **Value**: `true`
5. احفظ التغييرات

### الطريقة 2: في الكود

في `/contexts/AuthContext.tsx`، السطر 51:

```typescript
const ADMIN_UIDS = ['TH2TF7maQaWA8Q7YpKAKk6Yvbp02'];
```

هذا الـ UID سيتم تعيينه كمدير تلقائيًا عند تسجيل الدخول.

---

## 🧪 اختبار القواعد

بعد تطبيق القواعد:

1. سجل خروج من التطبيق
2. سجل دخول مجددًا
3. يجب ألا تظهر رسالة الخطأ بعد الآن
4. جرب الوصول لصفحة "الحساب" - يجب أن تعمل بدون أخطاء

---

## 🔍 استكشاف الأخطاء

### الخطأ: "isAdmin is not a function"

**الحل**: تأكد من استخدام القواعد الصحيحة كما في الأعلى

### الخطأ: "Still getting permission denied"

**التحقق**:
1. هل تم نشر القواعد؟ (اضغط Publish)
2. هل المستخدم مسجل دخول؟
3. هل يوجد مستند للمستخدم في collection `buyers`؟

### الخطأ: "Cannot read isAdmin of undefined"

**السبب**: لا يوجد مستند للمستخدم في `buyers`

**الحل**: 
- سجل خروج وسجل دخول مجددًا (سيتم إنشاء المستند تلقائيًا)
- أو أضف المستند يدويًا في Firestore

---

## 📝 ملاحظات مهمة

1. **قواعد Firestore منفصلة عن Realtime Database**
   - لكل منهما قواعده الخاصة
   - تأكد من تطبيق قواعد كليهما

2. **التغييرات فورية**
   - عند نشر القواعد، تطبق فورًا
   - لا حاجة لإعادة تشغيل التطبيق

3. **الأمان**
   - لا تستخدم قواعد Test Mode في الإنتاج
   - راجع القواعد بانتظام لضمان الأمان

4. **المدراء**
   - تأكد من إضافة حقل `isAdmin: true` لحسابات المدراء في Firestore
   - UID في `AuthContext.tsx` يستخدم فقط في الكود، لكن القواعد تتحقق من حقل `isAdmin` في قاعدة البيانات
