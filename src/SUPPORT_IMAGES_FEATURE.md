# ميزة رفع الصور في تذاكر الدعم الفني
# Support Ticket Image Attachments Feature

## النظرة العامة / Overview

تم إضافة ميزة رفع الصور (حتى 3 صور) مع كل تذكرة دعم فني، مع تخزين الصور في Cloudinary واستخدام MultiImageUploader.

Support ticket system now allows users to attach up to 3 images with each ticket, stored in Cloudinary using MultiImageUploader component.

---

## المميزات / Features

### 1. رفع الصور / Image Upload
- ✅ حتى 3 صور لكل تذكرة / Up to 3 images per ticket
- ✅ حجم أقصى 5 ميجابايت لكل صورة / Max 5MB per image
- ✅ صيغ مدعومة: JPG, PNG, GIF, WebP / Supported formats: JPG, PNG, GIF, WebP
- ✅ رفع متعدد (Drag & Drop) / Multi-upload with drag & drop
- ✅ معاينة مباشرة / Live preview

### 2. التخزين / Storage
- ✅ Cloudinary Integration
- ✅ مجلد مخصص: `support-system/support-tickets`
- ✅ حفظ URL و publicId في Firestore

### 3. العرض / Display
- ✅ صور مصغرة في بطاقات التذاكر / Thumbnails in ticket cards
- ✅ عرض كامل في نافذة التفاصيل / Full view in ticket dialog
- ✅ **صندوق عرض الصور (Image Lightbox)** مع:
  - تكبير/تصغير (Zoom in/out)
  - التنقل بالأسهم / Arrow navigation
  - صور مصغرة في الأسفل / Bottom thumbnails
  - تحميل الصور / Download images
  - دعم لوحة المفاتيح (ESC, ←, →)
- ✅ عداد الصور / Image counter
- ✅ تأثيرات hover جميلة / Beautiful hover effects

---

## البنية التقنية / Technical Structure

### 1. Data Structure

```typescript
interface ImageData {
  url: string;        // Cloudinary URL
  publicId: string;   // Cloudinary Public ID
}

interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userProfileImage?: string | null;
  subject: string;
  message: string;
  attachments?: ImageData[];  // ← NEW: Array of images
  status: 'open' | 'replied' | 'closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted?: boolean;
}
```

### 2. Firestore Document

