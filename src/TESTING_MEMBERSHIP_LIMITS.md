# اختبار نظام حد التذاكر اليومية
# Testing Daily Ticket Limit System

## دليل الاختبار السريع - Quick Testing Guide

### الخطوة 1: إعداد بيئة الاختبار
**Step 1: Prepare Testing Environment**

1. **تسجيل الدخول كمستخدم عادي (ليس مدير)**
   - Login as a regular user (not admin)
   
2. **التحقق من نوع العضوية**
   - Check membership type
   - افتح صفحة "الدعم الفني"
   - Open "Support" page
   - انظر إلى البطاقة العلوية - يجب أن تظهر "عضو مشترك"
   - Look at the top card - should show "Regular Member"

---

### الخطوة 2: اختبار حد العضو المشترك (1 تذكرة)
**Step 2: Test Regular Member Limit (1 ticket)**

#### 🟢 التذكرة الأولى - First Ticket:

1. **افتح صفحة الدعم الفني**
   - Open Support page
   
2. **تحقق من المعلومات المعروضة في البطاقة العلوية:**
   - Verify displayed information in top card:
   ```
   ✅ نوع العضوية: عضو مشترك
   ✅ حد التذاكر اليومية: 1 تذكرة يومياً
   ✅ التذاكر المتبقية اليوم: 1 (باللون الأخضر)
   ```

3. **تحقق من زر "تذكرة جديدة":**
   - Verify "New Ticket" button:
   ```
   ✅ الزر مفعّل (يمكن الضغط عليه)
   ✅ لا توجد رسالة تحذيرية
   ```

3. **أنشئ تذكرة جديدة:**
   - Create a new ticket:
   - اضغط "تذكرة جديدة"
   - Click "New Ticket"
   - املأ الموضوع والرسالة
   - Fill subject and message
   - اضغط "إرسال"
   - Click "Submit"
   - يجب أن تظهر رسالة "تم إنشاء التذكرة!"
   - Should show message "Ticket created!"

#### 🔴 التذكرة الثانية (يجب أن تُمنع) - Second Ticket (Should be blocked):

1. **انتظر ثانية واحدة - الصفحة ستتحدث تلقائياً**
   - Wait 1 second - Page will update automatically

2. **✅ تحقق من التغييرات التلقائية:**
   - ✅ Verify automatic changes:
   ```
   🔴 التذاكر المتبقية اليوم: 0 (باللون الأحمر)
   🔴 Remaining tickets: 0 (in red color)
   
   🚫 زر "تذكرة جديدة": معطّل تماماً (رمادي ولا يمكن الضغط)
   🚫 "New Ticket" button: Completely disabled (gray and unclickable)
   
   ⚠️ رسالة تحذيرية حمراء واضحة تظهر أعلى القائمة:
   ⚠️ Clear red warning message appears above the list:
      "تم الوصول إلى الحد اليومي"
      "Daily Limit Reached"
   ```

3. **❌ حاول الضغط على زر "تذكرة جديدة":**
   - ❌ Try clicking "New Ticket" button:
   ```
   ✅ الزر معطل ولن يستجيب للضغط
   ✅ Button is disabled and won't respond to clicks
   
   ✅ لن تفتح نافذة إنشاء التذكرة
   ✅ Ticket creation dialog won't open
   
   ✅ النظام يمنع الإنشاء تماماً
   ✅ System completely prevents creation
   ```

---

### الخطوة 3: اختبار حد العضو المميز (2 تذكرة)
**Step 3: Test Premium Member Limit (2 tickets)**

#### تغيير نوع العضوية - Change Membership Type:

**للمدير - For Admin:**

1. سجل خروج من المستخدم العادي
   - Logout from regular user
2. سجل دخول كمدير
   - Login as admin
3. اذهب إلى "إدارة العضويات"
   - Go to "Manage Memberships"
4. ابحث عن المستخدم الذي تختبره
   - Find the user you're testing with
5. اضغط "تعديل" بجانب اسمه
   - Click "Edit" next to their name
6. غيّر نوع العضوية إلى "عضو مميز"
   - Change membership type to "Premium Member"
7. اضغط "تحديث"
   - Click "Update"
8. سجل خروج وعد لتسجيل دخول المستخدم العادي
   - Logout and login back as regular user

#### اختبار الحد الجديد - Test New Limit:

