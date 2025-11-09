# استخدام كلاسات RTL/LTR
# Using RTL/LTR Classes

دليل سريع لاستخدام الكلاسات الديناميكية للغة.

---

## 🎯 نظرة عامة | Overview

عند تغيير اللغة، يتم إضافة كلاس `rtl` أو `ltr` تلقائياً إلى عنصر `<html>`:

```html
<!-- عند اختيار العربية -->
<html class="rtl" dir="rtl" lang="ar">

<!-- عند اختيار الإنجليزية -->
<html class="ltr" dir="ltr" lang="en">
```

---

## 🎨 استخدام الكلاسات في CSS

### 1. تخصيص المسافات (Spacing)

```css
/* في Tailwind CSS */
.my-element {
  margin-left: 1rem; /* افتراضي LTR */
}

html.rtl .my-element {
  margin-left: 0;
  margin-right: 1rem; /* RTL */
}
```

**أو باستخدام Tailwind:**

```jsx
<div className="ml-4 rtl:mr-4 rtl:ml-0">
  محتوى
</div>
```

---

### 2. موضع العناصر (Positioning)

```css
/* عناصر مثبتة */
.notification {
  right: 1rem; /* LTR */
}

html.rtl .notification {
  right: auto;
  left: 1rem; /* RTL */
}
```

**في Tailwind:**

```jsx
<div className="fixed right-4 rtl:right-auto rtl:left-4">
  إشعار
</div>
```

---

### 3. Flexbox والـ Grid

```css
/* Flexbox */
.container {
  flex-direction: row; /* LTR */
}

html.rtl .container {
  flex-direction: row-reverse; /* RTL */
}
```

**في Tailwind:**

```jsx
<div className="flex flex-row rtl:flex-row-reverse">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

---

### 4. النصوص والمحاذاة

```css
/* محاذاة النص */
.text-start {
  text-align: left; /* LTR */
}

html.rtl .text-start {
  text-align: right; /* RTL */
}
```

**في Tailwind (مدمج):**

```jsx
<p className="text-start">
  النص يتحاذى حسب اللغة تلقائياً
</p>
```

---

### 5. الأيقونات والأسهم

```css
/* أيقونة سهم */
.arrow-icon {
  transform: rotate(0deg); /* LTR → */
}

html.rtl .arrow-icon {
  transform: rotate(180deg); /* RTL ← */
}
```

**في React:**

```jsx
import { ChevronRight } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

