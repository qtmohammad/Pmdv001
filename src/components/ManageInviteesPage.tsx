import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail, Users, Calendar, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface Invitee {
  id: string;
  canonicalEmail: string;
  invitedBy: string;
  invitedAt: string;
  inviteReason?: string;
}

export const ManageInviteesPage: React.FC = () => {
  const { t } = useLanguage();
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    inviteReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInvitees();
  }, []);

  const loadInvitees = async () => {
    try {
      setLoading(true);
      const inviteesQuery = query(collection(db, 'invitees'), orderBy('invitedAt', 'desc'));
      const snapshot = await getDocs(inviteesQuery);
      
      const loadedInvitees: Invitee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        canonicalEmail: doc.data().canonicalEmail || '',
        invitedBy: doc.data().invitedBy || 'admin',
        invitedAt: doc.data().invitedAt || '',
        inviteReason: doc.data().inviteReason || ''
      }));
      
      setInvitees(loadedInvitees);
    } catch (error: any) {
      console.error('Error loading invitees:', error);
      toast.error(t('errorLoadingData') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvitee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error(t('pleaseEnterEmail') || 'الرجاء إدخال البريد الإلكتروني');
      return;
    }

    setSubmitting(true);
    
    try {
      const normalizedEmail = formData.email.toLowerCase().trim();
      const inviteeId = normalizedEmail.replace(/[.@]/g, '_');
      
      const inviteeRef = doc(db, 'invitees', inviteeId);
      
      await setDoc(inviteeRef, {
        canonicalEmail: normalizedEmail,
        invitedBy: 'admin',
        invitedAt: new Date().toISOString(),
        inviteReason: formData.inviteReason.trim()
      });
      
      toast.success(t('inviteeAdded') || 'تمت إضافة المدعو بنجاح');
      setFormData({ email: '', inviteReason: '' });
      setShowAddDialog(false);
      await loadInvitees();
    } catch (error: any) {
      console.error('Error adding invitee:', error);
      toast.error(t('errorAddingInvitee') || 'خطأ في إضافة المدعو');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvitee = async (inviteeId: string, email: string) => {
    if (!confirm(t('confirmDeleteInvitee') || `هل تريد حذف المدعو ${email}؟`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'invitees', inviteeId));
      toast.success(t('inviteeDeleted') || 'تم حذف المدعو بنجاح');
      await loadInvitees();
    } catch (error: any) {
      console.error('Error deleting invitee:', error);
      toast.error(t('errorDeletingInvitee') || 'خطأ في حذف المدعو');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              {t('manageInvitees') || 'إدارة المدعويين'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('manageInviteesDescription') || 'إضافة وإدارة المستخدمين المدعويين للتسجيل في النظام'}
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                {t('addInvitee') || 'إضافة مدعو'}
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>{t('addNewInvitee') || 'إضافة مدعو جديد'}</DialogTitle>
                <DialogDescription>
                  {t('addInviteeDescription') || 'أدخل البريد الإلكتروني للمستخدم المدعو'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddInvitee}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email') || 'البريد الإلكتروني'}</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inviteReason">{t('inviteReason') || 'سبب الدعوة (اختياري)'}</Label>
                    <Textarea
                      id="inviteReason"
                      placeholder={t('inviteReasonPlaceholder') || 'مثال: عميل جديد، شريك تجاري، إلخ'}
                      value={formData.inviteReason}
                      onChange={(e) => setFormData({ ...formData, inviteReason: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (t('adding') || 'جاري الإضافة...') : (t('add') || 'إضافة')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {t('inviteesInfo') || 'المستخدمون المدعوون هم الأشخاص المصرح لهم بإنشاء حسابات جديدة. بعد التسجيل، سيتم نقلهم تلقائياً إلى قائمة المشترين.'}
          </AlertDescription>
        </Alert>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : invitees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {t('noInvitees') || 'لا يوجد مدعوون حالياً'}
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {t('addFirstInvitee') || 'إضافة أول مدعو'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invitees.map((invitee) => (
            <Card key={invitee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                          {invitee.canonicalEmail}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(invitee.invitedAt)}
                        </div>
                      </div>
                    </div>
                    
                    {invitee.inviteReason && (
                      <div className="mr-12 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('reason') || 'السبب'}:</span> {invitee.inviteReason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteInvitee(invitee.id, invitee.canonicalEmail)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete') || 'حذف'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