```json
{
  "supportTickets": {
    "ticketId": {
      "userId": "user123",
      "userEmail": "user@example.com",
      "userName": "Ahmed Ali",
      "subject": "Technical Issue",
      "message": "I need help with...",
      "attachments": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "support-system/support-tickets/xyz123"
        }
      ],
      "status": "open",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## الملفات المعدلة / Modified Files

### 1. `/components/ImageLightbox.tsx` ⭐ NEW
- ✅ صندوق عرض صور احترافي / Professional image lightbox
- ✅ Zoom controls (0.5x - 3x)
- ✅ Keyboard navigation (ESC, ←, →)
- ✅ Thumbnail navigation
- ✅ Download functionality
- ✅ RTL support for Arabic

### 2. `/components/SupportPage.tsx`
- ✅ Import MultiImageUploader & ImageLightbox
- ✅ Added `attachments` state
- ✅ MultiImageUploader in create ticket form
- ✅ Display thumbnails in ticket cards
- ✅ ImageLightbox integration
- ✅ `openLightbox()` function

### 3. `/components/SupportAdminPage.tsx`
- ✅ Updated Ticket interface
- ✅ ImageLightbox integration
- ✅ Display thumbnails in admin ticket cards
- ✅ `openLightbox()` function

### 4. `/contexts/LanguageContext.tsx`
```typescript
attachImagesOptional: { 
  ar: 'اختياري: يمكنك إرفاق حتى 3 صور (5 ميجابايت لكل صورة)', 
  en: 'Optional: Attach up to 3 images (5MB per image)' 
},
image: { ar: 'صورة', en: 'image' },
images: { ar: 'صور', en: 'images' },
clickToView: { ar: 'انقر للعرض', en: 'Click to view' },
lightboxInstructions: { 
  ar: 'استخدم الأسهم للتنقل • ESC للإغلاق', 
  en: 'Use arrows to navigate • ESC to close' 
},
```

---

## كيفية الاستخدام / How to Use

### للمستخدمين / For Users

1. **إنشاء تذكرة جديدة:**
   - انقر على "تذكرة جديدة" / Click "New Ticket"
   - املأ الموضوع والرسالة / Fill subject and message
   - **اختياري**: أضف صور (حتى 3):
     - اسحب وأفلت الصور / Drag & drop images
     - أو انقر لاختيار الصور / Or click to select
   - اضغط "إرسال" / Click "Submit"

2. **عرض الصور:**
   - صور مصغرة في بطاقة التذكرة / Thumbnails in ticket card
   - انقر على التذكرة لعرض التفاصيل / Click ticket for details
   - **انقر على أي صورة** لفتح صندوق العرض / Click any image to open lightbox
   - استخدم أزرار التكبير/التصغير / Use zoom in/out buttons
   - التنقل بين الصور بالأسهم / Navigate with arrows or keyboard
   - تحميل الصورة بزر التحميل / Download with download button
   - إغلاق بزر X أو مفتاح ESC / Close with X or ESC key

### للمدراء / For Admins

- نفس العرض مع إمكانية الرد / Same view with reply capability
- الصور مرئية في جميع التذاكر / Images visible in all tickets

---

## مميزات صندوق العرض (Lightbox Features)

### التحكم بلوحة المفاتيح / Keyboard Controls
- **ESC** - إغلاق صندوق العرض / Close lightbox
- **←** أو **→** - التنقل بين الصور / Navigate between images

### الأزرار / Buttons
- 🔍 **Zoom In** - تكبير حتى 3x
- 🔍 **Zoom Out** - تصغير حتى 0.5x
- ⬇️ **Download** - تحميل الصورة
- ❌ **Close** - إغلاق

### الميزات / Features
- ✅ عرض الصور المصغرة في الأسفل
- ✅ عداد الصور (1/3)
- ✅ دعم RTL للعربية
- ✅ خلفية سوداء شبه شفافة
- ✅ أنيميشن سلس للتكبير
- ✅ تصميم responsive

---

## التحسينات المستقبلية / Future Enhancements

- [ ] إمكانية إضافة صور في الردود / Add images in replies
- [x] ~~معرض صور مع تكبير / Image gallery with zoom~~ ✅ تم
- [ ] ضغط الصور تلقائياً / Automatic image compression
- [ ] دعم الفيديو / Video support
- [ ] دعم ملفات PDF / PDF file support
- [ ] مشاركة الصور / Share images
- [ ] عرض Slideshow تلقائي / Auto slideshow

---

## الملاحظات الفنية / Technical Notes

### Cloudinary Configuration
- **Cloud Name:** ddy8wuaif
- **Upload Preset:** MobhmP
- **Folder:** support-system/support-tickets
- **Transformation:** SUPPORT_ATTACHMENT (1200x1200, limit crop)

### Performance
- التحميل غير متزامن / Async upload
- معاينة فورية / Instant preview
- تحسين الصور تلقائياً / Auto image optimization
- Lazy loading للصور / Lazy loading for images

### Security
- التحقق من نوع الملف / File type validation
- التحقق من حجم الملف / File size validation
- رفع آمن عبر Cloudinary / Secure upload via Cloudinary

---

## استكشاف الأخطاء / Troubleshooting

### مشكلة: فشل رفع الصورة
**الحل:**
1. تحقق من إعدادات Cloudinary في `/lib/cloudinary.ts`
2. تأكد من Upload Preset صحيح
3. تحقق من اتصال الإنترنت

### مشكلة: الصور لا تظهر
**الحل:**
1. تحقق من Firestore Rules
2. تحقق من Console للأخطاء
3. تحقق من أن URL صحيح

---

## الدعم / Support

للمزيد من المعلومات، راجع:
- 📚 `/lib/cloudinary.ts` - Cloudinary configuration
- 🎨 `/components/MultiImageUploader.tsx` - Image uploader component
- 📝 `/CLOUDINARY_SETUP.md` - Cloudinary setup guide

---

**تاريخ التحديث:** نوفمبر 2024  
**الإصدار:** 2.0
