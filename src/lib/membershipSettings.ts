import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface MembershipSettings {
  premiumDailyLimit: number;
  regularDailyLimit: number;
}

const DEFAULT_SETTINGS: MembershipSettings = {
  premiumDailyLimit: 2,
  regularDailyLimit: 1
};

const SETTINGS_DOC_ID = 'membershipSettings';

/**
 * Get membership settings from Firestore
 * Returns default settings if none exist
 */
export const getMembershipSettings = async (): Promise<MembershipSettings> => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        premiumDailyLimit: data.premiumDailyLimit ?? DEFAULT_SETTINGS.premiumDailyLimit,
        regularDailyLimit: data.regularDailyLimit ?? DEFAULT_SETTINGS.regularDailyLimit
      };
    }
    
    // Create default settings if they don't exist
    await setDoc(settingsRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting membership settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update membership settings in Firestore
 */
export const updateMembershipSettings = async (settings: MembershipSettings): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      premiumDailyLimit: settings.premiumDailyLimit,
      regularDailyLimit: settings.regularDailyLimit,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating membership settings:', error);
    throw error;
  }
};

/**
 * Get daily ticket limit for a membership type
 */
export const getDailyLimit = async (membershipType: 'premium' | 'regular'): Promise<number> => {
  const settings = await getMembershipSettings();
  return membershipType === 'premium' ? settings.premiumDailyLimit : settings.regularDailyLimit;
};
