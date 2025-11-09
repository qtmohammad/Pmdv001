import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Your Firebase Cloud Messaging VAPID key
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'BIpD8G5O_b1IL0Y7fByLrlK8l0d-_tIXaIPJrI4bgT2oFlQ9rBakZyX359bQnWsEhTFKE_GH-9lInDohGH1IEiU';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Save FCM token to Firestore
 */
export const saveFCMToken = async (userId: string, token: string, isAdmin: boolean = false): Promise<void> => {
  try {
    await setDoc(doc(db, 'fcmTokens', userId), {
      token,
      isAdmin,
      userId,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('FCM token saved successfully');
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

/**
 * Get FCM token for a user
 */
export const getUserFCMToken = async (userId: string): Promise<string | null> => {
  try {
    const docRef = doc(db, 'fcmTokens', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().token;
    }
    return null;
  } catch (error) {
    console.error('Error getting user FCM token:', error);
    return null;
  }
};

/**
 * Get all admin FCM tokens
 */
export const getAdminFCMTokens = async (): Promise<string[]> => {
  try {
    const q = query(collection(db, 'fcmTokens'), where('isAdmin', '==', true));
    const querySnapshot = await getDocs(q);
    
    const tokens: string[] = [];
    querySnapshot.forEach((doc) => {
      tokens.push(doc.data().token);
    });
    
    return tokens;
  } catch (error) {
    console.error('Error getting admin FCM tokens:', error);
    return [];
  }
};

/**
 * Send notification using the notification server
 * This sends a request to your notification server (see notification-server folder)
 */
export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  isAdmin: boolean = false
): Promise<void> => {
  try {
    let tokens: string[] = [];
    
    if (isAdmin) {
      // Send to all admins
      tokens = await getAdminFCMTokens();
    } else {
      // Send to specific user
      const token = await getUserFCMToken(userId);
      if (token) {
        tokens = [token];
      }
    }
    
    if (tokens.length === 0) {
      console.log('No FCM tokens found');
      return;
    }
    
    // Send to your notification server
    // You can deploy this server on Vercel, Railway, Render, or any free hosting
    const NOTIFICATION_SERVER_URL = 'YOUR_NOTIFICATION_SERVER_URL'; // e.g., 'https://your-app.vercel.app/api/send-notification'
    
    const response = await fetch(NOTIFICATION_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens,
        title,
        body,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw error to prevent blocking the main flow
  }
};

/**
 * Setup foreground message listener
 */
export const setupForegroundMessageListener = (callback: (payload: any) => void): void => {
  try {
    const messaging = getMessaging();
    
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title || 'New Notification', {
          body: payload.notification.body,
          icon: payload.notification.icon || '/icon.png',
        });
      }
      
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
  }
};
