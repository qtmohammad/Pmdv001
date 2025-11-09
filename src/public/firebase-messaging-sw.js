// Firebase Cloud Messaging Service Worker
// This file handles background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Replace with your Firebase config
firebase.initializeApp({
 apiKey: "AIzaSyCJMDrEQe39olcEidXcc7moMaYV_tqBT3c",
  authDomain: "mobhm-l.firebaseapp.com",
  databaseURL: "https://mobhm-l-default-rtdb.firebaseio.com",
  projectId: "mobhm-l",
  storageBucket: "mobhm-l.firebasestorage.app",
  messagingSenderId: "581786490125",
  appId: "1:581786490125:web:267a396ee32b0c3792cc44"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon.png',
    badge: '/badge.png',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
