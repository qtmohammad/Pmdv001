import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';
import { CLOUDINARY_FOLDERS } from '../lib/cloudinary';

export const AccountPage: React.FC = () => {
  const { userData, updateUserData, updateUserPassword } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(userData?.name || '');
  const [profileImage, setProfileImage] = useState(userData?.profileImage || '');
  const [profileImagePublicId, setProfileImagePublicId] = useState(userData?.profileImagePublicId || '');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserData({ 
        name,
        profileImage: profileImage || null,
        profileImagePublicId: profileImagePublicId || null
      });
      toast.success(t('profileUpdatedSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string, publicId: string) => {
    setProfileImage(url);
    setProfileImagePublicId(publicId);
  };

  const handleImageRemove = () => {
    setProfileImage('');
    setProfileImagePublicId('');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      await updateUserPassword(passwords.new);
      toast.success(t('passwordUpdatedSuccess'));
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || t('failedToUpdatePassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 rtl:dir-rtl ltr:dir-ltr">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">{t('account')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('personalInfo')}
          </p>
        </div>
        {profileImage && (
          <div className="relative">
            <img
              src={profileImage}
              alt={name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
            />
            {userData?.isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>{t('personalInfo')}</CardTitle>
          </div>
          <CardDescription>
            {t('updatePersonalInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <ImageUploader
              currentImage={profileImage}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              label={t('profilePicture')}
              folder={CLOUDINARY_FOLDERS.USERS}
              aspectRatio="square"
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={userData?.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                  dir="ltr"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-auto rtl:left-3" />
              </div>
              <p className="text-sm text-gray-500">{t('emailCannotBeChanged')}</p>
            </div>

            {userData?.isAdmin && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{t('administratorAccount')}</span>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? '...' : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <CardTitle>{t('changePassword')}</CardTitle>
          </div>
          <CardDescription>
            {t('updatePasswordSecure')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? '...' : t('changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
