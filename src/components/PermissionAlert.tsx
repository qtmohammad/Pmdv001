import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export const PermissionAlert: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg">{t('firestorePermissionError')}</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            {t('cannotAccessFirestoreData')}
          </p>
          
          <div className="bg-red-50 dark:bg-red-950/50 p-3 rounded-md text-sm">
            <p className="mb-2">{t('toFixThis')}</p>
            <ol className={`list-decimal space-y-1 ${isRTL ? 'list-inside pr-4' : 'list-inside pl-4'}`}>
              <li>{t('openFirebaseConsole')}</li>
              <li>{t('copyRulesFrom')} <code className="bg-red-100 dark:bg-red-900 px-1 rounded">/FIRESTORE_RULES.md</code></li>
              <li>{t('clickPublish')}</li>
              <li>{t('reloadThisPage')}</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            >
              <ExternalLink className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('openFirebaseConsoleBtn')}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              {t('reloadPage')}
            </Button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('seeDocumentation')} <strong>FIRESTORE_RULES.md</strong> {t('and')} <strong>QUICK_START.md</strong> {t('forDetailedInstructions')}
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};
