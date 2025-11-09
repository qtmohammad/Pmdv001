/**
 * 🧹 RTDB Data Cleanup Script
 * سكريبت تنظيف بيانات Realtime Database
 * 
 * هذا السكريبت يقوم بتنظيف البنية الخاطئة للبيانات في RTDB
 * This script cleans up incorrect data structure in RTDB
 * 
 * الاستخدام / Usage:
 * 1. قم بتثبيت Firebase Admin SDK
 * 2. ضع ملف serviceAccountKey.json في المجلد الرئيسي
 * 3. شغل: node cleanup-rtdb-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "YOUR_RTDB_URL_HERE" // مثال: https://your-project.firebaseio.com
});

const db = admin.database();

/**
 * تنظيف بيانات المنتج
 * Clean product data
 */
async function cleanProductData(licenseType, productId, userId, data) {
  console.log(`🧹 تنظيف ${licenseType}/${productId}/${userId}...`);
  
  // البنية النظيفة
  const cleanData = {
    isActive: data.isActive !== undefined ? data.isActive : true,
    expiryType: data.expiryType || 'lifetime'
  };
  
  // إضافة expiryDate إذا كان موجود
  if (data.expiryDate) {
    cleanData.expiryDate = data.expiryDate;
  }
  
  // إضافة المصفوفات المناسبة
  if (licenseType === 'apps') {
    cleanData.appIds = extractArray(data, 'appIds');
  } else if (licenseType === 'domains') {
    cleanData.domains = extractArray(data, 'domains');
  }
  
  return cleanData;
}

/**
 * استخراج المصفوفة من البيانات المعقدة
 * Extract array from complex data
 */
function extractArray(data, key) {
  // إذا كانت موجودة ومصفوفة، أرجعها
  if (Array.isArray(data[key])) {
    return data[key];
  }
  
  // ابحث في البنية المتداخلة
  for (const k in data) {
    if (typeof data[k] === 'object' && data[k] !== null) {
      if (Array.isArray(data[k][key])) {
        return data[k][key];
      }
      // بحث متداخل
      const result = extractArray(data[k], key);
      if (result.length > 0) {
        return result;
      }
    }
  }
  
  return [];
}

/**
 * تنظيف جميع البيانات
 * Clean all data
 */
async function cleanupAllData() {
  console.log('🚀 بدء تنظيف البيانات...');
  console.log('🚀 Starting data cleanup...\n');
  
  try {
    const licensesRef = db.ref('licenses');
    const snapshot = await licensesRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ لا توجد بيانات للتنظيف');
      console.log('❌ No data to clean');
      return;
    }
    
    const licenses = snapshot.val();
    let cleanedCount = 0;
    let errorCount = 0;
    
    // تنظيف Apps
    if (licenses.apps) {
      console.log('\n📱 تنظيف Apps...');
      for (const productId in licenses.apps) {
        for (const userId in licenses.apps[productId]) {
          try {
            const data = licenses.apps[productId][userId];
            const cleanData = await cleanProductData('apps', productId, userId, data);
            
            // حفظ البيانات النظيفة
            await db.ref(`licenses/apps/${productId}/${userId}`).set(cleanData);
            cleanedCount++;
            console.log(`  ✅ تم تنظيف apps/${productId}/${userId}`);
          } catch (error) {
            errorCount++;
            console.error(`  ❌ خطأ في apps/${productId}/${userId}:`, error.message);
          }
        }
      }
    }
    
    // تنظيف Domains
    if (licenses.domains) {
      console.log('\n🌐 تنظيف Domains...');
      for (const productId in licenses.domains) {
        for (const userId in licenses.domains[productId]) {
          try {
            const data = licenses.domains[productId][userId];
            const cleanData = await cleanProductData('domains', productId, userId, data);
            
            // حفظ البيانات النظيفة
            await db.ref(`licenses/domains/${productId}/${userId}`).set(cleanData);
            cleanedCount++;
            console.log(`  ✅ تم تنظيف domains/${productId}/${userId}`);
          } catch (error) {
            errorCount++;
            console.error(`  ❌ خطأ في domains/${productId}/${userId}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✅ اكتمل التنظيف!');
    console.log('✅ Cleanup completed!');
    console.log(`\n📊 الإحصائيات / Statistics:`);
    console.log(`   ✅ تم التنظيف: ${cleanedCount}`);
    console.log(`   ❌ أخطاء: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ خطأ في التنظيف:', error);
    console.error('❌ Cleanup error:', error);
  }
}

/**
 * عرض البيانات قبل التنظيف
 * Show data before cleanup
 */
async function previewData() {
  console.log('👀 معاينة البيانات...');
  console.log('👀 Previewing data...\n');
  
  try {
    const licensesRef = db.ref('licenses');
    const snapshot = await licensesRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ لا توجد بيانات');
      return;
    }
    
    const licenses = snapshot.val();
    
    console.log('📱 Apps:');
    if (licenses.apps) {
      for (const productId in licenses.apps) {
        console.log(`  Product: ${productId}`);
        for (const userId in licenses.apps[productId]) {
          console.log(`    User: ${userId}`);
          console.log(`    Data:`, JSON.stringify(licenses.apps[productId][userId], null, 2));
        }
      }
    } else {
      console.log('  لا توجد بيانات Apps');
    }
    
    console.log('\n🌐 Domains:');
    if (licenses.domains) {
      for (const productId in licenses.domains) {
        console.log(`  Product: ${productId}`);
        for (const userId in licenses.domains[productId]) {
          console.log(`    User: ${userId}`);
          console.log(`    Data:`, JSON.stringify(licenses.domains[productId][userId], null, 2));
        }
      }
    } else {
      console.log('  لا توجد بيانات Domains');
    }
    
  } catch (error) {
    console.error('❌ خطأ في المعاينة:', error);
  }
}

// القائمة الرئيسية
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🧹 أداة تنظيف RTDB');
  console.log('🧹 RTDB Cleanup Tool');
  console.log('═══════════════════════════════════════\n');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'preview':
      await previewData();
      break;
      
    case 'clean':
      const confirm = args[1] === '--confirm';
      if (!confirm) {
        console.log('⚠️  تحذير: هذا سيغير البيانات في RTDB');
        console.log('⚠️  Warning: This will modify RTDB data');
        console.log('\nللتأكيد، شغل:');
        console.log('To confirm, run:');
        console.log('node cleanup-rtdb-data.js clean --confirm\n');
        return;
      }
      await cleanupAllData();
      break;
      
    case 'help':
    default:
      console.log('الأوامر المتاحة / Available commands:\n');
      console.log('  preview         - معاينة البيانات الحالية');
      console.log('                    Preview current data\n');
      console.log('  clean --confirm - تنظيف البيانات (يتطلب تأكيد)');
      console.log('                    Clean data (requires confirmation)\n');
      console.log('  help            - عرض هذه المساعدة');
      console.log('                    Show this help\n');
      console.log('مثال / Example:');
      console.log('  node cleanup-rtdb-data.js preview');
      console.log('  node cleanup-rtdb-data.js clean --confirm\n');
      break;
  }
  
  // إغلاق الاتصال
  await admin.app().delete();
  console.log('\n👋 تم!');
}

// تشغيل
main().catch(console.error);
