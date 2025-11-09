import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Package,
  User,
  Plus,
  Edit,
  Users,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Languages,
  MessageSquare,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { userData, logout } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'my-products', icon: Package, label: t('myProducts'), admin: false },
    { id: 'support', icon: MessageSquare, label: t('support'), admin: false },
    { id: 'account', icon: User, label: t('account'), admin: false },
  ];

  const adminItems = [
    { id: 'add-products', icon: Plus, label: t('addProducts'), admin: true },
    { id: 'edit-products', icon: Edit, label: t('editProducts'), admin: true },
    { id: 'manage-buyers', icon: Users, label: t('manageBuyers'), admin: true },
    { id: 'manage-memberships', icon: Crown, label: t('manageMemberships'), admin: true },
    { id: 'support-admin', icon: MessageSquare, label: t('supportAdmin'), admin: true },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              <span className="text-lg">{t('appName')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userData?.profileImage ? (
              <img
                src={userData.profileImage}
                alt={userData.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 hidden sm:block"
                onClick={() => onNavigate('account')}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hidden sm:block cursor-pointer"
                onClick={() => onNavigate('account')}
              >
                <span className="text-sm text-white">
                  {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 w-64 
          bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 z-50 pt-16
          ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
          ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-4">
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-700">
                    <span className="text-2xl text-white">
                      {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                {userData?.isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userData?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" dir="ltr">
                  {userData?.email}
                </p>
                {!userData?.isAdmin && (
                  <div className="mt-2">
                    {userData?.membershipType === 'premium' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Crown className="w-3 h-3" />
                        {t('premiumMember')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-500 text-white">
                        <User className="w-3 h-3" />
                        {t('regularMember')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${currentPage === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}

            {userData?.isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('adminPanel')}
                  </p>
                </div>
                {adminItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${currentPage === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`pt-16 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'} min-h-screen`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
