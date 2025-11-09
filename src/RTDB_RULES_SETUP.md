# ⚡ إعداد قواعد Realtime Database السريع
# Quick Realtime Database Rules Setup

**الوقت المطلوب:** دقيقتان فقط ⏱️  
**Required Time:** Just 2 minutes

---

## 🚨 مهم جداً / Very Important

**يجب تحديث قواعد Realtime Database وإلا لن يعمل النظام!**

**You MUST update Realtime Database rules or the system won't work!**

---

## 📋 الخطوات / Steps

### الخطوة 1: افتح Firebase Console

1. اذهب إلى https://console.firebase.google.com
2. اختر مشروعك
3. من القائمة الجانبية، اختر **Realtime Database**

---

### الخطوة 2: افتح قسم القواعد / Rules

1. في صفحة Realtime Database، اختر تبويب **Rules** (القواعد)
2. سترى القواعد الحالية

---

### الخطوة 3: انسخ القواعد الجديدة

**انسخ الكود التالي بالكامل:**

```json
{
  "rules": {
    "licenses": {
      "apps": {
        "$productId": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['appIds'])",
          "appIds": {
            ".validate": "newData.isString() || (newData.hasChildren() && newData.val().length <= 1)"
          }
        }
      },
      "domains": {
        "$productId": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['domains'])",
          "domains": {
            ".validate": "newData.isString() || newData.hasChildren()"
          }
        }
      }
    }
  }
}
```

---

### الخطوة 4: الصق القواعد في Firebase

1. **احذف** جميع القواعد القديمة
2. **الصق** القواعد الجديدة التي نسختها أعلاه
3. انقر على زر **Publish** (نشر)

---

## ✅ التحقق من النجاح / Verify Success

بعد نشر القواعد، يجب أن ترى:

After publishing rules, you should see:

```
✓ Rules published successfully
```

---

## 🔍 اختبار القواعد / Test Rules

### 1. اختبار القراءة / Test Read

في Firebase Console، يمكنك اختبار القراءة:

Path: `/licenses/apps/test-product-id`  
Auth: Authenticated user  
**النتيجة المتوقعة:** ✅ Read allowed

---

### 2. اختبار الكتابة / Test Write

Path: `/licenses/apps/test-product-id`  
Auth: Authenticated user  
Data:
```json
{
  "appIds": ["1:123:android:abc"]
}
```
**النتيجة المتوقعة:** ✅ Write allowed

---

## ⚠️ أخطاء شائعة / Common Errors

### ❌ خطأ: "Permission Denied"

**السبب:** القواعد لم تُحدّث بشكل صحيح

**الحل:**
1. تأكد من نسخ القواعد بالكامل
2. تأكد من الضغط على "Publish"
3. جرّب تسجيل الخروج والدخول مرة أخرى

---

### ❌ خطأ: "Invalid JSON"

**السبب:** خطأ في نسخ القواعد

**الحل:**
1. تأكد من نسخ القواعد من بداية `{` إلى نهاية `}`
2. لا تنسخ أي نص قبل أو بعد الأقواس
3. استخدم زر "Copy" بدلاً من التحديد اليدوي

---

## 📖 شرح القواعد / Rules Explanation

### للتطبيقات / For Apps
```json
"apps": {
  "$productId": {
    ".read": "auth != null",    // يمكن القراءة لأي مستخدم مسجل
    ".write": "auth != null"    // يمكن الكتابة لأي مستخدم مسجل
  }
}
```

### للدومينات / For Domains
```json
"domains": {
  "$productId": {
    ".read": "auth != null",    // يمكن القراءة لأي مستخدم مسجل
    ".write": "auth != null"    // يمكن الكتابة لأي مستخدم مسجل
  }
}
```

**ملاحظة:** هذه قواعد أساسية. يمكنك تخصيصها حسب احتياجاتك.

**Note:** These are basic rules. You can customize them based on your needs.

---

## 🔐 قواعد أمان متقدمة (اختياري)

### Recommended Advanced Rules

إذا أردت قواعد أكثر أماناً، يمكنك استخدام:

If you want more secure rules, you can use:

```json
{
  "rules": {
    "licenses": {
      "apps": {
        "$productId": {
          ".read": "auth != null && (
            root.child('buyers').child(auth.uid).child('products').child($productId).exists() ||
            root.child('users').child(auth.uid).child('isAdmin').val() === true
          )",
          ".write": "auth != null && (
            root.child('buyers').child(auth.uid).child('products').child($productId).exists() ||
            root.child('users').child(auth.uid).child('isAdmin').val() === true
          )"
        }
      },
      "domains": {
        "$productId": {
          ".read": "auth != null && (
            root.child('buyers').child(auth.uid).child('products').child($productId).exists() ||
            root.child('users').child(auth.uid).child('isAdmin').val() === true
          )",
          ".write": "auth != null && (
            root.child('buyers').child(auth.uid).child('products').child($productId).exists() ||
            root.child('users').child(auth.uid).child('isAdmin').val() === true
          )"
        }
      }
    }
  }
}
```

**ملاحظة:** القواعد المتقدمة تتطلب بنية معينة في Firestore

**Note:** Advanced rules require specific structure in Firestore

---

## 🎯 نصائح / Tips

### 1. النسخ الاحتياطي / Backup
قبل التحديث، انسخ القواعد القديمة في ملف نصي

Before updating, copy old rules to a text file

### 2. الاختبار / Testing
بعد النشر، اختبر التطبيق فوراً

After publishing, test the application immediately

### 3. المراقبة / Monitoring
راقب تبويب "Usage" للتأكد من عدم وجود أخطاء

Monitor the "Usage" tab to ensure no errors

---

## 📞 مساعدة إضافية / Additional Help

### أين أجد المزيد من المعلومات؟

Where can I find more information?

- **للبنية الجديدة:** [`REALTIME_DATABASE_STRUCTURE.md`](./REALTIME_DATABASE_STRUCTURE.md)
- **لنقل البيانات:** [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
- **للنظرة العامة:** [`⚡_RTDB_STRUCTURE_UPDATE.md`](./⚡_RTDB_STRUCTURE_UPDATE.md)

---

## ✅ قائمة التحقق النهائية / Final Checklist

قبل الانتقال للخطوة التالية، تأكد من:

Before moving to the next step, make sure:

- [ ] فتحت Firebase Console > Realtime Database > Rules
      Opened Firebase Console > Realtime Database > Rules

- [ ] نسخت القواعد الجديدة بالكامل
      Copied new rules completely

- [ ] لصقت القواعد في Firebase
      Pasted rules in Firebase

- [ ] ضغطت على "Publish"
      Clicked "Publish"

- [ ] رأيت رسالة النجاح
      Saw success message

- [ ] اختبرت التطبيق
      Tested the application

---

## 🎉 تم الانتهاء! / Done!

إذا أكملت جميع الخطوات أعلاه، فإن قواعد Realtime Database جاهزة الآن!

If you completed all steps above, your Realtime Database rules are now ready!

**الخطوة التالية:** جرّب إضافة دومين أو App ID من التطبيق

**Next Step:** Try adding a domain or App ID from the application

---

**آخر تحديث:** 4 نوفمبر 2025  
**Last Updated:** November 4, 2025
