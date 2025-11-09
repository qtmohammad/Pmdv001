# 🎯 Firebase Support System - Complete Support Ticket System

A comprehensive Firebase-based support system that runs entirely on the free Spark Plan.

---

## ⚡ Quick Start

### 1️⃣ Fix Imports (Important!)
```bash
npm run fix-imports
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Firebase
- Copy `.env.example` to `.env`
- Add your Firebase credentials

### 4️⃣ Run the Project
```bash
npm run dev
```

📖 **For Details:** Read `START_HERE_AR.md` (Arabic) or `DOWNLOAD_AND_RUN.md`

---

## ✨ Key Features

### 🎫 Support Ticket System
- ✅ Create and track support tickets
- ✅ Real-time messaging between users and admins
- ✅ Ticket statuses: New, In Progress, Closed
- ✅ Instant notifications via FCM
- ✅ Soft delete functionality

### 👥 Membership System
- ✅ Premium Member: 2 tickets/day
- ✅ Standard Member: 1 ticket/day
- ✅ Admin configurable limits

### 📦 Product Management
- ✅ Add, edit, and delete products
- ✅ Support for Domain and App types
- ✅ Link products to buyers
- ✅ Unique Product ID for each product

### 👤 Buyer Management
- ✅ Add new buyers
- ✅ Assign products to buyers
- ✅ Manage membership types
- ✅ Add Domain or App ID

### 🌐 Multi-language Support
- ✅ Arabic and English
- ✅ Automatic RTL/LTR switching
- ✅ Full UI translation

### 🎨 Modern UI
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Shadcn UI components
- ✅ Tailwind CSS

---

## 📁 Project Structure

```
firebase-support-system/
├── components/          # React components
├── contexts/           # React Contexts
├── lib/                # Firebase config
├── styles/             # CSS files
├── public/             # Service Worker
└── [Documentation]     # 50+ guide files
```

---

## 📚 Documentation

### 🚀 Getting Started
- `START_HERE_AR.md` - **Start here!** (Arabic)
- `DOWNLOAD_AND_RUN.md` - Complete download guide
- `INSTALLATION_STEPS_AR.md` - Step-by-step installation
- `QUICK_START.md` - Quick start guide

### 🔧 Setup
- `FIREBASE_SETUP.md` - Firebase setup
- `FIRESTORE_RULES.md` - Firestore rules
- `RTDB_RULES_SETUP.md` - Realtime Database rules
- `FCM_SETUP_GUIDE.md` - Push notifications setup

### 🐛 Troubleshooting
- `FIX_IMPORTS_GUIDE.md` - Fix version number issues
- `FIX_INDEX_ERROR.html` - Fix Firestore Index errors
- `TROUBLESHOOTING.md` - General troubleshooting
- `COMMON_ERRORS.md` - Common errors

### 📖 Features
- `SUPPORT_SYSTEM_README.md` - Support system guide
- `MEMBERSHIP_SYSTEM.md` - Membership system guide
- `DELETE_SUPPORT_TICKETS.md` - Delete tickets guide
- `RTL_SUPPORT.md` - RTL/LTR support

---

## 🛠️ Technologies Used

- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Programming language
- **Firebase 10.7.1** - Database and authentication
  - Authentication
  - Firestore Database
  - Realtime Database
  - Cloud Messaging (FCM)
- **Tailwind CSS 4.0.0** - Styling
- **Shadcn UI** - UI components
- **Vite 5.0.8** - Build tool
- **React Router** - Navigation

---

## ⚙️ Available Commands

```bash
# Fix version numbers in imports
npm run fix-imports

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔐 Security

- ✅ Precise Firebase rules
- ✅ Permission validation
- ✅ Environment variables for secrets
- ✅ Soft delete for tickets (prevents abuse)

---

## 📦 Works on Free Plan

Designed to run entirely on **Firebase Spark Plan** (free):
- ✅ No Cloud Functions required
- ✅ Uses Firestore Triggers
- ✅ External free notification server

---

## 🎯 Target Audience

Perfect for:
- 💼 Small businesses
- 🛍️ E-commerce owners
- 📱 App developers
- 🌐 Website owners
- 👨‍💻 Freelance developers

---

## 🆘 Support & Help

If you encounter any issues:

1. Check `START_HERE_AR.md`
2. Check `TROUBLESHOOTING.md`
3. Check `FIX_IMPORTS_GUIDE.md` (for installation issues)
4. Check `FIX_INDEX_ERROR.html` (for Firestore Index issues)

---

## 📄 License

This project is available for personal and commercial use.

---

## 🙏 Credits

- Firebase - Cloud database
- Shadcn UI - UI components
- Tailwind CSS - Styling framework
- Lucide Icons - Icons

---

## 📞 Contact

For questions and support, refer to the comprehensive documentation included.

---

**🚀 Start Now:** Read `START_HERE_AR.md`

**📅 Last Updated:** November 2024  
**📌 Version:** 1.0.0
