# حذف تذاكر الدعم - Delete Support Tickets

## ✨ الميزة الجديدة - New Feature

تم إضافة إمكانية حذف تذاكر الدعم للمستخدمين والإدارة.

Added ability to delete support tickets for users and admins.

---

## 🎯 الميزات - Features

### للمستخدمين - For Users

- ✅ يمكن للمستخدم حذف تذاكره الخاصة
- ✅ زر الحذف متاح في بطاقة كل تذكرة
- ✅ نافذة تأكيد قبل الحذف
- ✅ عند الحذف، يتم إخفاء التذكرة من العرض (Soft Delete)
- ✅ **الهام:** التذاكر المحذوفة تُحسب ضمن الحد اليومي لمنع الاستغلال

### للإدارة - For Admins

- ✅ يمكن للمدير حذف أي تذكرة
- ✅ زر الحذف في نافذة تفاصيل التذكرة
- ✅ نافذة تأكيد قبل الحذف
- ✅ يتم إخفاء التذكرة من العرض (Soft Delete)
- ✅ التذكرة محفوظة في قاعدة البيانات للتدقيق

---

## 🎨 التصميم - Design

### زر الحذف للمستخدم - User Delete Button

- موقع الزر: في بطاقة التذكرة بجانب Badge الحالة
- نوع الزر: Ghost button مع أيقونة سلة المهملات
- اللون: أحمر (destructive) عند التحويم

### زر الحذف للإدارة - Admin Delete Button

- موقع الزر: في نافذة تفاصيل التذكرة
- نوع الزر: Destructive button مع أيقونة Trash2
- المكان: بجانب أزرار الإغلاق/إعادة الفتح

---

## 🔒 الأمان - Security

### Firestore Rules Updated

تم تحديث قواعد Firestore للسماح بالحذف:

```javascript
// Support Tickets
match /supportTickets/{ticketId} {
  // Users can delete their own tickets
  // Admins can delete all tickets
  allow delete: if isAuthenticated() && 
                   (resource.data.userId == request.auth.uid || isAdmin());
  
  // Messages subcollection
  match /messages/{messageId} {
    // Users can delete their ticket's messages
    // Admins can delete all messages
    allow delete: if isAuthenticated() && 
                     (get(/databases/$(database)/documents/supportTickets/$(ticketId)).data.userId == request.auth.uid || isAdmin());
  }
}
```

### الصلاحيات - Permissions

| الدور - Role | حذف التذاكر - Delete Tickets |
|-------------|------------------------------|
| مستخدم - User | تذاكره الخاصة فقط - Own tickets only |
| مدير - Admin | جميع التذاكر - All tickets |

---

## 📝 الاستخدام - Usage

### للمستخدم - For User

1. انتقل إلى صفحة الدعم الفني
2. ابحث عن التذكرة التي تريد حذفها
3. اضغط على زر سلة المهملات (🗑️) في بطاقة التذكرة
4. أكد الحذف في نافذة التأكيد

### للمدير - For Admin

1. انتقل إلى صفحة إدارة الدعم
2. افتح التذكرة المراد حذفها
3. اضغط على زر الحذف (🗑️) في أعلى نافذة التفاصيل
4. أكد الحذف في نافذة التأكيد

---

## ⚙️ التفاصيل التقنية - Technical Details

### وظيفة الحذف الناعم - Soft Delete Function

**⚠️ تحديث هام: تم تغيير آلية الحذف إلى Soft Delete**

```typescript
const handleDeleteTicket = async () => {
  if (!ticketToDelete) return;

  try {
    // وضع علامة "محذوف" بدلاً من الحذف النهائي
    // Mark as deleted instead of permanent deletion
    await updateDoc(doc(db, 'supportTickets', ticketToDelete.id), {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    toast.success(t('ticketDeleted'));
    loadTickets();
    // لا حاجة لإعادة حساب التذاكر اليومية لأن العدد لم يتغير
  } catch (error) {
    toast.error(t('failedToDeleteTicket'));
  }
};
```

### لماذا Soft Delete؟

1. **منع الاستغلال**: المستخدمون لا يمكنهم حذف وإعادة إرسال تذاكر لتجاوز الحد اليومي
2. **حفظ السجلات**: التذاكر محفوظة للتدقيق والمراجعة
3. **البساطة**: لا حاجة لنظام عدادات معقد

### نافذة التأكيد - Confirmation Dialog

