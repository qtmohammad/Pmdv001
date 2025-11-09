# نظام العضويات - Membership System

## نظرة عامة - Overview

تم إضافة نظام عضويات متكامل يسمح بالتحكم في عدد تذاكر الدعم الفني المسموح بها يومياً لكل مستخدم حسب نوع عضويته.

A comprehensive membership system has been added that allows controlling the number of daily support tickets allowed per user based on their membership type.

---

## أنواع العضويات - Membership Types

### 1. عضو مشترك - Regular Member
- النوع الافتراضي لجميع المستخدمين الجدد
- Default type for all new users
- يحصل على عدد محدود من التذاكر اليومية (افتراضياً: 1 تذكرة)
- Gets a limited number of daily tickets (default: 1 ticket)

### 2. عضو مميز - Premium Member
- نوع عضوية محسّنة للمستخدمين المميزين
- Enhanced membership type for premium users
- يحصل على عدد أكبر من التذاكر اليومية (افتراضياً: 2 تذكرة)
- Gets more daily tickets (default: 2 tickets)

---

## إدارة العضويات - Membership Management

### صفحة إدارة العضويات - Manage Memberships Page
يمكن للمدير الوصول إليها من القائمة الجانبية
Admin can access it from the sidebar menu

**المميزات - Features:**

1. **عرض إحصائيات العضويات**
   - Display membership statistics
   - إجمالي عدد المشترين
   - Total number of buyers
   - عدد الأعضاء المميزين
   - Number of premium members
   - عدد الأعضاء المشتركين
   - Number of regular members

2. **إعدادات الحدود اليومية**
   - Daily limits settings
   - تغيير عدد التذاكر المسموح بها للأعضاء المميزين
   - Change allowed tickets for premium members
   - تغيير عدد التذاكر المسموح بها للأعضاء المشتركين
   - Change allowed tickets for regular members
   - يتم تطبيق التغييرات فوراً على جميع المستخدمين
   - Changes apply immediately to all users

3. **إدارة عضويات المشترين**
   - Manage buyers' memberships
   - عرض قائمة بجميع المشترين مع نوع عضويتهم
   - Display list of all buyers with their membership type
   - تغيير نوع العضوية لأي مشتري
   - Change membership type for any buyer

---

## كيفية الاستخدام - How to Use

### للمدير - For Admin:

#### 1. تغيير إعدادات الحدود اليومية
**Change daily limits settings:**

1. اذهب إلى "إدارة العضويات" من القائمة الجانبية
   - Go to "Manage Memberships" from the sidebar
2. اضغط على زر "إعدادات العضويات"
   - Click "Membership Settings" button
3. أدخل الحد الأقصى الجديد لكل نوع عضوية
   - Enter new limit for each membership type
4. اضغط "تحديث الإعدادات"
   - Click "Update Settings"

#### 2. تغيير نوع عضوية مشتري
**Change buyer's membership type:**

1. اذهب إلى "إدارة العضويات"
   - Go to "Manage Memberships"
2. ابحث عن المشتري في الجدول
   - Find the buyer in the table
3. اضغط زر "تعديل" بجانب اسم المشتري
   - Click "Edit" button next to buyer's name
4. اختر نوع العضوية الجديد
   - Select new membership type
5. اضغط "تحديث"
   - Click "Update"

### للمستخدم - For User:

**عرض حد التذاكر اليومي:**
**View daily ticket limit:**

- يتم عرض نوع العضوية وعدد التذاكر المسموح بها في أعلى صفحة الدعم الفني
- Membership type and allowed tickets are displayed at the top of the support page

**محاولة إنشاء تذكرة جديدة:**
**Trying to create a new ticket:**

- إذا وصل المستخدم إلى الحد اليومي، سيظهر له تنبيه
- If user reaches daily limit, an alert will be shown
- يمكنه المحاولة مرة أخرى في اليوم التالي
- Can try again the next day

---

## البنية التقنية - Technical Structure

### Firestore Collections:

#### 1. مجموعة settings
**settings collection:**

```
settings/
  membershipSettings/
    premiumDailyLimit: number    // حد التذاكر للأعضاء المميزين
    regularDailyLimit: number    // حد التذاكر للأعضاء المشتركين
    updatedAt: string            // تاريخ آخر تحديث
```

