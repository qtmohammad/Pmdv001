# أمثلة عملية لـ RTL/LTR
# Practical RTL/LTR Examples

أمثلة واقعية من التطبيق مع شرح كيفية استخدام كلاسات RTL/LTR.

---

## 🎯 الأمثلة من نظام الدعم الفني

### مثال 1: رسائل المحادثة (Chat Messages)

```jsx
// في SupportPage.tsx و SupportAdminPage.tsx
<div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
  <div className={`
    max-w-[70%] rounded-lg px-4 py-2
    ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'}
  `}>
    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
  </div>
</div>
```

**التحسين مع RTL:**

```jsx
<div className={`
  flex 
  ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}
  rtl:${msg.sender === 'user' ? 'justify-start' : 'justify-end'}
`}>
  <div className={`
    max-w-[70%] rounded-lg px-4 py-2
    ${msg.sender === 'user' 
      ? 'bg-blue-600 text-white rounded-br-none rtl:rounded-br-lg rtl:rounded-bl-none' 
      : 'bg-muted rounded-bl-none rtl:rounded-bl-lg rtl:rounded-br-none'}
  `}>
    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
  </div>
</div>
```

---

### مثال 2: أيقونات في الأزرار (Icons in Buttons)

```jsx
// من SupportPage.tsx
<Button>
  <Plus className="w-4 h-4" />
  {t('newTicket')}
</Button>
```

**مع RTL (الأيقونة على اليمين بالعربية):**

```jsx
<Button className="gap-2">
  <Plus className="w-4 h-4 rtl:order-2" />
  <span className="rtl:order-1">{t('newTicket')}</span>
</Button>

// أو بطريقة أبسط:
<Button className="flex-row rtl:flex-row-reverse gap-2">
  <Plus className="w-4 h-4" />
  {t('newTicket')}
</Button>
```

---

### مثال 3: Badge مع حالات مختلفة

```jsx
// من SupportPage.tsx
const getStatusBadge = (status: Ticket['status']) => {
  const statusConfig = {
    open: { label: t('statusOpen'), icon: Clock },
    replied: { label: t('statusReplied'), icon: CheckCircle },
    closed: { label: t('statusClosed'), icon: XCircle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1 flex-row rtl:flex-row-reverse">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
```

---

### مثال 4: Card Header مع محتوى على اليمين/اليسار

```jsx
// من SupportPage.tsx
<CardHeader>
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1 min-w-0">
      <CardTitle className="truncate">{ticket.subject}</CardTitle>
      <CardDescription className="mt-1">
        {formatDate(ticket.createdAt)}
      </CardDescription>
    </div>
    {getStatusBadge(ticket.status)}
  </div>
</CardHeader>
```

**تعمل تلقائياً بفضل `flex` و `justify-between`!** ✅

---

### مثال 5: أيقونات مع معلومات المستخدم

```jsx
// من SupportAdminPage.tsx
<CardDescription className="mt-1 space-y-1">
  <span className="flex items-center gap-2">
    <User className="w-3 h-3" />
    <span>{ticket.userName}</span>
  </span>
  <span className="flex items-center gap-2">
    <Mail className="w-3 h-3" />
    <span dir="ltr">{ticket.userEmail}</span>
  </span>
</CardDescription>
```

**ملاحظة:** 
- البريد الإلكتروني يظل LTR دائماً باستخدام `dir="ltr"`.
- استخدم `<span className="flex">` بدلاً من `<div className="flex">` داخل `CardDescription` لأنه `<p>` tag.
- استخدم `flex` (وليس `inline-flex`) لكي يعمل `space-y` بشكل صحيح.

---

## 🎨 أمثلة من Layout

### مثال 6: Sidebar Navigation

