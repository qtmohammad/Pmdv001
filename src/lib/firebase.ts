// Firebase Configuration
// Replace these values with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCJMDrEQe39olcEidXcc7moMaYV_tqBT3c",
  authDomain: "mobhm-l.firebaseapp.com",
  databaseURL: "https://mobhm-l-default-rtdb.firebaseio.com",
  projectId: "mobhm-l",
  storageBucket: "mobhm-l.firebasestorage.app",
  messagingSenderId: "581786490125",
  appId: "1:581786490125:web:267a396ee32b0c3792cc44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Realtime Database
// IMPORTANT: Make sure you have created a Realtime Database in Firebase Console
// Steps:
// 1. Go to Firebase Console > Build > Realtime Database
// 2. Click "Create Database" if you haven't already
// 3. Copy the exact database URL and update the databaseURL above
// 
// Common issues:
// - Database not created yet in Firebase Console
// - Wrong URL format (should be https://PROJECT-ID.firebaseio.com or similar)
// - Database in different region (check Firebase Console for exact URL)

let rtdb;
try {
  // Try to initialize with the databaseURL from config
  rtdb = getDatabase(app);
  console.log('✅ Realtime Database initialized successfully');
} catch (error: any) {
  console.error('❌ Failed to initialize Realtime Database');
  console.error('Error:', error.message);
  console.log('\n📝 Please check:');
  console.log('1. Have you created a Realtime Database in Firebase Console?');
  console.log('2. Is the databaseURL correct in firebaseConfig?');
  console.log('3. Check Firebase Console > Realtime Database for the correct URL');
  console.log('\nCurrent databaseURL:', firebaseConfig.databaseURL);
  
  // Create a dummy rtdb object to prevent crashes
  rtdb = null as any;
}

export { rtdb };

export default app;