1. **افتح صفحة الدعم الفني**
   - Open Support page

2. **تحقق من المعلومات المحدثة في البطاقة:**
   - Verify updated information in card:
   ```
   👑 نوع العضوية: عضو مميز (مع أيقونة تاج ذهبي)
   👑 Membership: Premium Member (with golden crown icon)
   
   ✅ حد التذاكر اليومية: 2 تذاكر يومياً
   ✅ Daily limit: 2 tickets per day
   
   ✅ التذاكر المتبقية اليوم: 1 (باللون الأخضر)
   ✅ Remaining tickets: 1 (in green)
      💡 لأن التذكرة السابقة محسوبة من اليوم
      💡 Because previous ticket counts for today
   
   ✅ زر "تذكرة جديدة": مفعّل (أزرق)
   ✅ "New Ticket" button: Enabled (blue)
   
   ✅ لا توجد رسالة تحذيرية
   ✅ No warning message
   ```

3. **أنشئ تذكرة ثانية:**
   - Create second ticket:
   - يجب أن تنجح العملية
   - Should succeed

4. **✅ تحقق من التغييرات بعد التذكرة الثانية:**
   - ✅ Verify changes after second ticket:
   ```
   🔴 التذاكر المتبقية اليوم: 0 (باللون الأحمر)
   🔴 Remaining tickets: 0 (in red)
   
   🚫 زر "تذكرة جديدة": معطّل
   🚫 "New Ticket" button: Disabled
   
   ⚠️ رسالة تحذيرية حمراء تظهر
   ⚠️ Red warning message appears
   ```

5. **❌ حاول إنشاء تذكرة ثالثة:**
   - ❌ Try to create third ticket:
   ```
   ✅ الزر معطل - لا يمكن الضغط
   ✅ Button disabled - cannot click
   
   ✅ يجب أن تُمنع تماماً
   ✅ Should be completely blocked
   ```

---

### الخطوة 4: اختبار إعادة التعيين اليومي
**Step 4: Test Daily Reset**

**ملاحظة:** هذا الاختبار يتطلب الانتظار حتى منتصف الليل أو تغيير تاريخ النظام
**Note:** This test requires waiting until midnight or changing system date

#### الطريقة اليدوية - Manual Method:

1. **في اليوم التالي:**
   - On the next day:
   - افتح صفحة الدعم الفني
   - Open Support page
   - يجب أن يعود العداد إلى الحد الكامل
   - Counter should reset to full limit

2. **للاختبار الفوري (Firestore):**
   - For immediate testing (Firestore):
   - اذهب إلى Firebase Console
   - Go to Firebase Console
   - افتح Firestore Database
   - Open Firestore Database
   - احذف التذاكر التي أنشأتها اليوم يدوياً
   - Manually delete tickets created today
   - أعد تحميل صفحة الدعم
   - Reload Support page
   - يجب أن يعود العداد للحد الكامل
   - Counter should return to full limit

---

### الخطوة 5: اختبار تغيير الإعدادات
**Step 5: Test Settings Changes**

**للمدير - For Admin:**

1. **اذهب إلى "إدارة العضويات"**
   - Go to "Manage Memberships"

2. **اضغط زر "إعدادات العضويات"**
   - Click "Membership Settings" button

3. **غيّر الحدود:**
   - Change limits:
   ```
   حد تذاكر العضو المميز: 3
   Premium Member Limit: 3
   
   حد تذاكر العضو المشترك: 2
   Regular Member Limit: 2
   ```

4. **اضغط "تحديث الإعدادات"**
   - Click "Update Settings"

5. **تحقق من التطبيق الفوري:**
   - Verify immediate application:
   - عد إلى صفحة الدعم (كمستخدم عادي)
   - Go back to Support page (as regular user)
   - أعد تحميل الصفحة
   - Reload page
   - يجب أن تظهر الحدود الجديدة فوراً
   - New limits should appear immediately

---

## سيناريوهات الاختبار المتقدمة
## Advanced Testing Scenarios

### السيناريو 1: اختبار التزامن
**Scenario 1: Concurrency Testing**

**الهدف:** التحقق من عدم إمكانية إنشاء تذاكر متزامنة تتجاوز الحد
**Goal:** Verify that concurrent ticket creation cannot exceed limit

