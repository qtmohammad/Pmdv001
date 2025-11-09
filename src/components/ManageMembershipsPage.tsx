import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Edit, Crown, Users, CheckCircle2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getMembershipSettings, updateMembershipSettings, MembershipSettings } from '../lib/membershipSettings';

interface Buyer {
  id: string;
  name: string;
  email: string;
  membershipType: 'premium' | 'regular';
}

export const ManageMembershipsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [newMembershipType, setNewMembershipType] = useState<'premium' | 'regular'>('regular');
  const [settings, setSettings] = useState<MembershipSettings>({
    premiumDailyLimit: 2,
    regularDailyLimit: 1
  });
  const [newSettings, setNewSettings] = useState<MembershipSettings>({
    premiumDailyLimit: 2,
    regularDailyLimit: 1
  });

  useEffect(() => {
    loadBuyers();
    loadSettings();
  }, []);

  const loadBuyers = async () => {
    try {
      const buyersSnapshot = await getDocs(collection(db, 'buyers'));
      const buyersData: Buyer[] = [];
      buyersSnapshot.forEach((doc) => {
        const data = doc.data();
        buyersData.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          membershipType: data.membershipType || 'regular'
        });
      });
      setBuyers(buyersData);
    } catch (error) {
      console.error('Error loading buyers:', error);
      toast.error(t('failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const membershipSettings = await getMembershipSettings();
      setSettings(membershipSettings);
      setNewSettings(membershipSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(t('failedToLoadData'));
    }
  };

  const openEditDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setNewMembershipType(buyer.membershipType);
    setEditDialogOpen(true);
  };

  const handleUpdateMembership = async () => {
    if (!selectedBuyer) return;

    try {
      await updateDoc(doc(db, 'buyers', selectedBuyer.id), {
        membershipType: newMembershipType,
        updatedAt: new Date().toISOString()
      });

      toast.success(t('membershipUpdated'));
      setEditDialogOpen(false);
      loadBuyers();
    } catch (error) {
      console.error('Error updating membership:', error);
      toast.error(t('failedToUpdateMembership'));
    }
  };

  const handleUpdateSettings = async () => {
    try {
      // Validate input
      if (newSettings.premiumDailyLimit < 1 || newSettings.regularDailyLimit < 1) {
        toast.error(t('invalidInput'));
        return;
      }

      await updateMembershipSettings(newSettings);
      setSettings(newSettings);
      toast.success(t('settingsUpdated'));
      setSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(t('failedToUpdateSettings'));
    }
  };

  const openSettingsDialog = () => {
    setNewSettings(settings);
    setSettingsDialogOpen(true);
  };

  const getMembershipBadge = (type: 'premium' | 'regular') => {
    if (type === 'premium') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <Crown className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
          {t('premiumMember')}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Users className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {t('regularMember')}
      </Badge>
    );
  };

  const getDailyLimit = (type: 'premium' | 'regular') => {
    return type === 'premium' ? settings.premiumDailyLimit : settings.regularDailyLimit;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const premiumCount = buyers.filter(b => b.membershipType === 'premium').length;
  const regularCount = buyers.filter(b => b.membershipType === 'regular').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">{t('manageMemberships')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('manageMembershipsDescription')}
          </p>
        </div>
        <Button onClick={openSettingsDialog} variant="outline">
          <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('membershipSettings')}
        </Button>
      </div>

      {/* Membership Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t('buyers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{buyers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              {t('premiumMember')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{premiumCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              {t('regularMember')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{regularCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              {t('premiumFeatures')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{settings.premiumDailyLimit} {settings.premiumDailyLimit === 1 ? t('ticketPerDay') : t('ticketsPerDay')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              {t('regularFeatures')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{settings.regularDailyLimit} {settings.regularDailyLimit === 1 ? t('ticketPerDay') : t('ticketsPerDay')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Buyers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('buyers')} ({buyers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {buyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('noBuyersYet')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('membershipType')}</TableHead>
                    <TableHead>{t('dailyTicketLimit')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>{buyer.name}</TableCell>
                      <TableCell dir="ltr">{buyer.email}</TableCell>
                      <TableCell>{getMembershipBadge(buyer.membershipType)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getDailyLimit(buyer.membershipType)} {getDailyLimit(buyer.membershipType) === 1 ? t('ticketPerDay') : t('ticketsPerDay')}
                        </span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(buyer)}
                        >
                          <Edit className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {t('edit')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Membership Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('updateMembershipType')}</DialogTitle>
            <DialogDescription>
              {t('updateProductDetailsFor')} {selectedBuyer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('currentMembership')}</Label>
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                {selectedBuyer && getMembershipBadge(selectedBuyer.membershipType)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('membershipType')}</Label>
              <Select
                value={newMembershipType}
                onValueChange={(value) => setNewMembershipType(value as 'premium' | 'regular')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('regularMember')} - {settings.regularDailyLimit} {settings.regularDailyLimit === 1 ? t('ticketPerDay') : t('ticketsPerDay')}
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      {t('premiumMember')} - {settings.premiumDailyLimit} {settings.premiumDailyLimit === 1 ? t('ticketPerDay') : t('ticketsPerDay')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateMembership} className="flex-1">
                {t('update')}
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Membership Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('membershipSettings')}</DialogTitle>
            <DialogDescription>
              {t('ticketsPerDayLimit')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="premiumLimit" className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                {t('premiumTicketLimit')}
              </Label>
              <Input
                id="premiumLimit"
                type="number"
                min="1"
                max="100"
                value={newSettings.premiumDailyLimit}
                onChange={(e) => setNewSettings({
                  ...newSettings,
                  premiumDailyLimit: parseInt(e.target.value) || 1
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularLimit" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                {t('regularTicketLimit')}
              </Label>
              <Input
                id="regularLimit"
                type="number"
                min="1"
                max="100"
                value={newSettings.regularDailyLimit}
                onChange={(e) => setNewSettings({
                  ...newSettings,
                  regularDailyLimit: parseInt(e.target.value) || 1
                })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateSettings} className="flex-1">
                {t('updateSettings')}
              </Button>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};