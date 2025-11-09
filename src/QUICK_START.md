# دليل البدء السريع - Quick Start Guide

## 🚀 خطوات التشغيل

### 1️⃣ إعداد Firestore Database

#### إنشاء Firestore (إذا لم يكن موجودًا):

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **mobhm-l**
3. من القائمة: **Build** → **Firestore Database**
4. اضغط **Create database**
5. اختر الموقع (Location) - يفضل نفس منطقة المستخدمين
6. اختر **Start in production mode** أو **Test mode**
7. اضغط **Enable**

#### تطبيق Security Rules:

1. في Firestore Database، اذهب لتبويب **Rules**
2. انسخ القواعد من ملف `/FIRESTORE_RULES.md`
3. الصقها في محرر القواعد
4. اضغط **Publish**

✅ **القواعد للإنتاج** (موصى بها):
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/buyers/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    match /buyers/{buyerId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == buyerId || isAdmin());
      allow create: if true;
      allow update: if isAuthenticated() && 
                       (request.auth.uid == buyerId || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
```

⚠️ **للتطوير فقط** (أسهل لكن أقل أمانًا):
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

---

### 2️⃣ إعداد Realtime Database

1. في Firebase Console: **Build** → **Realtime Database**
2. اضغط **Create Database**
3. اختر الموقع
4. اختر **Start in test mode**
5. بعد الإنشاء، انسخ الـ **Database URL** من أعلى الصفحة

#### مثال على الـ URL:
```
https://mobhm-l-default-rtdb.firebaseio.com
```

#### تحديث الكود:
افتح `/lib/firebase.ts` وضع الـ URL:
```typescript
databaseURL: "الصق_الـURL_هنا"
```

#### تطبيق Security Rules:

في Realtime Database، تبويب **Rules**:
```json
{
  "rules": {
    "licenses": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

### 3️⃣ تعيين مدير النظام

#### الطريقة 1: من الكود (قبل التسجيل)

في `/contexts/AuthContext.tsx`، السطر 51:
```typescript
const ADMIN_UIDS = ['UID_الخاص_بك_هنا'];
```

للحصول على الـ UID:
1. سجل دخول بحساب عادي أولاً
2. افتح Console في المتصفح (F12)
3. اكتب: `firebase.auth().currentUser.uid`
4. انسخ الـ UID وضعه في `ADMIN_UIDS`

#### الطريقة 2: من Firestore مباشرة

1. سجل دخول بحساب عادي أولاً
2. اذهب إلى Firestore Database → Data
3. افتح collection `buyers`
4. اختر المستند الخاص بك
5. أضف حقل:
   - **Field name**: `isAdmin`
   - **Type**: boolean
   - **Value**: ✓ (true)
6. احفظ

---

### 4️⃣ إنشاء أول مشتري

كمدير، يمكنك إضافة مشترين:

1. سجل دخول كمدير
2. اذهب إلى صفحة **"إدارة المشترين"**
3. اضغط **"إضافة مشتري"**
4. أدخل:
   - الاسم
   - البريد الإلكتروني
5. احفظ

الآن المشتري يمكنه التسجيل باستخدام نفس البريد.

---

### 5️⃣ إنشاء أول منتج

1. سجل دخول كمدير
2. اذهب إلى صفحة **"إضافة منتجات"**
3. املأ البيانات:
   - اسم المنتج
   - النوع (Firebase App / Domain License)
   - الوصف
4. أضف خطة واحدة على الأقل:
   - اسم الخطة (Basic, Pro, etc.)
   - السعر
   - المميزات
5. احفظ

---

### 6️⃣ تعيين منتج لمشتري

1. اذهب إلى **"إدارة المشترين"**
2. اختر مشتري
3. اضغط زر **"Assign"**
4. اختر:
   - المنتج
   - الخطة
   - عدد الدومينات (إذا كان النوع Domain License)
5. احفظ

---

## ✅ التحقق من التشغيل

### اختبار كامل:

1. **سجل خروج** من حساب المدير
2. **سجل دخول** بحساب مشتري
3. اذهب إلى **"منتجاتي"**
4. جرب **إضافة ترخيص**:
   - للـ Firebase App: أضف App ID
   - للـ Domain License: أضف Domain
5. يجب أن تظهر رسالة **"Added successfully!"**

---

## 🔧 استكشاف الأخطاء

### خطأ: Permission Denied
➡️ راجع `/FIRESTORE_RULES.md`

### خطأ: Cannot parse Firebase url
➡️ راجع `/TROUBLESHOOTING.md`

### البيانات لا تظهر
✓ تحقق من Console (F12) للأخطاء
✓ تحقق من Security Rules
✓ تأكد من تسجيل الدخول بنجاح

---

## 📁 هيكل البيانات

### Firestore Collections:

#### `products/`:
```javascript
{
  name: "Product Name",
  type: "firebase" | "domain",
  description: "Description",
  plans: [
    {
      id: "plan-1",
      name: "Basic",
      price: "$99",
      features: ["Feature 1", "Feature 2"]
    }
  ],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

#### `buyers/`:
```javascript
{
  name: "Buyer Name",
  email: "buyer@example.com",
  isAdmin: false, // true للمدراء
  products: [
    {
      productId: "product-id",
      planId: "plan-id",
      allowedDomains: 5 // فقط للـ domain type
    }
  ],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Realtime Database:

```json
{
  "licenses": {
    "USER_UID": {
      "PRODUCT_ID": {
        "appIds": ["1:123:android:abc"],
        "domains": ["example.com"]
      }
    }
  }
}
```

---

## 🎯 الخطوات التالية

بعد التشغيل الأولي:

1. ✅ أضف المزيد من المنتجات
2. ✅ أضف المزيد من المشترين  
3. ✅ جرب تعيين منتجات متعددة لنفس المشتري
4. ✅ اختبر الحدود (عدد الدومينات المسموح بها)
5. ✅ غيّر اللغة والثيم للتأكد من التصميم

---

## 📞 المساعدة

إذا واجهت مشاكل:

1. افتح Console (F12) وتحقق من الأخطاء
2. راجع `/TROUBLESHOOTING.md`
3. راجع `/FIRESTORE_RULES.md`
4. راجع `/FIREBASE_SETUP.md`

تأكد من:
- ✓ Firebase config صحيح في `/lib/firebase.ts`
- ✓ Firestore Rules تم نشرها
- ✓ Realtime Database Rules تم نشرها
- ✓ تم تعيين حساب كمدير
