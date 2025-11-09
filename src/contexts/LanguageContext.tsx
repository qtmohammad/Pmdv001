import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  myProducts: { ar: 'منتجاتي', en: 'My Products' },
  account: { ar: 'الحساب', en: 'Account' },
  addProducts: { ar: 'إضافة منتجات', en: 'Add Products' },
  editProducts: { ar: 'تعديل المنتجات', en: 'Edit Products' },
  manageBuyers: { ar: 'إدارة المشترين', en: 'Manage Buyers' },
  adminPanel: { ar: 'لوحة الإدارة', en: 'Admin Panel' },
  
  // Auth
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'التسجيل', en: 'Register' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  name: { ar: 'الاسم', en: 'Name' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  dontHaveAccount: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  alreadyHaveAccount: { ar: 'لديك حساب؟', en: 'Already have an account?' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  sendResetLink: { ar: 'إرسال رابط إعادة التعيين', en: 'Send Reset Link' },
  backToLogin: { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },
  enterEmailToReset: { ar: 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور', en: 'Enter your email to reset your password' },
  resetEmailSent: { ar: 'تم إرسال رابط إعادة التعيين!', en: 'Reset link sent!' },
  resetEmailSentDescription: { ar: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور. قد يستغرق الأمر بضع دقائق.', en: 'Check your email for a password reset link. It may take a few minutes to arrive.' },
  resetEmailFailed: { ar: 'فشل إرسال رابط إعادة التعيين', en: 'Failed to send reset link' },
  checkYourEmail: { ar: 'تحقق من بريدك الإلكتروني', en: 'Check Your Email' },
  emailNotFound: { ar: 'البريد الإلكتروني غير موجود', en: 'Email not found' },
  invalidEmail: { ar: 'البريد الإلكتروني غير صالح', en: 'Invalid email' },
  tooManyRequests: { ar: 'طلبات كثيرة جداً. حاول لاحقاً', en: 'Too many requests. Try again later' },
  
  // Account
  personalInfo: { ar: 'المعلومات الشخصية', en: 'Personal Information' },
  changePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  currentPassword: { ar: 'كلمة المرور الحالية', en: 'Current Password' },
  updateProfile: { ar: 'تحديث الملف الشخصي', en: 'Update Profile' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  update: { ar: 'تحديث', en: 'Update' },
  profilePicture: { ar: 'الصورة الشخصية', en: 'Profile Picture' },
  productIcon: { ar: 'أيقونة المنتج', en: 'Product Icon' },
  productIconDescription: { ar: 'صورة رمزية مربعة للمنتج (اختياري)', en: 'Square icon image for the product (optional)' },
  productMainImage: { ar: 'الصورة الرئيسية للمنتج', en: 'Product Main Image' },
  productMainImageDescription: { ar: 'صورة رئيسية للمنتج تظهر في القوائم (اختياري)', en: 'Main product image shown in listings (optional)' },
  attachImages: { ar: 'إرفاق صور', en: 'Attach Images' },
  attachments: { ar: 'المرفقات', en: 'Attachments' },
  supportImages: { ar: 'صور الدعم', en: 'Support Images' },
  attachImagesOptional: { ar: 'اختياري: يمكنك إرفاق حتى 3 صور (5 ميجابايت لكل صورة)', en: 'Optional: Attach up to 3 images (5MB per image)' },
  attachImageOptional: { ar: 'إرفاق صورة (اختياري)', en: 'Attach image (optional)' },
  attachImage: { ar: 'إرفاق صورة', en: 'Attach image' },
  pleaseSelectImageFile: { ar: 'يرجى اختيار ملف صورة', en: 'Please select an image file' },
  imageTooLarge: { ar: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)', en: 'Image too large (max 5MB)' },
  imageUploaded: { ar: 'تم رفع الصورة بنجاح', en: 'Image uploaded successfully' },
  imageUploadFailed: { ar: 'فشل رفع الصورة', en: 'Failed to upload image' },
  image: { ar: 'صورة', en: 'image' },
  images: { ar: 'صور', en: 'images' },
  clickToView: { ar: 'انقر للعرض', en: 'Click to view' },
  lightboxInstructions: { ar: 'استخدم الأسهم للتنقل • ESC للإغلاق', en: 'Use arrows to navigate • ESC to close' },
  
  // Products
  products: { ar: 'المنتجات', en: 'Products' },
  productName: { ar: 'اسم المنتج', en: 'Product Name' },
  productId: { ar: 'معرف المنتج', en: 'Product ID' },
  productIdPlaceholder: { ar: 'مثال: PROD-001', en: 'Example: PROD-001' },
  productIdDescription: { ar: 'معرف فريد للمنتج (يستخدم للتمييز بين المنتجات)', en: 'Unique identifier for the product (used to distinguish between products)' },
  productIdExists: { ar: 'معرف المنتج موجود بالفعل', en: 'Product ID already exists' },
  productIdRequired: { ar: 'معرف المنتج مطلوب', en: 'Product ID is required' },
  productType: { ar: 'نوع المنتج', en: 'Product Type' },
  description: { ar: 'الوصف', en: 'Description' },
  plan: { ar: 'الخطة', en: 'Plan' },
  plans: { ar: 'الخطط', en: 'Plans' },
  price: { ar: 'السعر', en: 'Price' },
  features: { ar: 'المميزات', en: 'Features' },
  firebaseApp: { ar: 'تطبيق Firebase', en: 'Firebase App' },
  domainLicense: { ar: 'ترخيص الدومين', en: 'Domain License' },
  firebase: { ar: 'Firebase', en: 'Firebase' },
  domain: { ar: 'دومين', en: 'Domain' },
  
  // License Management
  licenseDetails: { ar: 'تفاصيل الترخيص', en: 'License Details' },
  appIds: { ar: 'معرفات التطبيقات', en: 'App IDs' },
  domains: { ar: 'الدومينات', en: 'Domains' },
  addAppId: { ar: 'إضافة معرف تطبيق', en: 'Add App ID' },
  addDomain: { ar: 'إضافة دومين', en: 'Add Domain' },
  allowedDomains: { ar: 'الدومينات المسموح بها', en: 'Allowed Domains' },
  usedDomains: { ar: 'الدومينات المستخدمة', en: 'Used Domains' },
  
  // Actions
  add: { ar: 'إضافة', en: 'Add' },
  edit: { ar: 'تعديل', en: 'Edit' },
  delete: { ar: 'حذف', en: 'Delete' },
  view: { ar: 'عرض', en: 'View' },
  close: { ar: 'إغلاق', en: 'Close' },
  submit: { ar: 'إرسال', en: 'Submit' },
  assign: { ar: 'تعيين', en: 'Assign' },
  actions: { ar: 'الإجراءات', en: 'Actions' },
  visible: { ar: 'ظاهر', en: 'Visible' },
  hidden: { ar: 'مخفي', en: 'Hidden' },
  designerSignature: { ar: 'توقيع المصمم', en: 'Designer Signature' },
  
  // Messages & Descriptions
  registrationNote: { ar: 'التسجيل متاح فقط للبريد الإلكتروني المدرج ضمن قائمة المشترين', en: 'Registration is only available for emails listed in the buyers list' },
  noProducts: { ar: 'لا توجد منتجات', en: 'No products available' },
  manageProductsDescription: { ar: 'إدارة منتجاتك المرخصة والدومينات', en: 'Manage your licensed products and domains' },
  noAppIdsAdded: { ar: 'لم يتم إضافة معرفات تطبيقات', en: 'No app IDs added' },
  noDomainsAdded: { ar: 'لم يتم إضافة دومينات', en: 'No domains added' },
  addFirebaseAppId: { ar: 'إضافة معرف تطبيق Firebase', en: 'Add Firebase App ID' },
  addDomainForLicense: { ar: 'إضافة دومين لهذا الترخيص', en: 'Add a domain for this license' },
  createProductsDescription: { ar: 'إنشاء منتجات جديدة للترخيص', en: 'Create new products for licensing' },
  productDetails: { ar: 'تفاصيل المنتج', en: 'Product Details' },
  basicProductInfo: { ar: 'معلومات أساسية عن المنتج', en: 'Basic information about the product' },
  addPlan: { ar: 'إضافة خطة', en: 'Add Plan' },
  createPricingPlans: { ar: 'إنشاء خطط تسعير لهذا المنتج', en: 'Create pricing plans for this product' },
  planNamePlaceholder: { ar: 'أساسي، احترافي، مؤسسة...', en: 'Basic, Pro, Enterprise...' },
  addFeature: { ar: 'إضافة ميزة', en: 'Add Feature' },
  addThisPlan: { ar: 'إضافة هذه الخطة', en: 'Add This Plan' },
  addedPlans: { ar: 'الخطط المضافة', en: 'Added Plans' },
  createProduct: { ar: 'إنشاء منتج', en: 'Create Product' },
  updatePersonalInfo: { ar: 'تحديث معلوماتك الشخصية', en: 'Update your personal information' },
  emailCannotBeChanged: { ar: 'لا يمكن تغيير البريد الإلكتروني', en: 'Email cannot be changed' },
  administratorAccount: { ar: 'حساب مدير', en: 'Administrator Account' },
  updatePasswordSecure: { ar: 'قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك', en: 'Update your password to keep your account secure' },
  manageExistingProducts: { ar: 'إدارة المنتجات الموجودة', en: 'Manage existing products' },
  editProduct: { ar: 'تعديل المنتج', en: 'Edit Product' },
  updateProductDetails: { ar: 'تحديث تفاصيل المنتج والخطط', en: 'Update product details and plans' },
  addNewPlan: { ar: 'إضافة خطة جديدة', en: 'Add New Plan' },
  editPlan: { ar: 'تعديل الخطة', en: 'Edit Plan' },
  saveChanges: { ar: 'حفظ التغييرات', en: 'Save Changes' },
  planNameShortPlaceholder: { ar: 'أساسي، احترافي...', en: 'Basic, Pro...' },
  featurePlaceholder: { ar: 'ميزة...', en: 'Feature...' },
  currentPlans: { ar: 'الخطط الحالية', en: 'Current Plans' },
  updateProduct: { ar: 'تحديث المنتج', en: 'Update Product' },
  manageBuyersDescription: { ar: 'إدارة المشترين وتعيين المنتجات', en: 'Manage buyers and assign products' },
  noBuyersYet: { ar: 'لا يوجد مشترين بعد', en: 'No buyers yet' },
  noProductsAssigned: { ar: 'لا توجد منتجات', en: 'No products' },
  editBuyer: { ar: 'تعديل مشتري', en: 'Edit Buyer' },
  updateBuyerInfo: { ar: 'تحديث معلومت المشتري', en: 'Update buyer information' },
  addNewBuyer: { ar: 'إضافة مشتري جديد إلى النظام', en: 'Add a new buyer to the system' },
  selectProduct: { ar: 'اختر منتج', en: 'Select product' },
  selectPlan: { ar: 'اختر خطة', en: 'Select plan' },
  assignProductTo: { ar: 'تعيين منتج إلى', en: 'Assign a product to' },
  used: { ar: 'مستخدم', en: 'used' },
  editProductDetails: { ar: 'تعديل بيانات المنتج', en: 'Edit Product Details' },
  updateProductDetailsFor: { ar: 'تحديث بيانات المنتج لـ', en: 'Update product details for' },
  currentPlan: { ar: 'الخطة الحالية', en: 'Current Plan' },
  newPlan: { ar: 'الخطة الجديدة', en: 'New Plan' },
  
  // Success Messages
  successful: { ar: 'نجح!', en: 'successful!' },
  addedSuccessfully: { ar: 'تمت الإضافة بنجاح!', en: 'Added successfully!' },
  removedSuccessfully: { ar: 'تمت الإزالة بنجاح!', en: 'Removed successfully!' },
  profileUpdatedSuccess: { ar: 'تم تحديث الملف الشخصي بنجاح!', en: 'Profile updated successfully!' },
  passwordUpdatedSuccess: { ar: 'تم تحديث كلمة المرور بنجاح!', en: 'Password updated successfully!' },
  planAdded: { ar: 'تمت إضافة الخطة!', en: 'Plan added!' },
  planUpdated: { ar: 'تم تحديث الخط!', en: 'Plan updated!' },
  productAddedSuccess: { ar: 'تمت إضافة المنتج بنجا!', en: 'Product added successfully!' },
  productUpdatedSuccess: { ar: 'تم تحديث المنتج بنجاح!', en: 'Product updated successfully!' },
  productDeletedSuccess: { ar: 'تم حذف المنتج بنجاح!', en: 'Product deleted successfully!' },
  buyerAddedSuccess: { ar: 'تمت إضافة المشتري بنجاح!', en: 'Buyer added successfully!' },
  buyerUpdatedSuccess: { ar: 'تم تحديث المشتري بنجاح!', en: 'Buyer updated successfully!' },
  buyerDeletedSuccess: { ar: 'تم حذف المشتري بنجاح!', en: 'Buyer deleted successfully!' },
  productAssignedSuccess: { ar: 'تم تعيين المنتج بنجاح!', en: 'Product assigned successfully!' },
  productRemovedSuccess: { ar: 'تمت إزالة المنتج بنجاح!', en: 'Product removed successfully!' },
  productDetailsUpdatedSuccess: { ar: 'تم تحديث بيانات المنتج بنجاح!', en: 'Product details updated successfully!' },
  registrationSuccess: { ar: 'تم التسجيل بنجاح!', en: 'Registration successful!' },
  
  // Error Messages
  loginFailed: { ar: 'فشل تسجيل الدخول', en: 'Login failed' },
  registrationFailed: { ar: 'فشل التسجيل', en: 'Registration failed' },
  passwordsDoNotMatch: { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  failedToLoadProducts: { ar: 'فشل تحميل المنتجات', en: 'Failed to load products' },
  failedToAddItem: { ar: 'فشلت إضافة العنصر', en: 'Failed to add item' },
  failedToRemoveItem: { ar: 'فشلت إزالة العنصر', en: 'Failed to remove item' },
  realtimeDatabaseNotConfigured: { ar: 'قاعدة البيانات في الوقت الفعلي غير مكونة. يرجى التحقق من إعدادات Firebase.', en: 'Realtime Database not configured. Please check Firebase setup.' },
  maximumDomainsAllowed: { ar: 'الحد الأقصى للدومينات المسموح بها', en: 'Maximum domains allowed' },
  maximumAppIdsAllowed: { ar: 'الحد الأقصى لمعرفات التطبيقات المسموح بها', en: 'Maximum app IDs allowed' },
  fillPlanNameAndPrice: { ar: 'يرجى ملء اسم الخطة والسعر', en: 'Please fill plan name and price' },
  addAtLeastOnePlan: { ar: 'يرجى إضافة خطة واحدة على الأقل', en: 'Please add at least one plan' },
  failedToAddProduct: { ar: 'فشل في إضافة المنتج', en: 'Failed to add product' },
  failedToUpdateProfile: { ar: 'فشل في تحديث الملف الشخصي', en: 'Failed to update profile' },
  failedToUpdatePassword: { ar: 'فشل في تحديث كلمة المرور', en: 'Failed to update password' },
  failedToUpdateProduct: { ar: 'فشل في تحديث المنتج', en: 'Failed to update product' },
  failedToDeleteProduct: { ar: 'فشل في حذف المنتج', en: 'Failed to delete product' },
  confirmDeleteProduct: { ar: 'هل أنت متأكد من أنك تريد حذف هذا المنتج؟', en: 'Are you sure you want to delete this product?' },
  fillAllFields: { ar: 'يرجى ملء جميع الحقول', en: 'Please fill all fields' },
  invalidInput: { ar: 'قيمة غير صالحة', en: 'Invalid input' },
  failedToLoadData: { ar: 'فشل تحميل البيانات', en: 'Failed to load data' },
  failedToAddBuyer: { ar: 'فشل في إضافة المشتري', en: 'Failed to add buyer' },
  failedToUpdateBuyer: { ar: 'فشل في تحديث المشتري', en: 'Failed to update buyer' },
  failedToDeleteBuyer: { ar: 'فشل في حذف المشتري', en: 'Failed to delete buyer' },
  confirmDeleteBuyer: { ar: 'هل أنت متأكد من أنك تريد حذف هذا المشتري؟', en: 'Are you sure you want to delete this buyer?' },
  productAlreadyAssigned: { ar: 'المنتج معين بالفعل لهذا المشتري', en: 'Product already assigned to this buyer' },
  failedToAssignProduct: { ar: 'فشل في تعيين المنتج', en: 'Failed to assign product' },
  confirmRemoveProduct: { ar: 'إزالة هذا المنتج من المشتري؟', en: 'Remove this product from buyer?' },
  failedToRemoveProduct: { ar: 'فشل في إزالة المنتج', en: 'Failed to remove product' },
  
  // Buyers
  buyers: { ar: 'المشترين', en: 'Buyers' },
  buyer: { ar: 'المشتري', en: 'Buyer' },
  addBuyer: { ar: 'إضافة مشتري', en: 'Add Buyer' },
  assignProducts: { ar: 'تعيين المنتجات', en: 'Assign Products' },
  noBuyersYet: { ar: 'لا يوجد مشترين بعد', en: 'No buyers yet' },
  
  // Theme
  darkMode: { ar: 'الوضع المظلم', en: 'Dark Mode' },
  lightMode: { ar: 'الوضع الفاتح', en: 'Light Mode' },
  
  // Permission Alert
  firestorePermissionError: { ar: 'خطأ في صلاحيات Firestore', en: 'Firestore Permission Error' },
  cannotAccessFirestoreData: { ar: 'لا يمكن الوصول إلى بيانات Firestore. عادةً يحدث هذا بسبب عدم تكوين قواعد الأمان.', en: 'The app cannot access Firestore data. This is usually because Security Rules are not configured.' },
  toFixThis: { ar: 'لإصلاح هذا:', en: 'To fix this:' },
  openFirebaseConsole: { ar: 'افتح Firebase Console → Firestore Database → Rules', en: 'Open Firebase Console → Firestore Database → Rules' },
  copyRulesFrom: { ar: 'انسخ القواعد من', en: 'Copy the rules from' },
  clickPublish: { ar: 'انقر على "Publish" لتطبيق', en: 'Click "Publish" to apply' },
  reloadThisPage: { ar: 'أعد تحميل هذه الصفحة', en: 'Reload this page' },
  openFirebaseConsoleBtn: { ar: 'فتح وحدة تحكم Firebase', en: 'Open Firebase Console' },
  reloadPage: { ar: 'إعادة تحميل الصفحة', en: 'Reload Page' },
  seeDocumentation: { ar: 'راجع', en: 'See' },
  forDetailedInstructions: { ar: 'للحصول على تعليمات مفصلة.', en: 'for detailed instructions.' },
  and: { ar: 'و', en: 'and' },
  
  // Auth Errors
  emailNotAuthorized: { ar: 'البريد الإلكتروني غير مصرح به. يرجى الاتصال بالمسؤول.', en: 'Email not authorized. Please contact admin.' },
  
  // Placeholders
  namePlaceholder: { ar: 'أحمد محمد', en: 'John Doe' },
  emailPlaceholder: { ar: 'user@example.com', en: 'john@example.com' },
  
  // Other
  notAvailable: { ar: 'غير متوفر', en: 'N/A' },
  
  // Product Status & Validity
  productStatus: { ar: 'حالة المنتج', en: 'Product Status' },
  active: { ar: 'يعمل', en: 'Active' },
  inactive: { ar: 'لا يعمل', en: 'Inactive' },
  validity: { ar: 'الصلاحية', en: 'Validity' },
  lifetime: { ar: 'مدى الحياة', en: 'Lifetime' },
  specificDate: { ar: 'تاريخ محدد', en: 'Specific Date' },
  expiryDate: { ar: 'تاريخ الانتهاء', en: 'Expiry Date' },
  expired: { ar: 'منتهية الصلاحية', en: 'Expired' },
  notSet: { ar: 'غير محدد', en: 'Not Set' },
  
  // Firebase Project ID
  firebaseProjectId: { ar: 'معرف مشروع Firebase', en: 'Firebase Project ID' },
  enterProjectId: { ar: 'أدخل معرف المشروع', en: 'Enter Project ID' },
  enterProjectIdDesc: { ar: 'أدخل معرف مشروع Firebase الخاص بك', en: 'Enter your Firebase project ID' },
  projectId: { ar: 'معرف المشروع', en: 'Project ID' },
  firebaseProjects: { ar: 'مشاريع Firebase', en: 'Firebase Projects' },
  projects: { ar: 'مشاريع', en: 'projects' },
  addProjectId: { ar: 'إضافة معرف مشروع', en: 'Add Project ID' },
  addFirebaseProjectId: { ar: 'أضف معرف مشروع Firebase جديد', en: 'Add a new Firebase project ID' },
  noProjectsAdded: { ar: 'لم يتم إضافة أي مشاريع', en: 'No projects added' },
  projectIdAlreadyExists: { ar: 'معرف المشروع موجود مسبقاً', en: 'Project ID already exists' },
  pleaseEnterProjectId: { ar: 'الرجاء إدخال معرف المشروع', en: 'Please enter Project ID' },
  pleaseEnterDomain: { ar: 'الرجاء إدخال الدومين', en: 'Please enter domain' },
  noPurchaseId: { ar: 'لا يوجد معرف شراء', en: 'No purchase ID' },
  
  productInactiveMessage: { ar: 'هذا المنتج غير نشط حالياً. يرجى التواصل مع الدعم.', en: 'This product is currently inactive. Please contact support.' },
  productExpiredMessage: { ar: 'انتهت صلاحية هذا المنتج. يرجى التواصل مع الدعم للتجديد.', en: 'This product has expired. Please contact support to renew.' },
  productInactiveOrExpired: { ar: 'المنتج غير نشط أو منتهي الصلاحية', en: 'Product is inactive or expired' },
  
  // App Name
  appName: { ar: 'مدير التراخيص', en: 'License Manager' },
  
  // Support System
  support: { ar: 'الدعم الفني', en: 'Support' },
  supportAdmin: { ar: 'إدارة الدعم', en: 'Support Admin' },
  supportDescription: { ar: 'أرسل تذاكر الدعم وتابع حالتها', en: 'Submit support tickets and track their status' },
  supportAdminDescription: { ar: 'إدارة تذاكر الدعم والرد على المستخدمين', en: 'Manage support tickets and respond to users' },
  newTicket: { ar: 'تذكرة جديدة', en: 'New Ticket' },
  createNewTicket: { ar: 'إنشاء تذكرة جديدة', en: 'Create New Ticket' },
  createNewTicketDescription: { ar: 'املأ التفاصيل وسنرد عليك قريباً', en: 'Fill in the details and we\'ll respond soon' },
  subject: { ar: 'الموضوع', en: 'Subject' },
  message: { ar: 'الرسالة', en: 'Message' },
  submit: { ar: 'إرسال', en: 'Submit' },
  ticketSubjectPlaceholder: { ar: 'مشكلة في التفعيل', en: 'Issue with activation' },
  ticketMessagePlaceholder: { ar: 'اشر مشكلتك بالتفصيل...', en: 'Explain your issue in detail...' },
  ticketCreated: { ar: 'تم إنشاء التذكرة!', en: 'Ticket created!' },
  failedToCreateTicket: { ar: 'فشل في إنشاء التذكرة', en: 'Failed to create ticket' },
  noTickets: { ar: 'لا توجد تذاكر', en: 'No Tickets' },
  noTicketsDescription: { ar: 'لم تقم بإنشاء أي تذاكر دعم بعد', en: 'You haven\'t created any support tickets yet' },
  createFirstTicket: { ar: 'إنشاء أول تذكرة', en: 'Create First Ticket' },
  statusOpen: { ar: 'مفتوحة', en: 'Open' },
  statusReplied: { ar: 'تم الرد', en: 'Replied' },
  statusClosed: { ar: 'مغلقة', en: 'Closed' },
  typeYourMessage: { ar: 'اكتب رسالتك...', en: 'Type your message...' },
  typeYourReply: { ar: 'اكتب ردك...', en: 'Type your reply...' },
  messageSent: { ar: 'تم إرسال الرسالة!', en: 'Message sent!' },
  failedToSendMessage: { ar: 'فشل في إرسال الرسالة', en: 'Failed to send message' },
  failedToLoadTickets: { ar: 'فشل في تحميل التذاكر', en: 'Failed to load tickets' },
  failedToLoadMessages: { ar: 'فشل في تحميل الرسائل', en: 'Failed to load messages' },
  user: { ar: 'مستخدم', en: 'User' },
  admin: { ar: 'إدارة', en: 'Admin' },
  sendReply: { ar: 'إرسال رد', en: 'Send Reply' },
  close: { ar: 'إغلاق', en: 'Close' },
  reopen: { ar: 'إعادة فتح', en: 'Reopen' },
  ticketClosed: { ar: 'تم إغلاق التذكرة', en: 'Ticket closed' },
  failedToCloseTicket: { ar: 'فشل في إغلاق التذكرة', en: 'Failed to close ticket' },
  ticketReopened: { ar: 'تم إعادة فتح التذكرة', en: 'Ticket reopened' },
  failedToReopenTicket: { ar: 'فشل في إعادة فتح التذكرة', en: 'Failed to reopen ticket' },
  deleteTicket: { ar: 'حذف التذكرة', en: 'Delete Ticket' },
  confirmDeleteTicket: { ar: 'هل أنت متأكد من حذف هذه التذكرة؟', en: 'Are you sure you want to delete this ticket?' },
  confirmDeleteTicketDescription: { ar: 'سيتم إخفاء التذكرة من القائمة. ملاحظة: لن يتم إعاد تعيين الحد اليومي', en: 'The ticket will be hidden from the list. Note: Daily limit will not be reset' },
  ticketDeleted: { ar: 'تم حذف التذكرة بنجاح', en: 'Ticket deleted successfully' },
  failedToDeleteTicket: { ar: 'فشل في حذف التذكرة', en: 'Failed to delete ticket' },
  
  // Memberships
  memberships: { ar: 'العضويات', en: 'Memberships' },
  manageMemberships: { ar: 'إدارة العضويات', en: 'Manage Memberships' },
  manageMembershipsDescription: { ar: 'إدارة مستويات العضويات وميزاتها', en: 'Manage membership levels and their features' },
  membershipType: { ar: 'نوع العضوية', en: 'Membership Type' },
  premiumMember: { ar: 'عضو مميز', en: 'Premium Member' },
  regularMember: { ar: 'عضو مشترك', en: 'Regular Member' },
  dailyTicketLimit: { ar: 'حد التذاكر اليومية', en: 'Daily Ticket Limit' },
  ticketsRemaining: { ar: 'التذاكر المتبقية اليوم', en: 'Tickets Remaining Today' },
  dailyLimitReached: { ar: 'تم الوصول إلى الحد اليومي', en: 'Daily Limit Reached' },
  dailyLimitReachedDescription: { ar: 'لقد وصلت إلى الحد الأقصى المسموح به من تذاكر الدعم اليوم. حاول غداً أو قم بترقية عضويتك.', en: 'You have reached your daily support ticket limit. Try tomorrow or upgrade your membership.' },
  upgradeMembership: { ar: 'ترقية العضوية', en: 'Upgrade Membership' },
  membershipFeatures: { ar: 'مميزات العضوية', en: 'Membership Features' },
  premiumFeatures: { ar: 'مميزات العضوية المميزة', en: 'Premium Features' },
  regularFeatures: { ar: 'مميزات العضوية العادية', en: 'Regular Features' },
  ticketsPerDay: { ar: 'تذاكر يومياً', en: 'tickets per day' },
  ticketPerDay: { ar: 'تذكرة يومياً', en: 'ticket per day' },
  updateMembershipType: { ar: 'تحديث نوع العضوية', en: 'Update Membership Type' },
  membershipUpdated: { ar: 'تم تحديث العضوية بنجاح!', en: 'Membership updated successfully!' },
  failedToUpdateMembership: { ar: 'فشل في تحديث العضوية', en: 'Failed to update membership' },
  currentMembership: { ar: 'العضوية الحالية', en: 'Current Membership' },
  yourMembership: { ar: 'عضويتك', en: 'Your Membership' },
  membershipSettings: { ar: 'إعدادات العضويات', en: 'Membership Settings' },
  updateSettings: { ar: 'تحديث الإعدادات', en: 'Update Settings' },
  settingsUpdated: { ar: 'تم تحديث الإعدادات بنجاح!', en: 'Settings updated successfully!' },
  failedToUpdateSettings: { ar: 'فشل في تحديث الإعدادات', en: 'Failed to update settings' },
  ticketLimit: { ar: 'حد التذاكر', en: 'Ticket Limit' },
  premiumTicketLimit: { ar: 'حد تذاكر العضو المميز', en: 'Premium Member Ticket Limit' },
  regularTicketLimit: { ar: 'حد تذاكر العضو المشترك', en: 'Regular Member Ticket Limit' },
  ticketsPerDayLimit: { ar: 'عدد لتذاكر المسموح بها يومياً', en: 'Number of tickets allowed per day' },
  all: { ar: 'الكل', en: 'All' },
  noTicketsInThisCategory: { ar: 'لا توجد تذاكر', en: 'No Tickets' },
  noTicketsInThisCategoryDescription: { ar: 'لا توجد تذاكر في هذا القسم', en: 'No tickets found in this category' },
  
  // Notifications
  enableNotifications: { ar: 'تفعيل الإشعارات', en: 'Enable Notifications' },
  notificationsEnabled: { ar: 'تم تفعيل الإشعارات!', en: 'Notifications enabled!' },
  notificationsEnableFailed: { ar: 'فشل تفعيل الإشعارات', en: 'Failed to enable notifications' },
  enableNotificationsForUpdates: { ar: 'فعّل الإشعارات لتصلك تنبيهات فورية عند ورود ردود', en: 'Enable notifications to receive instant alerts for new replies' },
  enableNotificationsForNewTickets: { ar: 'فعّل الإشعارات لتصلك تنبيهات عند ورود تذاكر جديدة', en: 'Enable notifications to receive alerts for new tickets' },
  newTicketNotification: { ar: 'تذكرة دعم جديدة', en: 'New Support Ticket' },
  newReplyNotification: { ar: 'رد جديد على تذكرتك', en: 'New Reply to Your Ticket' },
  
  // Ticket Details
  originalMessage: { ar: 'الرسالة الأصلية', en: 'Original Message' },
  conversation: { ar: 'المحادثة', en: 'Conversation' },
  replyToTicket: { ar: 'الرد على التذكرة', en: 'Reply to Ticket' },
  ticketIsClosedMessage: { ar: 'هذه التذكرة مغلقة ولا يمكن إضافة ردود جديدة', en: 'This ticket is closed and cannot receive new replies' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Add RTL/LTR class to html element
    if (language === 'ar') {
      document.documentElement.classList.remove('ltr');
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
      document.documentElement.classList.add('ltr');
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar'
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};