import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { MessageSquare, Send, Clock, CheckCircle, XCircle, User, Mail, Trash2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, getDocs, orderBy, onSnapshot, doc, updateDoc, addDoc, Timestamp, where, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ADMIN_UIDS } from '../contexts/AuthContext';
import { ImageLightbox } from './ImageLightbox';
import { uploadToCloudinary } from '../lib/cloudinary';

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
  needsAdminNotification?: boolean;
  isDeleted?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  attachment?: ImageData;
  createdAt: Timestamp;
}

export const SupportAdminPage: React.FC = () => {
  const { userData } = useAuth();
  const { t, isRTL } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [replyImage, setReplyImage] = useState<ImageData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<ImageData[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadTickets();
  }, [userData]);

  useEffect(() => {
    if (selectedTicket) {
      const unsubscribe = loadMessages(selectedTicket.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [selectedTicket]);


  const loadTickets = async () => {
    try {
      const q = query(collection(db, 'supportTickets'));

      const snapshot = await getDocs(q);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];

      // Filter out deleted tickets
      const activeTickets = ticketsData.filter(ticket => !ticket.isDeleted);

      // Sort on client side to avoid needing an index
      activeTickets.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis() || 0;
        const bTime = b.updatedAt?.toMillis() || 0;
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
        sender: 'admin',
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

      // Update ticket status to 'replied'
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        status: 'replied',
        updatedAt: Timestamp.now()
      });

      setNewMessage('');
      setReplyImage(null);
      toast.success(t('messageSent'));
      
      // Refresh tickets to update status
      loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('failedToSendMessage'));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        status: 'closed',
        updatedAt: Timestamp.now()
      });

      toast.success(t('ticketClosed'));
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error(t('failedToCloseTicket'));
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket) return;

    try {
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        status: 'open',
        updatedAt: Timestamp.now()
      });

      toast.success(t('ticketReopened'));
      loadTickets();
    } catch (error) {
      console.error('Error reopening ticket:', error);
      toast.error(t('failedToReopenTicket'));
    }
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
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(t('failedToDeleteTicket'));
    }
  };

  const openLightbox = (images: ImageData[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const confirmDelete = (ticket: Ticket) => {
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

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.status === activeTab;
  });

  const getTicketCounts = () => {
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      replied: tickets.filter(t => t.status === 'replied').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  };

  const counts = getTicketCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">{t('supportAdmin')}</h1>
        <p className="text-muted-foreground mt-1">{t('supportAdminDescription')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {t('all')} ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="open">
            {t('statusOpen')} ({counts.open})
          </TabsTrigger>
          <TabsTrigger value="replied">
            {t('statusReplied')} ({counts.replied})
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t('statusClosed')} ({counts.closed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">{t('noTicketsInThisCategory')}</h3>
                  <p className="text-muted-foreground">{t('noTicketsInThisCategoryDescription')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={() => setSelectedTicket(ticket)}>
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-6">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {ticket.userProfileImage ? (
                          <img
                            src={ticket.userProfileImage}
                            alt={ticket.userName}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                            <span className="text-xl text-white">
                              {ticket.userName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header: Title + Status Badge */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate text-lg">{ticket.subject}</h3>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>

                        {/* User Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">{ticket.userName}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            <span dir="ltr">{ticket.userEmail}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(ticket.updatedAt)}</span>
                          </span>
                        </div>

                        {/* Message Preview */}
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{ticket.message}</p>

                        {/* Attachments Preview */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <div className="flex items-center gap-3 pt-2">
                            <div className="flex gap-2">
                              {ticket.attachments.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img.url}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105"
                                  />
                                  {ticket.attachments && ticket.attachments.length > 4 && idx === 3 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-sm">+{ticket.attachments.length - 4}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              {ticket.attachments.length} {ticket.attachments.length === 1 ? t('image') : t('images')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] p-0 flex flex-col">
            {/* Header with User Info */}
            <SheetHeader className="px-6 py-4 border-b space-y-4">
              {/* User Profile Section */}
              <div className="flex items-start gap-4">
                {selectedTicket.userProfileImage ? (
                  <img
                    src={selectedTicket.userProfileImage}
                    alt={selectedTicket.userName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                    <span className="text-2xl text-white">
                      {selectedTicket.userName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl leading-tight mb-2">{selectedTicket.subject}</SheetTitle>
                  <SheetDescription className="space-y-1.5">
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">{selectedTicket.userName}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span dir="ltr">{selectedTicket.userEmail}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(selectedTicket.createdAt)}</span>
                    </span>
                  </SheetDescription>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(selectedTicket.status)}
                {selectedTicket.status === 'closed' ? (
                  <Button size="sm" variant="outline" onClick={handleReopenTicket}>
                    {t('reopen')}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleCloseTicket}>
                    {t('close')}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => confirmDelete(selectedTicket)}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {t('delete')}
                </Button>
              </div>
            </SheetHeader>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4 space-y-6">
                {/* Original Message */}
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{t('originalMessage')}</Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Display Attachments */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm mb-3 block font-semibold">{t('attachments')} ({selectedTicket.attachments.length})</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                              {t('clickToView')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages/Conversation */}
                {messages.length > 0 && (
                  <div>
                    <Label className="text-sm mb-3 block font-semibold">{t('conversation')}</Label>
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-4 py-3 ${
                              msg.sender === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {msg.sender === 'admin' ? (
                                <Badge variant="secondary" className="text-xs">{t('admin')}</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">{t('user')}</Badge>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
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
                            <p className={`text-xs mt-2 ${msg.sender === 'admin' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Form - Fixed at Bottom */}
            {selectedTicket.status !== 'closed' && (
              <div className="border-t px-6 py-4 bg-background">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <Label className="text-sm font-semibold">{t('replyToTicket')}</Label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('typeYourReply')}
                    disabled={sendingMessage}
                    rows={3}
                    className="resize-none"
                  />
                  
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
                  
                  <div className="flex items-center gap-2">
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
                    
                    {/* Send Button */}
                    <Button 
                      type="submit" 
                      disabled={sendingMessage || !newMessage.trim()}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {t('sendReply')}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="border-t px-6 py-4 bg-muted/30">
                <p className="text-sm text-center text-muted-foreground">
                  {t('ticketIsClosedMessage')}
                </p>
              </div>
            )}
          </SheetContent>
        </Sheet>
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