function MyComponent() {
  const { isRTL } = useLanguage();
  
  return (
    <ChevronRight 
      className={isRTL ? 'rotate-180' : ''}
    />
  );
}
```

---

### 6. Borders والـ Radius

```css
/* حواف دائرية */
.card {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

html.rtl .card {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
```

**في Tailwind:**

```jsx
<div className="rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg">
  بطاقة
</div>
```

---

## 🔧 إضافة Variants مخصصة في Tailwind

إذا أردت استخدام `rtl:` كـ variant في Tailwind، أضف في `globals.css`:

```css
/* تم إضافتها بالفعل */
@custom-variant rtl (html.rtl &);
@custom-variant ltr (html.ltr &);
```

الآن يمكنك استخدام:

```jsx
<div className="rtl:text-right ltr:text-left">
  نص
</div>

<div className="rtl:mr-4 ltr:ml-4">
  مسافة
</div>

<div className="rtl:flex-row-reverse ltr:flex-row">
  Flex
</div>
```

---

## 💡 أمثلة عملية

### مثال 1: قائمة جانبية (Sidebar)

```jsx
export function Sidebar() {
  return (
    <aside className="
      fixed top-0 left-0
      rtl:left-auto rtl:right-0
      w-64 h-full
      border-r rtl:border-r-0 rtl:border-l
    ">
      <nav className="flex flex-col gap-2 p-4">
        {/* محتوى القائمة */}
      </nav>
    </aside>
  );
}
```

---

### مثال 2: نافذة منبثقة (Dropdown)

```jsx
export function Dropdown() {
  return (
    <div className="relative">
      <button>قائمة</button>
      <div className="
        absolute top-full mt-2
        left-0 rtl:left-auto rtl:right-0
        min-w-[200px]
        rounded-lg shadow-lg
      ">
        {/* محتوى القائمة */}
      </div>
    </div>
  );
}
```

---

### مثال 3: بطاقة بصورة (Image Card)

```jsx
export function ImageCard() {
  return (
    <div className="flex gap-4 rtl:flex-row-reverse">
      <img 
        src="/image.jpg" 
        className="w-24 h-24 rounded-lg" 
        alt="صورة"
      />
      <div className="flex-1">
        <h3 className="text-lg">عنوان</h3>
        <p className="text-muted-foreground">وصف</p>
      </div>
    </div>
  );
}
```

---

### مثال 4: شريط التقدم (Progress Bar)

```jsx
export function ProgressBar({ value = 70 }) {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="
          absolute top-0 left-0
          rtl:left-auto rtl:right-0
          h-full bg-blue-600
          transition-all duration-300
        "
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
```

---

### مثال 5: Badge مع أيقونة

```jsx
import { X } from 'lucide-react';

export function Badge({ label, onRemove }) {
  return (
    <div className="
      inline-flex items-center gap-1
      px-3 py-1
      bg-blue-100 text-blue-800
      rounded-full
    ">
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="
          ml-1 rtl:ml-0 rtl:mr-1
          hover:bg-blue-200 rounded-full p-0.5
        "
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
```

---

## 🎨 استخدام في Styled Components (اختياري)

إذا كنت تستخدم CSS-in-JS:

```jsx
import styled from 'styled-components';

const Container = styled.div`
  padding-left: 1rem;
  
  html.rtl & {
    padding-left: 0;
    padding-right: 1rem;
  }
`;
```

---

## 🔍 التحقق من الكلاس في JavaScript

```typescript
// التحقق من اللغة الحالية
const isRTL = document.documentElement.classList.contains('rtl');

// أو استخدام Context
import { useLanguage } from './contexts/LanguageContext';

function MyComponent() {
  const { isRTL } = useLanguage();
  
  console.log('Is RTL?', isRTL);
  
  return (
    <div className={isRTL ? 'rtl-class' : 'ltr-class'}>
      محتوى
    </div>
  );
}
```

---

## 📊 Selectors CSS الكاملة

```css
/* استهداف العناصر في RTL فقط */
html.rtl .my-element {
  /* استايلات RTL */
}

/* استهداف العناصر في LTR فقط */
html.ltr .my-element {
  /* استايلات LTR */
}

/* استهداف العناصر في كلا الاتجاهين */
.my-element {
  /* استايلات عامة */
}

/* استخدام :is() للاختصار */
html:is(.rtl) .my-element {
  /* RTL */
}

/* استخدام :not() */
html:not(.rtl) .my-element {
  /* LTR فقط */
}
```

---

## 🚀 نصائح للأداء

### 1. استخدم Tailwind Variants بدلاً من CSS مخصص

```jsx
// ✅ أفضل
<div className="mr-4 rtl:mr-0 rtl:ml-4">

// ❌ تجنب
<div style={{ 
  marginRight: isRTL ? 0 : '1rem',
  marginLeft: isRTL ? '1rem' : 0
}}>
```

### 2. تجنب تغيير الكلاس يدوياً

```jsx
// ❌ لا تفعل هذا
document.documentElement.classList.add('rtl');

// ✅ استخدم setLanguage من Context
const { setLanguage } = useLanguage();
setLanguage('ar'); // سيضيف rtl تلقائياً
```

### 3. اختبر على كلا الاتجاهين

```jsx
// في Development
useEffect(() => {
  // اضغط Ctrl+Shift+D لتبديل اللغة سريعاً
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      setLanguage(language === 'ar' ? 'en' : 'ar');
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [language]);
```

---

## ✅ قائمة التحقق | Checklist

قبل النشر، تأكد من:

- [ ] جميع العناصر المثبتة (fixed/absolute) تعمل في RTL
- [ ] الأيقونات الاتجاهية (أسهم) تنعكس
- [ ] المسافات (margins/paddings) صحيحة
- [ ] Flexbox/Grid يعمل بشكل صحيح
- [ ] Borders والـ Shadows في الجهة الصحيحة
- [ ] النصوص محاذاة بشكل صحيح
- [ ] الصور والـ Media لا تنعكس (إلا إذا كان مطلوباً)

---

## 📚 موارد إضافية

- [RTL Styling Best Practices](https://rtlstyling.com)
- [Tailwind CSS RTL Support](https://tailwindcss.com/docs/rtl-support)
- [MDN: direction](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)

---

## 🎉 الخلاصة

الآن لديك نظام RTL/LTR كامل يعمل تلقائياً! فقط استخدم:

```jsx
// في Tailwind
className="ml-4 rtl:ml-0 rtl:mr-4"

// في CSS
html.rtl .element { /* RTL styles */ }

// في React
const { isRTL } = useLanguage();
```

كل شيء يعمل تلقائياً عند تغيير اللغة! ✨
