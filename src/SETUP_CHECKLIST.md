# قائمة التحقق من الإعداد - Setup Checklist

استخدم هذه القائمة للتأكد من إعداد كل شيء بشكل صحيح.

---

## ✅ القائمة الكاملة

### 1. Firebase Configuration

- [ ] تم تحديث `apiKey` في `/lib/firebase.ts`
- [ ] تم تحديث `projectId` في `/lib/firebase.ts`
- [ ] تم تحديث `databaseURL` في `/lib/firebase.ts`
- [ ] جميع بيانات Firebase صحيحة من Project Settings

**ملف**: `/lib/firebase.ts`

---

### 2. Firestore Database

- [ ] تم إنشاء Firestore Database في Firebase Console
- [ ] تم نسخ Security Rules من `firebase-rules-ready.txt`
- [ ] تم لصق القواعد في: Firestore → Rules
- [ ] تم الضغط على **Publish**
- [ ] لا توجد أخطاء في القواعد

**التحقق**: حاول تسجيل الدخول - يجب ألا تظهر رسالة "Permission Denied"

---

### 3. Firestore Indexes (مطلوب لنظام الحد اليومي)

🚨 **مهم جداً**: مطلوب لعمل نظام حد التذاكر اليومية!

**اختر إحدى الطرق:**

#### الطريقة 1: من رابط الخطأ (الأسهل)
- [ ] افتح التطبيق وسجل دخول
- [ ] افتح صفحة الدعم الفني
- [ ] افتح Console (F12)
- [ ] انسخ الرابط من رسالة الخطأ "The query requires an index"
- [ ] افتح الرابط واضغط "Create Index"
- [ ] انتظر 2-3 دقائق حتى يصبح Enabled

#### الطريقة 2: Firebase CLI (موصى به)
- [ ] تثبيت Firebase CLI: `npm install -g firebase-tools`
- [ ] تسجيل الدخول: `firebase login`
- [ ] تنفيذ: `firebase deploy --only firestore:indexes`
- [ ] انتظر رسالة "Deploy complete!"

#### الطريقة 3: يدوياً من Firebase Console
- [ ] Firebase Console → Firestore Database → Indexes
- [ ] Create Index
- [ ] Collection: `supportTickets`
- [ ] Fields: `userId` (Ascending), `createdAt` (Ascending)
- [ ] اضغط Create

**ملف المساعدة**: راجع `/FIRESTORE_INDEX_QUICK_FIX.md` للتفاصيل

**التحقق**: افتح صفحة الدعم - لا يجب أن ترى خطأ "requires an index" في Console

---

### 4. Realtime Database

- [ ] تم إنشاء Realtime Database في Firebase Console
- [ ] تم نسخ Database URL الصحيح
- [ ] تم تحديث `databaseURL` في `/lib/firebase.ts`
- [ ] تم نسخ Security Rules من `firebase-rules-ready.txt`
- [ ] تم لصق القواعد في: Realtime Database → Rules
- [ ] تم الضغط على **Publish**

**التحقق**: حاول إضافة ترخيص - يجب أن تنجح العملية

---

### 5. Firebase Authentication

- [ ] تم تفعيل Email/Password في Authentication → Sign-in method
- [ ] لا توجد قيود على النطاقات المسموح بها

**المسار**: Firebase Console → Authentication → Sign-in method

---

### 6. تعيين المدير

**اختر إحدى الطريقتين:**

#### الطريقة الأولى: من الكود
- [ ] تم الحصول على UID الخاص بحسابك
- [ ] تم تحديث `ADMIN_UIDS` في `/contexts/AuthContext.tsx` السطر 51
- [ ] تم حفظ الملف

#### الطريقة الثانية: من Firestore
- [ ] تم التسجيل بحساب عادي أولاً
- [ ] تم فتح Firestore → collection `buyers`
- [ ] تم إضافة حقل `isAdmin: true` للمستند الخاص بك
- [ ] تم الحفظ

**التحقق**: بعد تسجيل الدخول، يجب أن ترى "لوحة الإدارة" في Sidebar

---

### 7. إنشاء البيانات الأولية

- [ ] تم تسجيل الدخول كمدير
- [ ] تم إنشاء منتج واحد على الأقل في "إضافة منتجات"
- [ ] تم إضافة مشتري واحد على الأقل في "إدارة المشترين"
- [ ] تم تعيين منتج للمشتري

---

### 8. الاختبار

- [ ] تم تسجيل الخروج من حساب المدير
- [ ] تم تسجيل الدخول بحساب المشتري
- [ ] تم فتح "منتجاتي" - يجب أن تظهر المنتجات المعينة
- [ ] تم تجربة إضافة ترخيص (App ID أو Domain)
- [ ] نجحت العملية وظهرت رسالة "Added successfully!"

---

## 🔍 التحقق السريع

افتح Console في المتصفح (F12) وتحقق من:

### ✅ علامات النجاح:
```
✅ Realtime Database initialized successfully
```

### ❌ علامات المشاكل:
```
❌ Failed to initialize Realtime Database
🔒 FIRESTORE PERMISSION ERROR
```

إذا رأيت علامات المشاكل، راجع الأقسام ذات الصلة أعلاه.

---

## 📊 حالة الإعداد

ضع علامة ✓ على كل بند أعلاه. عندما تكتمل جميع البنود:

- **الحالة**: ✅ الإعداد مكتمل!
- **الخطوة التالية**: ابدأ باستخدام التطبيق

---

## 🆘 المساعدة

إذا لم يكتمل أي بند:

| البند | المرجع |
|-------|---------|
| Firebase Config | `FIREBASE_SETUP.md` |
| Firestore Rules | `FIRESTORE_RULES.md` |
| Realtime Database | `TROUBLESHOOTING.md` |
| جميع الخطوات | `QUICK_START.md` |

---

## 🎯 الخطوات السريعة (TL;DR)

للمتعجلين:

```bash
1. انسخ firebase config إلى /lib/firebase.ts
2. انسخ قواعد Firestore من firebase-rules-ready.txt وانشرها
3. انسخ قواعد Realtime DB من firebase-rules-ready.txt وانشرها
4. فعّل Email/Password في Authentication
5. عيّن نفسك كمدير في AuthContext.tsx أو Firestore
6. سجل دخول وابدأ إضافة المنتجات والمشترين
```

تم! 🎉
