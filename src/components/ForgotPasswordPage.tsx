import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Package, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success(t('resetEmailSent'));
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific error messages
      let errorMessage = t('resetEmailFailed');
      if (error.code === 'auth/user-not-found') {
        errorMessage = t('emailNotFound');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('tooManyRequests');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('forgotPassword')}</CardTitle>
          <CardDescription>
            {emailSent ? t('checkYourEmail') : t('enterEmailToReset')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  {t('resetEmailSentDescription')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onNavigateToLogin}
              >
                <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rtl:ml-2 rotate-180' : 'mr-2'}`} />
                {t('backToLogin')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:left-auto rtl:right-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rtl:pr-10 rtl:pl-3"
                    dir="ltr"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '...' : t('sendResetLink')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-sm text-blue-600 hover:underline inline-flex items-center gap-2"
                >
                  <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  {t('backToLogin')}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};