# Firebase Setup Guide - دليل إعداد Firebase

## خطأ Realtime Database URL

إذا ظهر لك خطأ:
```
Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com
```

### الحل:

#### 1. تحديد الـ Database URL الصحيح

افتح Firebase Console واذهب إلى **Realtime Database**:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك `mobhm-l`
3. من القائمة الجانبية، اختر **Build** > **Realtime Database**
4. اضغط على **Create Database** إذا لم تكن قد أنشأت قاعدة بيانات بعد
5. اختر الموقع (Location):
   - **United States (us-central1)** - الافتراضي
   - أو أي موقع آخر
6. بعد الإنشاء، ستجد الـ URL في أعلى الصفحة

#### 2. أشكال الـ Database URL المختلفة

حسب المنطقة التي اخترتها، سيكون الـ URL بأحد الأشكال التالية:

**المنطقة الافتراضية (US):**
```
https://mobhm-l-default-rtdb.firebaseio.com
```

**مناطق أخرى (مثل أوروبا أو آسيا):**
```
https://mobhm-l-default-rtdb.europe-west1.firebasedatabase.app
https://mobhm-l-default-rtdb.asia-southeast1.firebasedatabase.app
```

#### 3. تحديث الكود

افتح ملف `/lib/firebase.ts` وتأكد من أن `databaseURL` صحيح:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCJMDrEQe39olcEidXcc7moMaYV_tqBT3c",
  authDomain: "mobhm-l.firebaseapp.com",
  projectId: "mobhm-l",
  storageBucket: "mobhm-l.firebasestorage.app",
  messagingSenderId: "581786490125",
  appId: "1:581786490125:web:267a396ee32b0c3792cc44",
  databaseURL: "YOUR_ACTUAL_DATABASE_URL_HERE" // <-- ضع الـ URL الصحيح هنا
};
```

### كيفية الحصول على الـ URL الصحيح:

#### الطريقة الأولى - من واجهة Realtime Database:
1. اذهب إلى Realtime Database في Firebase Console
2. انظر إلى شريط العنوان أعلى البيانات
3. ستجد الـ URL مكتوب مثل: `https://mobhm-l-default-rtdb.firebaseio.com`

#### الطريقة الثانية - من Project Settings:
1. اذهب إلى Project Settings (⚙️)
2. اختر تبويب **General**
3. في قسم **Your apps**، اختر تطبيق الويب
4. ستجد Config object كامل، انسخ قيمة `databaseURL`

### إذا لم يكن لديك Realtime Database بعد:

1. في Firebase Console، اذهب إلى **Realtime Database**
2. اضغط **Create Database**
3. اختر الموقع (يفضل نفس موقع Firestore)
4. اختر **Start in test mode** للتطوير (ستحتاج لتغيير القواعد لاحقًا)
5. بعد الإنشاء، انسخ الـ URL

## Security Rules

بعد إنشاء Realtime Database، قم بتحديث القواعد:

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

### شرح القواعد:
- **`.read: true`** - أي شخص يمكنه قراءة التراخيص (للتحقق من صحة الترخيص)
- **`.write: "$uid === auth.uid"`** - فقط المستخدم المالك يمكنه تعديل تراخيصه

## تحديد المدراء

في ملف `/contexts/AuthContext.tsx`، السطر 51:

```typescript
const ADMIN_UIDS = ['TH2TF7maQaWA8Q7YpKAKk6Yvbp02'];
```

هذا الـ UID يبدو صحيحًا. يمكنك إضافة المزيد من المدراء:

```typescript
const ADMIN_UIDS = [
  'TH2TF7maQaWA8Q7YpKAKk6Yvbp02',
  'ANOTHER_ADMIN_UID_HERE'
];
```

## تجربة الإعداد

بعد تحديث `databaseURL`:

1. احفظ الملف
2. أعد تحميل الصفحة
3. سجل الدخول
4. جرب إضافة ترخيص في صفحة "منتجاتي"

إذا استمرت المشكلة، تحقق من:
- Console في المتصفح (F12) للأخطاء التفصيلية
- أن Realtime Database تم تفعيله في Firebase Console
- أن الـ URL يتطابق تمامًا مع ما في Firebase Console