#### 2. مجموعة buyers (محدثة)
**buyers collection (updated):**

```
buyers/
  {userId}/
    membershipType: 'premium' | 'regular'  // نوع العضوية
    ... (باقي البيانات)
```

### الملفات الجديدة - New Files:

1. `/components/ManageMembershipsPage.tsx`
   - صفحة إدارة العضويات
   - Memberships management page

2. `/lib/membershipSettings.ts`
   - دوال مساعدة لإدارة إعدادات العضويات
   - Helper functions for membership settings

### الملفات المحدثة - Updated Files:

1. `/contexts/AuthContext.tsx`
   - إضافة حقل membershipType
   - Added membershipType field

2. `/components/SupportPage.tsx`
   - التحقق من حد التذاكر اليومي
   - Daily ticket limit check
   - عرض معلومات العضوية
   - Display membership info

3. `/App.tsx`
   - إضافة مسار صفحة إدارة العضويات
   - Added membership management page route

4. `/components/Layout.tsx`
   - إضافة رابط إدارة العضويات للمدير
   - Added membership management link for admin

5. `/contexts/LanguageContext.tsx`
   - إضافة مفاتيح الترجمة للعربية والإنجليزية
   - Added translation keys for Arabic and English

---

## قواعد الأمان - Security Rules

تأكد من إضافة قواعد الأمان التالية في Firestore:
Make sure to add the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد مجموعة settings
    // Settings collection rules
    match /settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/buyers/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // باقي القواعد...
    // Other rules...
  }
}
```

---

## الإعدادات الافتراضية - Default Settings

عند أول استخدام للنظام، سيتم إنشاء الإعدادات التالية تلقائياً:
On first use, the following settings will be created automatically:

- **حد العضو المميز - Premium Member Limit:** 2 تذاكر يومياً / 2 tickets per day
- **حد العضو المشترك - Regular Member Limit:** 1 تذكرة يومياً / 1 ticket per day

---

## ملاحظات مهمة - Important Notes

1. **إعادة تعيين العداد اليومي:**
   **Daily counter reset:**
   - يتم إعادة تعيين عدد التذاكر تلقائياً في بداية كل يوم (منتصف الليل)
   - Ticket count is automatically reset at the start of each day (midnight)

2. **تطبيق التغييرات:**
   **Applying changes:**
   - التغييرات في إعدادات الحدود تُطبق فوراً على جميع المستخدمين
   - Changes to limit settings apply immediately to all users
   - التغييرات في نوع العضوية تُطبق فوراً على المستخدم المحدد
   - Changes to membership type apply immediately to the specific user

3. **توافق الأنظمة:**
   **System compatibility:**
   - النظام متوافق تماماً مع نظام الدعم الفني الحالي
   - System is fully compatible with the current support system
   - لا يؤثر على التذاكر القديمة
   - Does not affect old tickets

---

## استكشاف الأخطاء - Troubleshooting

### المشكلة: لا تظهر إعدادات العضويات
**Issue: Membership settings don't appear**

**الحل - Solution:**
1. تأكد من تسجيل الدخول كمدير
   - Make sure you're logged in as admin
2. تحقق من قواعد الأمان في Firestore
   - Check Firestore security rules

### المشكلة: لا يتم تطبيق الحد اليومي
**Issue: Daily limit is not applied**

**الحل - Solution:**
1. تحقق من وجود مجموعة settings في Firestore
   - Check that settings collection exists in Firestore
2. تأكد من وجود مستند membershipSettings
   - Make sure membershipSettings document exists

### المشكلة: خطأ في الصلاحيات عند تحديث الإعدادات
**Issue: Permission error when updating settings**

**الحل - Solution:**
1. تأكد من أن المستخدم لديه صلاحيات المدير
   - Make sure user has admin permissions
2. راجع قواعد الأمان في Firestore
   - Review Firestore security rules

---

## الدعم - Support

لمزيد من المساعدة، راجع:
For more help, check:

- `SUPPORT_SYSTEM_README.md` - دليل نظام الدعم الفني
- `FIRESTORE_RULES.md` - دليل قواعد الأمان
- `TROUBLESHOOTING.md` - دليل حل المشاكل