**الخطوات:**
1. افتح صفحة الدعم في نافذتين مختلفتين
2. في كلتا النافذتين، حاول إنشاء تذكرة في نفس الوقت
3. يجب أن تنجح واحدة فقط وتُرفض الثانية

---

### السيناريو 2: اختبار الرد على التذاكر
**Scenario 2: Testing Ticket Replies**

**الهدف:** التحقق من إمكانية الرد على التذاكر حتى بعد الوصول للحد
**Goal:** Verify ability to reply to tickets even after reaching limit

**الخطوات:**
1. أنشئ تذكرة حتى تصل للحد اليومي
2. افتح تذكرة موجودة
3. حاول إرسال رد
4. يجب أن ينجح الرد (الحد فقط على التذاكر الجديدة)

---

### السيناريو 3: اختبار عرض التذاكر
**Scenario 3: Testing Ticket Display**

**الهدف:** التحقق من عدم تأثر عرض التذاكر بالحد اليومي
**Goal:** Verify ticket display is not affected by daily limit

**الخطوات:**
1. أنشئ تذاكر حتى تصل للحد
2. انتقل بين صفحات التطبيق
3. عد إلى صفحة الدعم
4. يجب أن تظهر جميع التذاكر السابقة

---

## علامات النجاح
## Success Indicators

### ✅ نظام يعمل بشكل صحيح:
**✅ System working correctly:**

- [ ] يتم عرض نوع العضوية بشكل صحيح
- [ ] Membership type displayed correctly
- [ ] يتم عرض الحد اليومي بشكل صحيح
- [ ] Daily limit displayed correctly
- [ ] يتم عرض التذاكر المتبقية وتحديثها بعد كل تذكرة
- [ ] Remaining tickets displayed and updated after each ticket
- [ ] يتم تعطيل الزر عند الوصول للحد
- [ ] Button disabled when limit reached
- [ ] تظهر رسالة تحذيرية واضحة عند الوصول للحد
- [ ] Clear warning message shown when limit reached
- [ ] لا يمكن إنشاء تذاكر أكثر من الحد
- [ ] Cannot create more tickets than limit
- [ ] يمكن الرد على التذاكر الموجودة حتى بعد الوصول للحد
- [ ] Can reply to existing tickets even after reaching limit
- [ ] تتغير الحدود فوراً عند تحديث الإعدادات
- [ ] Limits change immediately when settings updated

### ❌ مشاكل محتملة:
**❌ Potential Issues:**

- [ ] الحد لا يتم تطبيقه - تحقق من الكود
- [ ] Limit not applied - check code
- [ ] العداد لا يتحدث - تحقق من دالة checkTodayTickets
- [ ] Counter not updating - check checkTodayTickets function
- [ ] الزر لا يُعطل - تحقق من canCreateTicket state
- [ ] Button not disabled - check canCreateTicket state
- [ ] الرسالة التحذيرية لا تظهر - تحقق من الشرط
- [ ] Warning message not shown - check condition

---

## استكشاف الأخطاء
## Troubleshooting

### المشكلة: الحد لا يعمل
**Issue: Limit not working**

**الحلول:**
1. تحقق من console للأخطاء
2. تحقق من وجود مجموعة settings في Firestore
3. تحقق من قواعد الأمان

### المشكلة: العداد لا يتحدث
**Issue: Counter not updating**

**الحلول:**
1. تحقق من استدعاء checkTodayTickets بعد الإنشاء
2. تحقق من console للأخطاء
3. أعد تحميل الصفحة

### المشكلة: يمكن إنشاء تذاكر أكثر من الحد
**Issue: Can create more tickets than limit**

**الحلول:**
1. تحقق من دالة checkDailyLimit
2. تحقق من الـ timestamp في قاعدة البيانات
3. تحقق من نوع العضوية في buyers collection
4. تحقق من state canCreateTicket في SupportPage
5. تأكد من تحديث checkTodayTickets بعد إنشاء التذكرة

---

## التقرير
## Report

بعد الانتهاء من الاختبار، تأكد من:
After completing testing, make sure:

✅ جميع الحدود تعمل بشكل صحيح
✅ All limits work correctly

✅ الرسائل واضحة وبلغتين
✅ Messages are clear in both languages

✅ الواجهة سهلة الاستخدام
✅ UI is user-friendly

✅ لا توجد أخطاء في Console
✅ No errors in Console

✅ قواعد Firestore محدثة
✅ Firestore rules updated
