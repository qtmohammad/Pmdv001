import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { AccountPage } from './components/AccountPage';
import { MyProductsPage } from './components/MyProductsPage';
import { SupportPage } from './components/SupportPage';
import { AddProductsPage } from './components/AddProductsPage';
import { EditProductsPage } from './components/EditProductsPage';
import { ManageBuyersPage } from './components/ManageBuyersPage';
import { ManageMembershipsPage } from './components/ManageMembershipsPage';
import { SupportAdminPage } from './components/SupportAdminPage';
import { Toaster } from './components/ui/sonner';

// Show setup guide in console
const showSetupGuide = () => {
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6');
  console.log('%c🔥 License Manager - Setup Guide', 'color: #3b82f6; font-size: 16px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6');
  console.log('');
  console.log('%c📖 First time setup:', 'color: #10b981; font-weight: bold');
  console.log('   Read QUICK_START.md for step-by-step instructions');
  console.log('');
  console.log('%c🔒 If you see permission errors:', 'color: #f59e0b; font-weight: bold');
  console.log('   Read FIRESTORE_RULES.md to fix Firestore permissions');
  console.log('');
  console.log('%c🔧 For other issues:', 'color: #ef4444; font-weight: bold');
  console.log('   Read TROUBLESHOOTING.md');
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6');
};

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [authPage, setAuthPage] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [currentPage, setCurrentPage] = useState('my-products');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {authPage === 'login' ? (
          <LoginPage 
            onNavigateToRegister={() => setAuthPage('register')}
            onNavigateToForgotPassword={() => setAuthPage('forgot-password')}
          />
        ) : authPage === 'register' ? (
          <RegisterPage onNavigateToLogin={() => setAuthPage('login')} />
        ) : (
          <ForgotPasswordPage onNavigateToLogin={() => setAuthPage('login')} />
        )}
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'my-products':
        return <MyProductsPage />;
      case 'support':
        return <SupportPage />;
      case 'account':
        return <AccountPage />;
      case 'add-products':
        return <AddProductsPage />;
      case 'edit-products':
        return <EditProductsPage />;
      case 'manage-buyers':
        return <ManageBuyersPage />;
      case 'manage-memberships':
        return <ManageMembershipsPage />;
      case 'support-admin':
        return <SupportAdminPage />;
      default:
        return <MyProductsPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  useEffect(() => {
    showSetupGuide();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