```jsx
// في Layout.tsx
const navigationItems = [
  { id: 'my-products', icon: Package, label: t('myProducts') },
  { id: 'support', icon: MessageSquare, label: t('support') },
  { id: 'account', icon: User, label: t('account') },
];

return (
  <nav className="space-y-2">
    {navigationItems.map((item) => (
      <button
        key={item.id}
        className={`
          w-full flex items-center gap-3 px-4 py-2 rounded-lg
          rtl:flex-row-reverse
          ${currentPage === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
        `}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    ))}
  </nav>
);
```

---

### مثال 7: Header مع أزرار على الجانبين

```jsx
// في Layout.tsx
<header className="flex items-center justify-between px-6 py-4 border-b">
  <div className="flex items-center gap-4">
    <h1 className="text-xl">{t('appName')}</h1>
  </div>
  
  <div className="flex items-center gap-2 rtl:flex-row-reverse">
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
    
    <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
      <Languages className="w-5 h-5" />
    </Button>
    
    <Button variant="ghost" onClick={handleLogout}>
      <LogOut className="w-4 h-4 rtl:order-2" />
      <span className="rtl:order-1">{t('logout')}</span>
    </Button>
  </div>
</header>
```

---

## 📱 أمثلة متقدمة

### مثال 8: نافذة Dialog مع محتوى معقد

```jsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <DialogTitle>{t('createNewTicket')}</DialogTitle>
          <DialogDescription>{t('createNewTicketDescription')}</DialogDescription>
        </div>
        {/* Close button يكون على اليمين في LTR واليسار في RTL تلقائياً */}
      </div>
    </DialogHeader>
    
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">{t('subject')}</Label>
        <Input id="subject" />
      </div>
      
      <div className="flex justify-end gap-2 rtl:flex-row-reverse">
        <Button type="button" variant="outline">{t('cancel')}</Button>
        <Button type="submit">{t('submit')}</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

---

### مثال 9: Tabs مع أيقونات

```jsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="all" className="gap-2 rtl:flex-row-reverse">
      <span>{t('all')}</span>
      <Badge variant="secondary">{counts.all}</Badge>
    </TabsTrigger>
    
    <TabsTrigger value="open" className="gap-2 rtl:flex-row-reverse">
      <Clock className="w-4 h-4" />
      <span>{t('statusOpen')}</span>
      <Badge variant="secondary">{counts.open}</Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

### مثال 10: إشعار مع أيقونة وزر

```jsx
<Card className="bg-blue-50 border-blue-200">
  <CardContent className="py-4">
    <div className="flex items-start gap-3 rtl:flex-row-reverse">
      <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-blue-900 mb-2">
          {t('enableNotificationsForUpdates')}
        </p>
        <Button size="sm">{t('enableNotifications')}</Button>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🔧 نصائح عملية

### 1. استخدم Flexbox بذكاء

```jsx
// ✅ جيد - يعمل تلقائياً
<div className="flex gap-2">
  <Icon />
  <Text />
</div>

// ✅ أفضل - سيطرة كاملة
<div className="flex gap-2 rtl:flex-row-reverse">
  <Icon />
  <Text />
</div>
```

---

### 2. التعامل مع الحواف المدورة

```jsx
// Card مع حواف على جانب واحد
<div className="
  rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg
  border-l-4 rtl:border-l-0 rtl:border-r-4
  border-blue-600
">
  محتوى
</div>
```

---

### 3. Positioning للعناصر المثبتة

```jsx
// Notification toast
<div className="
  fixed bottom-4 right-4
  rtl:right-auto rtl:left-4
  bg-white shadow-lg rounded-lg p-4
">
  إشعار
</div>
```

---

### 4. النصوص ذات الاتجاه الثابت

```jsx
// أرقام، بريد إلكتروني، روابط
<div className="flex items-center gap-2">
  <Mail className="w-4 h-4" />
  <span dir="ltr" className="font-mono">user@example.com</span>
</div>

<div className="flex items-center gap-2">
  <Phone className="w-4 h-4" />
  <span dir="ltr">+966 50 123 4567</span>
</div>
```

---

### 5. Grid Layouts

```jsx
// Grid يعمل تلقائياً مع RTL
<div className="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

// في RTL سيكون الترتيب: 3 - 2 - 1 ✅
```

---

## 🎯 قاعدة ذهبية

**استخدم Flexbox والـ Grid بدلاً من positioning يدوي!**

```jsx
// ❌ تجنب
<div style={{ paddingLeft: '16px' }}>

// ✅ استخدم
<div className="ps-4"> {/* padding-start */}

// ✅ أو
<div className="pl-4 rtl:pl-0 rtl:pr-4">
```

---

## 📊 Classes الشائعة

| الحالة | LTR | RTL | Tailwind |
|--------|-----|-----|----------|
| Padding Start | `pl-4` | `pr-4` | `ps-4` |
| Padding End | `pr-4` | `pl-4` | `pe-4` |
| Margin Start | `ml-4` | `mr-4` | `ms-4` |
| Margin End | `mr-4` | `ml-4` | `me-4` |
| Text Align | `text-left` | `text-right` | `text-start` |
| Float | `float-left` | `float-right` | `float-start` |
| Border | `border-l` | `border-r` | `border-s` |

**ملاحظة:** استخدم `*-start` و `*-end` بدلاً من `left/right` عندما يكون متاحاً!

---

## ✅ الخلاصة

**القواعد الأساسية:**

1. ✅ استخدم `flex` و `gap` بدلاً من margins يدوية
2. ✅ استخدم `rtl:` variant للتخصيص
3. ✅ استخدم `dir="ltr"` للنصوص ذات الاتجاه الثابت
4. ✅ اختبر في كلا اللغتين
5. ✅ استخدم `ps-*` و `pe-*` بدلاً من `pl-*` و `pr-*`

النظام الآن يدعم RTL بشكل كامل وتلقائي! 🎉
