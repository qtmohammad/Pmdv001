// Firebase Database URL Checker
// استخدم هذا الملف للتحقق من إعداد Firebase الصحيح

export const checkFirebaseConfig = () => {
  console.group('🔥 Firebase Configuration Check');
  
  const config = {
    projectId: 'mobhm-l',
    possibleDatabaseURLs: [
      'https://mobhm-l-default-rtdb.firebaseio.com',
      'https://mobhm-l-default-rtdb.europe-west1.firebasedatabase.app',
      'https://mobhm-l-default-rtdb.asia-southeast1.firebasedatabase.app',
    ]
  };
  
  console.log('📋 Project ID:', config.projectId);
  console.log('\n🌍 Possible Database URLs:');
  config.possibleDatabaseURLs.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  
  console.log('\n✅ Steps to find your correct Database URL:');
  console.log('  1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('  2. Select your project: mobhm-l');
  console.log('  3. Go to: Build > Realtime Database');
  console.log('  4. If you see "Create Database" button, click it first');
  console.log('  5. Copy the URL from the top of the page');
  console.log('  6. Update databaseURL in /lib/firebase.ts');
  
  console.groupEnd();
};
