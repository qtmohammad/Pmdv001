import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { MessageSquare, Plus, Send, Clock, CheckCircle, XCircle, Bell, AlertCircle, Trash2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requestNotificationPermission, saveFCMToken } from '../lib/fcm';
import { getMembershipSettings } from '../lib/membershipSettings';
import { MultiImageUploader } from './MultiImageUploader';
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from '../lib/cloudinary';
import { ImageLightbox } from './ImageLightbox';

interface ImageData {
  url: string;
  publicId: string;
}

interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userProfileImage?: string | null;
  subject: string;
  message: string;
  attachments?: ImageData[];
  status: 'open' | 'replied' | 'closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  attachment?: ImageData;
  createdAt: Timestamp;
}

export const SupportPage: React.FC = () => {
  const { userData } = useAuth();
  const { t, isRTL } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyLimits, setDailyLimits] = useState({ premium: 2, regular: 1 });
  const [todayTicketsCount, setTodayTicketsCount] = useState(0);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<ImageData[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<ImageData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Reply form
  const [replyImage, setReplyImage] = useState<ImageData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData?.uid) {
      loadTickets();
      checkNotificationPermission();
      loadDailyLimits();
      checkTodayTickets();
    }
  }, [userData]);

  useEffect(() => {
    // Recheck when tickets or daily limits change
    if (userData?.uid) {
      checkTodayTickets();
    }
  }, [tickets, dailyLimits, userData]);

  useEffect(() => {
    if (selectedTicket) {
      const unsubscribe = loadMessages(selectedTicket.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [selectedTicket]);

  const loadDailyLimits = async () => {
    try {
      const settings = await getMembershipSettings();
      setDailyLimits({
        premium: settings.premiumDailyLimit,
        regular: settings.regularDailyLimit
      });
    } catch (error) {
      console.error('Error loading daily limits:', error);
    }
  };

  const checkTodayTickets = async () => {
    if (!userData?.uid) return;

    try {
      const count = await getTodayTicketsCount();
      setTodayTicketsCount(count);

      // Get daily limit
      const membershipType = userData.membershipType || 'regular';
      const dailyLimit = membershipType === 'premium' ? dailyLimits.premium : dailyLimits.regular;

      // Check if can create more tickets
      setCanCreateTicket(count < dailyLimit);
    } catch (error) {
      console.error('Error checking today tickets:', error);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token && userData?.uid) {
        await saveFCMToken(userData.uid, token);
        setNotificationsEnabled(true);
        toast.success(t('notificationsEnabled'));
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(t('notificationsEnableFailed'));
    }
  };

  const loadTickets = async () => {
    if (!userData?.uid) return;

    try {
      const q = query(
        collection(db, 'supportTickets'),
        where('userId', '==', userData.uid)
      );

      const snapshot = await getDocs(q);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];

      // Filter out deleted tickets
      const activeTickets = ticketsData.filter(ticket => !ticket.isDeleted);

      // Sort on client side to avoid needing a composite index
      activeTickets.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime; // descending order
      });

      setTickets(activeTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error(t('failedToLoadTickets'));
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (ticketId: string) => {
    try {
      const q = query(
        collection(db, 'supportTickets', ticketId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(messagesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error(t('failedToLoadMessages'));
      return null;
    }
  };

  const checkDailyLimit = async (): Promise<boolean> => {
    if (!userData?.uid) return false;

    try {
      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      // Query tickets created today
      const q = query(
        collection(db, 'supportTickets'),
        where('userId', '==', userData.uid),
        where('createdAt', '>=', todayTimestamp)
      );

      const snapshot = await getDocs(q);
      const todayTicketsCount = snapshot.size;

      // Get daily limit based on membership from settings
      const settings = await getMembershipSettings();
      const membershipType = userData.membershipType || 'regular';
      const dailyLimit = membershipType === 'premium' ? settings.premiumDailyLimit : settings.regularDailyLimit;

      return todayTicketsCount < dailyLimit;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return true; // Allow on error to not block users
    }
  };

  const getTodayTicketsCount = async (): Promise<number> => {
    if (!userData?.uid) return 0;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const q = query(
        collection(db, 'supportTickets'),
        where('userId', '==', userData.uid),
        where('createdAt', '>=', todayTimestamp)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error: any) {
      console.error('Error getting today tickets count:', error);
      
      // Check if it's an index error
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.error('\n' + '='.repeat(80));
        console.error('🚨 FIRESTORE INDEX ERROR - ACTION REQUIRED 🚨');
        console.error('='.repeat(80));
        console.error('\n📋 QUICK FIX (30 seconds):');
        console.error('\n1. Open this file: 🚨_FIX_INDEX_ERROR_NOW.md');
        console.error('2. Copy the Firebase Console link');
        console.error('3. Click "Create Index"');
        console.error('4. Wait 2-3 minutes');
        console.error('5. Reload this page\n');
        console.error('Or copy and open this link now:');
        console.error('👉 https://console.firebase.google.com/project/mobhm-l/firestore/indexes\n');
        console.error('='.repeat(80) + '\n');
      }
      
      return 0;
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid || !subject.trim() || !message.trim()) return;

    // Check daily limit
    const canCreate = await checkDailyLimit();
    if (!canCreate) {
      toast.error(t('dailyLimitReached'), {
        description: t('dailyLimitReachedDescription')
      });
      return;
    }

    setSubmitting(true);

    try {
      const ticketData = {
        userId: userData.uid,
        userEmail: userData.email,
        userName: userData.name,
        userProfileImage: userData.profileImage || null,
        subject: subject.trim(),
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : [],
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        needsAdminNotification: true
      };

      const docRef = await addDoc(collection(db, 'supportTickets'), ticketData);

      // Add initial message
      await addDoc(collection(db, 'supportTickets', docRef.id, 'messages'), {
        sender: 'user',
        text: message.trim(),
        createdAt: Timestamp.now()
      });

      toast.success(t('ticketCreated'));
      setSubject('');
      setMessage('');
      setAttachments([]);
      setDialogOpen(false);
      loadTickets();
      // Recheck today's tickets count
      await checkTodayTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(t('failedToCreateTicket'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('pleaseSelectImageFile'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('imageTooLarge'));
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file, 'support_replies');
      setReplyImage({ 
        url: result.url, 
        publicId: result.publicId || result.public_id 
      });
      toast.success(t('imageUploaded'));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('imageUploadFailed'));
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);

    try {
      // Add message with optional attachment
      const messageData: any = {
        sender: 'user',
        text: newMessage.trim(),
        createdAt: Timestamp.now()
      };
      
      if (replyImage && replyImage.url && replyImage.publicId) {
        messageData.attachment = {
          url: replyImage.url,
          publicId: replyImage.publicId
        };
      }
      
      await addDoc(collection(db, 'supportTickets', selectedTicket.id, 'messages'), messageData);

      // Update ticket status and set notification flag
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        status: 'open',
        updatedAt: Timestamp.now(),
        needsAdminNotification: true
      });

      setNewMessage('');
      setReplyImage(null);
      toast.success(t('messageSent'));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('failedToSendMessage'));
    } finally {
      setSendingMessage(false);
    }
  };

  const openLightbox = (images: ImageData[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      // Soft delete: Mark ticket as deleted instead of removing it
      // This preserves the ticket for daily limit calculations
      await updateDoc(doc(db, 'supportTickets', ticketToDelete.id), {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      toast.success(t('ticketDeleted'));
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
      setSelectedTicket(null);
      loadTickets();
      // No need to call checkTodayTickets() as the count remains the same
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(t('failedToDeleteTicket'));
    }
  };

  const confirmDelete = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the ticket dialog
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const statusConfig = {
      open: { label: t('statusOpen'), variant: 'default' as const, icon: Clock },
      replied: { label: t('statusReplied'), variant: 'secondary' as const, icon: CheckCircle },
      closed: { label: t('statusClosed'), variant: 'outline' as const, icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    return timestamp.toDate().toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!notificationsEnabled && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                  {t('enableNotificationsForUpdates')}
                </p>
                <Button size="sm" onClick={handleEnableNotifications}>
                  {t('enableNotifications')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userData?.membershipType === 'premium' ? (
                <>
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm">{t('yourMembership')}</p>
                    <p className="font-semibold">{t('premiumMember')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gray-500 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm">{t('yourMembership')}</p>
                    <p className="font-semibold">{t('regularMember')}</p>
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('dailyTicketLimit')}</p>
              <p className="text-2xl">
                {userData?.membershipType === 'premium' ? dailyLimits.premium : dailyLimits.regular} {(userData?.membershipType === 'premium' ? dailyLimits.premium : dailyLimits.regular) === 1 ? t('ticketPerDay') : t('ticketsPerDay')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ticketsRemaining')}</p>
              <p className={`text-2xl ${canCreateTicket ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {Math.max(0, (userData?.membershipType === 'premium' ? dailyLimits.premium : dailyLimits.regular) - todayTicketsCount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!canCreateTicket && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('dailyLimitReached')}</AlertTitle>
          <AlertDescription>
            {t('dailyLimitReachedDescription')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">{t('support')}</h1>
          <p className="text-muted-foreground mt-1">{t('supportDescription')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateTicket}>
              <Plus className="w-4 h-4" />
              {t('newTicket')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('createNewTicket')}</DialogTitle>
              <DialogDescription>{t('createNewTicketDescription')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">{t('subject')}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('ticketSubjectPlaceholder')}
                  required
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('message')}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('ticketMessagePlaceholder')}
                  required
                  rows={6}
                  maxLength={2000}
                />
              </div>
              
              {/* Image Attachments */}
              <div className="space-y-2">
                <MultiImageUploader
                  images={attachments}
                  onImagesChange={setAttachments}
                  label={t('attachImages')}
                  folder={CLOUDINARY_FOLDERS.SUPPORT_TICKETS}
                  maxImages={3}
                  maxSizeMB={5}
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('attachImagesOptional')}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '...' : t('submit')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">{t('noTickets')}</h3>
              <p className="text-muted-foreground mb-4">{t('noTicketsDescription')}</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('createFirstTicket')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(ticket.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => confirmDelete(ticket, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-2">
                      {ticket.attachments.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {ticket.attachments.length} {ticket.attachments.length === 1 ? t('image') : t('images')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="truncate">{selectedTicket.subject}</DialogTitle>
                  <DialogDescription>{formatDate(selectedTicket.createdAt)}</DialogDescription>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>
            </DialogHeader>
            
            {/* Display Attachments */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div className="border-b pb-4">
                <Label className="text-sm mb-2 block">{t('attachments')}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {selectedTicket.attachments.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openLightbox(selectedTicket.attachments!, idx)}
                      className="relative aspect-square group cursor-pointer"
                    >
                      <img
                        src={img.url}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                          {t('clickToView')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    {msg.attachment && (
                      <div className="mt-3">
                        <img
                          src={msg.attachment.url}
                          alt="Attachment"
                          className="max-w-full max-h-64 rounded-lg border-2 border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openLightbox([msg.attachment!], 0)}
                        />
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'closed' && (
              <div className="pt-4 border-t">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  {/* Image Preview */}
                  {replyImage && (
                    <div className="relative inline-block">
                      <img
                        src={replyImage.url}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setReplyImage(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                        disabled={sendingMessage}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={sendingMessage || uploadingImage}
                    />
                    
                    {/* Attach Image Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sendingMessage || uploadingImage || !!replyImage}
                      title={t('attachImage')}
                    >
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                    
                    {/* Message Input */}
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('typeYourMessage')}
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    
                    {/* Send Button */}
                    <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTicket')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteTicketDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTicket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};