```tsx
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{t('deleteTicket')}</AlertDialogTitle>
      <AlertDialogDescription>
        {t('confirmDeleteTicketDescription')}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDeleteTicket}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {t('delete')}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 🔄 التأثير على النظام - System Impact

### عند حذف تذكرة (Soft Delete) - When Deleting a Ticket

1. ✅ يتم وضع علامة `isDeleted: true` على التذكرة
2. ✅ التذكرة تختفي من واجهة المستخدم
3. ✅ التذكرة تبقى في قاعدة البيانات
4. ✅ **الرسائل تبقى كما هي** (لا يتم حذفها)
5. ✅ إغلاق نوافذ التفاصيل تلقائياً

### التأثير على الحد اليومي - Impact on Daily Limit

- ✅ **التذاكر المحذوفة تُحسب ضمن الحد اليومي**
- ✅ لا يمكن للمستخدم تجاوز الحد بحذف التذاكر
- ✅ العدد لا يتغير عند الحذف

**مثال:**
```
مستخدم عادي (حد: 1 تذكرة/يوم)
1. يرسل تذكرة → التذاكر المتبقية: 0 ✅
2. يحذف التذكرة → التذاكر المتبقية: 0 ✅ (لم تتغير!)
3. يحاول إرسال تذكرة جديدة → ❌ ممنوع!
```

---

## 🌍 الترجمات - Translations

### تمت إضافة الترجمات التالية:

| المفتاح - Key | العربية | English |
|---------------|---------|---------|
| deleteTicket | حذف التذكرة | Delete Ticket |
| confirmDeleteTicket | هل أنت متأكد من حذف هذه التذكرة؟ | Are you sure you want to delete this ticket? |
| confirmDeleteTicketDescription | سيتم حذف التذكرة وجميع الرسائل المرتبطة بها نهائياً | The ticket and all associated messages will be permanently deleted |
| ticketDeleted | تم حذف التذكرة بنجاح | Ticket deleted successfully |
| failedToDeleteTicket | فشل في حذف التذكرة | Failed to delete ticket |

---

## ⚠️ ملاحظات مهمة - Important Notes

1. **الحذف الناعم (Soft Delete)**: التذاكر تُخفى ولا تُحذف نهائياً
2. **الرسائل محفوظة**: الرسائل تبقى في قاعدة البيانات
3. **الحد اليومي**: التذاكر المحذوفة تُحسب ضمن الحد اليومي
4. **الصلاحيات**: تأكد من تحديث Firestore Rules للسماح بـ `update`
5. **استرجاع ممكن**: يمكن للمدير استرجاع التذاكر إذا لزم الأمر

### Soft Delete Benefits

- ✅ منع استغلال النظام (Prevent system abuse)
- ✅ حفظ السجلات (Preserve records)
- ✅ إمكانية الاسترجاع (Can be restored)
- ✅ التدقيق والمراجعة (Auditing capability)

---

## 🧪 الاختبار - Testing

### اختبار حذف تذكرة - Test Delete Ticket

1. أنشئ تذكرة جديدة
2. أضف بعض الرسائل
3. احذف التذكرة
4. تحقق من:
   - ✅ اختفاء التذكرة من القائمة
   - ✅ عرض رسالة نجاح
   - ✅ عدم وجود أخطاء في Console
   - ✅ **عداد التذاكر اليومية لم يتغير** (مهم!)

### اختبار الحد اليومي - Test Daily Limit

1. سجل دخول كمستخدم عادي (حد: 1 تذكرة/يوم)
2. أرسل تذكرة واحدة → العدد المتبقي: 0
3. احذف التذكرة → العدد المتبقي: لا يزال 0 ✅
4. حاول إرسال تذكرة جديدة → يجب أن يُمنع ❌
5. انتظر حتى اليوم التالي → العدد المتبقي: 1 ✅

### اختبار الصلاحيات - Test Permissions

1. **كمستخدم**:
   - ✅ يمكن حذف تذاكره الخاصة
   - ❌ لا يمكن حذف تذاكر مستخدمين آخرين

2. **كمدير**:
   - ✅ يمكن حذف أي تذكرة

---

## 📚 الملفات المحدّثة - Updated Files

1. `/contexts/LanguageContext.tsx` - إضافة الترجمات
2. `/components/SupportAdminPage.tsx` - إضافة زر الحذف للمدير
3. `/components/SupportPage.tsx` - إضافة زر الحذف للمستخدم
4. `/firestore-complete-rules.txt` - تحديث قواعد الأمان

---

## 🎉 جاهز للاستخدام - Ready to Use

الميزة جاهزة ومتكاملة! فقط تأكد من:

1. ✅ تطبيق Firestore Rules الجديدة
2. ✅ اختبار الحذف كمستخدم ومدير
3. ✅ التحقق من عمل نافذة التأكيد
4. ✅ **اختبار الحد اليومي بعد الحذف**

---

## 📚 مراجع إضافية - Additional References

لمزيد من التفاصيل عن حل مشكلة الحد اليومي، راجع:
- `/SOFT_DELETE_FIX.md` - توثيق شامل بالإنجليزية
- `/حل_مشكلة_الحذف.md` - شرح مبسط بالعربية

---

**تم بنجاح! - Successfully Implemented! ✨**

**آخر تحديث:** 4 نوفمبر 2025 - إضافة نظام Soft Delete
