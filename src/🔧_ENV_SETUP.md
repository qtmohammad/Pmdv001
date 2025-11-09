# 🔧 إعداد ملف .env - Environment Setup

## ✅ تم إنشاء ملف `.env`!

تم إنشاء ملف `.env` بقيم افتراضية. الآن تحتاج لتحديثه ببياناتك.

---

## 🚀 الخطوة 1: إعداد Firebase (مطلوب)

### 1. اذهب إلى Firebase Console:
https://console.firebase.google.com/

### 2. اختر مشروعك أو أنشئ واحد جديد

### 3. اذهب إلى Project Settings:
- انقر على أيقونة ⚙️ (Settings)
- اختر **Project Settings**

### 4. في قسم "Your apps"، انقر على أيقونة الويب `</>`

### 5. انسخ القيم وضعها في `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BPq...  # من Cloud Messaging
```

---

## 🖼️ الخطوة 2: إعداد Cloudinary (اختياري)

### إذا كنت تريد رفع الصور:

1. **أنشئ حساب مجاني**: https://cloudinary.com/users/register/free

2. **احصل على Cloud Name**:
   - بعد تسجيل الدخول، ستجده في Dashboard

3. **أنشئ Upload Preset**:
   - Settings > Upload > Add upload preset
   - اختر **Unsigned** ⚠️ مهم
   - احفظه

4. **أضف في `.env`**:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### إذا لم تكن بحاجة لرفع الصور الآن:

اترك القيم فارغة:
```env
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

✅ **المشروع سيعمل بدونها!**

---

## 🎯 بعد التحديث

1. **احفظ ملف `.env`**

2. **أعد تشغيل المشروع**:
```bash
# أوقف السيرفر (Ctrl + C)
# ثم شغّله مرة أخرى
npm run dev
```

3. **افتح المتصفح**:
```
http://localhost:5173
```

---

## 📋 قائمة التحقق

- [ ] تم إنشاء مشروع Firebase
- [ ] تم نسخ بيانات Firebase إلى `.env`
- [ ] تم إعداد Firebase Authentication
- [ ] تم إعداد Firestore Database
- [ ] تم إعداد Realtime Database
- [ ] (اختياري) تم إعداد Cloudinary
- [ ] تم حفظ `.env`
- [ ] تم إعادة تشغيل المشروع

---

## ⚠️ ملاحظات مهمة

### 1. أمان الملف
- ❌ **لا ترفع** ملف `.env` إلى Git
- ✅ الملف مُضاف تلقائياً في `.gitignore`
- ✅ استخدم `.env.example` كمرجع

### 2. المتغيرات المطلوبة
| المتغير | الحالة | الوصف |
|---------|--------|-------|
| `VITE_FIREBASE_*` | ✅ مطلوب | للمصادقة والبيانات |
| `VITE_CLOUDINARY_*` | ⚪ اختياري | لرفع الصور |

### 3. إعادة التشغيل
⚠️ **يجب إعادة تشغيل المشروع** بعد تعديل `.env`

---

## 🔍 التحقق من الإعداد

بعد التشغيل، تحقق من:

### ✅ إذا كان Firebase مُعد بشكل صحيح:
- صفحة تسجيل الدخول تظهر
- يمكنك إنشاء حساب
- يمكنك تسجيل الدخول

### ✅ إذا كان Cloudinary مُعد بشكل صحيح:
- صفحة الحساب > يمكنك رفع صورة شخصية
- لا توجد أخطاء في Console

### ❌ إذا ظهرت أخطاء:
1. تحقق من أن القيم صحيحة
2. تحقق من عدم وجود مسافات زائدة
3. تحقق من Firebase Rules (راجع `FIREBASE_SETUP.md`)

---

## 📚 أدلة مفيدة

- **إعداد Firebase الكامل**: `FIREBASE_SETUP.md`
- **إعداد Cloudinary**: `CLOUDINARY_SETUP.md`
- **قواعد Firebase**: `FIRESTORE_RULES.md`
- **قواعد Realtime DB**: `RTDB_RULES_SETUP.md`
- **حل المشاكل**: `TROUBLESHOOTING.md`

---

## 💡 نصائح

### للتطوير المحلي:
```env
# يمكنك استخدام قيم تطوير
VITE_FIREBASE_PROJECT_ID=my-dev-project
```

### للإنتاج:
```env
# استخدم مشروع Firebase منفصل
VITE_FIREBASE_PROJECT_ID=my-prod-project
```

### نسخ احتياطي:
```bash
# انسخ .env إلى مكان آمن
cp .env .env.backup

# لا ترفعه إلى Git!
```

---

## 🎉 جاهز!

بعد إعداد `.env` بشكل صحيح:
- ✅ المشروع سيعمل بدون أخطاء
- ✅ يمكنك تسجيل الدخول
- ✅ يمكنك إضافة منتجات
- ✅ يمكنك إنشاء تذاكر دعم
- ✅ (اختياري) يمكنك رفع الصور

---

**📅 التاريخ:** نوفمبر 2024  
**✅ الحالة:** جاهز للإعداد!
