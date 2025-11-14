import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, Timestamp, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  ticketId?: string;
  type: 'ticket_reply' | 'new_ticket' | 'ticket_closed' | 'ticket_reopened';
  readAt?: Timestamp | null;
  createdAt: Timestamp;
}

let notificationPermissionGranted = false;

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    notificationPermissionGranted = permission === 'granted';
    return notificationPermissionGranted;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled
 */
export const checkNotificationPermission = (): boolean => {
  if (!('Notification' in window)) return false;
  notificationPermissionGranted = Notification.permission === 'granted';
  return notificationPermissionGranted;
};

/**
 * Show browser notification
 */
const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (!notificationPermissionGranted || !('Notification' in window)) return;

  try {
    new Notification(title, {
      body,
      icon: icon || '/icon.png',
      badge: '/badge.png',
    });
  } catch (error) {
    console.error('Error showing browser notification:', error);
  }
};

/**
 * Create a notification in Firestore
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  ticketId?: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      ticketId: ticketId || null,
      readAt: null,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('readAt', '==', null)
    );
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { readAt: Timestamp.now() })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

/**
 * Listen to notifications for a user (real-time)
 */
export const listenToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    
    snapshot.docChanges().forEach((change) => {
      const notification = { 
        id: change.doc.id, 
        ...change.doc.data() 
      } as Notification;
      
      // Show browser notification for new unread notifications
      if (change.type === 'added' && !notification.readAt) {
        showBrowserNotification(notification.title, notification.message);
      }
      
      notifications.push(notification);
    });

    const allNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    callback(allNotifications);
  });

  return unsubscribe;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('readAt', '==', null)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Send notification to admin(s)
 * Admin user IDs should be defined in your config
 */
export const notifyAdmins = async (
  title: string,
  message: string,
  type: Notification['type'],
  adminUids: string[],
  ticketId?: string
): Promise<void> => {
  try {
    const promises = adminUids.map(adminId =>
      createNotification(adminId, title, message, type, ticketId)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};
