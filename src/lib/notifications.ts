import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import app from './firebase';

let messaging: any = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase Messaging not supported in this environment:', error);
}

export const requestNotificationPermission = async (userId: string): Promise<boolean> => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      try {
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY_HERE'
        });
        
        if (token) {
          await saveFCMToken(userId, token);
          console.log('✅ FCM token saved successfully');
          return true;
        } else {
          console.warn('No FCM token available');
          return false;
        }
      } catch (tokenError: any) {
        console.error('Error getting FCM token:', tokenError);
        if (tokenError.code === 'messaging/token-subscribe-failed') {
          console.error('Make sure you have a valid VAPID key configured');
        }
        return false;
      }
    } else {
      console.log('ℹ️ Notification permission denied');
      return false;
    }
  } catch (error: any) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
  try {
    const tokenRef = doc(db, 'buyers', userId, 'notificationTokens', token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      platform: 'web'
    });
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

export const deleteFCMToken = async (userId: string, token: string): Promise<void> => {
  try {
    const tokenRef = doc(db, 'buyers', userId, 'notificationTokens', token);
    await deleteDoc(tokenRef);
  } catch (error: any) {
    console.error('Error deleting FCM token:', error);
  }
};

export const setupNotificationListener = (onNotificationReceived: (payload: any) => void): (() => void) | null => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📬 Notification received:', payload);
      onNotificationReceived(payload);
      
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        if (Notification.permission === 'granted') {
          new Notification(title || 'إشعار جديد', {
            body: body || '',
            icon: '/icon.png',
            badge: '/badge.png'
          });
        }
      }
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up notification listener:', error);
    return null;
  }
};

export const checkNotificationPermission = (): NotificationPermission | null => {
  if (typeof Notification === 'undefined') {
    return null;
  }
  return Notification.permission;
};

export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    const tokensRef = collection(db, 'buyers', userId, 'notificationTokens');
    const tokensSnapshot = await getDoc(doc(tokensRef.parent!.parent!, tokensRef.parent!.id));
    
    console.log('📤 Sending notification to user:', userId);
    console.log('Note: Actual sending requires backend notification server or Cloud Function');
    
    return true;
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return false;
  }
};
