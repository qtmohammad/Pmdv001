# استكشاف الأخطاء وإصلاحها - Troubleshooting

## ❌ خطأ: Permission Denied

### الرسالة الكاملة:
```
Error fetching user data: FirebaseError: Missing or insufficient permissions
```

### السبب:
قواعد أمان Firestore لا تسمح بالوصول للبيانات.

### ✅ الحل السريع:

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك → **Firestore Database** → تبويب **Rules**
3. انسخ القواعد من ملف [`firebase-rules-ready.txt`](./firebase-rules-ready.txt)
4. الصقها في محرر القواعد
5. اضغط **Publish**
6. أعد تحميل الصفحة

📖 **للتفاصيل الكاملة**: راجع [`FIRESTORE_RULES.md`](./FIRESTORE_RULES.md)

---

## ❌ خطأ: Cannot parse Firebase url

### الرسالة الكاملة:
```
@firebase/database: FIREBASE FATAL ERROR: Cannot parse Firebase url. 
Please use https://<YOUR FIREBASE>.firebaseio.com
```

### السبب:
هذا الخطأ يحدث لأحد الأسباب التالية:
1. **لم يتم إنشاء Realtime Database في Firebase Console**
2. **عنوان URL غير صحيح في الإعدادات**
3. **قاعدة البيانات في منطقة مختلفة**

---

## ✅ الحل الكامل خطوة بخطوة:

### الخطوة 1: إنشاء Realtime Database

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **mobhm-l**
3. من القائمة الجانبية: **Build** → **Realtime Database**
4. إذا رأيت زر **"Create Database"**:
   - اضغط عليه
   - اختر الموقع (Location):
     - **United States (us-central1)** - الأفضل للسرعة العالمية
     - أو اختر المنطقة الأقرب لمستخدميك
   - اختر **"Start in test mode"** للبداية
   - اضغط **Enable**

### الخطوة 2: الحصول على Database URL الصحيح

بعد إنشاء القاعدة، ستظهر واجهة البيانات. في أعلى الصفحة ستجد عنوان URL.

**انسخه بالكامل!** سيكون بأحد الأشكال التالية:

#### إذا اخترت المنطقة الافتراضية (US):
```
https://mobhm-l-default-rtdb.firebaseio.com
```

#### إذا اخترت منطقة أخرى (مثل أوروبا):
```
https://mobhm-l-default-rtdb.europe-west1.firebasedatabase.app
```

### الخطوة 3: تحديث الكود

افتح ملف `/lib/firebase.ts` وحدث `databaseURL`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCJMDrEQe39olcEidXcc7moMaYV_tqBT3c",
  authDomain: "mobhm-l.firebaseapp.com",
  projectId: "mobhm-l",
  storageBucket: "mobhm-l.firebasestorage.app",
  messagingSenderId: "581786490125",
  appId: "1:581786490125:web:267a396ee32b0c3792cc44",
  databaseURL: "الصق_الـURL_هنا" // <-- الصق الـ URL الذي نسخته
};
```

### الخطوة 4: حفظ وإعادة التحميل

1. احفظ الملف (Ctrl+S / Cmd+S)
2. أعد تحميل صفحة المتصفح (F5)
3. افتح Console (F12) وتحقق من عدم وجود أخطاء

---

## 🔒 إعداد Security Rules (مهم!)

بعد التأكد من عمل القاعدة، يجب تحديث قواعد الأمان:

1. في Firebase Console → Realtime Database
2. اذهب لتبويب **Rules**
3. استبدل القواعد الموجودة بالتالي:

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

4. اضغط **Publish**

### شرح القواعد:
- **`.read: true`**: أي شخص يمكنه قراءة التراخيص (للتحقق من صحتها في التطبيقات)
- **`.write: "$uid === auth.uid"`**: فقط المستخدم نفسه يمكنه تعديل تراخيصه

---

## 🧪 اختبار التكوين

بعد التحديث، جرب:

1. سجل الدخول للتطبيق
2. اذهب لصفحة "منتجاتي"
3. حاول إضافة ترخيص
4. إذا نجحت العملية، ستظهر رسالة "Added successfully!"

---

## 📋 طرق بديلة للحصول على Database URL

### الطريقة الأولى - من Project Settings:
1. Firebase Console → ⚙️ (Settings) → Project Settings
2. تبويب **General**
3. اذهب لقسم **Your apps** واختر تطبيق الويب
4. في **SDK setup and configuration**، اختر **Config**
5. ستجد الـ `databaseURL` في الكود

### الطريقة الثانية - من Realtime Database مباشرة:
1. افتح Realtime Database
2. انظر لشريط العنوان أعلى البيانات
3. الـ URL سيكون واضحًا هناك

---

## ⚠️ أخطاء شائعة أخرى

### خطأ: Permission Denied

**السبب**: قواعد الأمان تمنع الوصول

**الحل**: تحقق من Security Rules كما ذكرنا أعلاه

### خطأ: Network Error

**السبب**: مشكلة في الاتصال أو الـ API Key

**الحل**: 
- تحقق من اتصال الإنترنت
- تأكد من صحة `apiKey` في firebaseConfig

### البيانات لا تظهر

**السبب**: قد لا توجد بيانات بعد

**الحل**:
- جرب إضافة بيانات يدويًا من Firebase Console
- تحقق من Console في المتصفح للأخطاء

---

## 🆘 إذا استمرت المشكلة

1. افتح Console في المتصفح (F12)
2. ابحث عن رسائل الخطأ المفصلة
3. تحقق من:
   - أن Realtime Database تم إنشاؤه في Firebase Console
   - أن الـ URL صحيح 100%
   - أن لا يوجد مسافات إضافية في الـ URL
   - أن الـ URL يبدأ بـ `https://` وينتهي بـ `.com` أو `.app`

4. قارن الـ URL في الكود مع الـ URL في Firebase Console - يجب أن يكونا متطابقين **تمامًا**
