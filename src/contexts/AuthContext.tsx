import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
  products: UserProduct[];
  membershipType?: 'premium' | 'regular';
  profileImage?: string | null;
  profileImagePublicId?: string | null;
}

interface UserProduct {
  productId: string;
  planId: string;
  allowedDomains?: number;
  isActive?: boolean;
  expiryType?: 'lifetime' | 'date';
  expiryDate?: string;
  purchaseId?: string; // For domain products - unique purchase ID
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// List of admin UIDs - modify this to set admin users
export const ADMIN_UIDS = ['TH2TF7maQaWA8Q7YpKAKk6Yvbp02'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'buyers', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid: user.uid,
          email: user.email || '',
          name: data.name || '',
          isAdmin: ADMIN_UIDS.includes(user.uid) || data.isAdmin === true,
          products: data.products || [],
          membershipType: data.membershipType || 'regular',
          profileImage: data.profileImage || null,
          profileImagePublicId: data.profileImagePublicId || null
        });
      } else {
        // Create default user data if doesn't exist
        const defaultData: UserData = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          isAdmin: ADMIN_UIDS.includes(user.uid),
          products: [],
          membershipType: 'regular'
        };
        
        try {
          await setDoc(doc(db, 'buyers', user.uid), {
            name: defaultData.name,
            email: defaultData.email,
            products: defaultData.products,
            isAdmin: defaultData.isAdmin,
            membershipType: defaultData.membershipType,
            createdAt: new Date().toISOString()
          });
          setUserData(defaultData);
        } catch (setDocError: any) {
          console.error('Error creating user document:', setDocError);
          // Still set user data locally even if we can't save to Firestore
          setUserData(defaultData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      // If permission denied, show helpful message
      if (error.code === 'permission-denied') {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🔒 FIRESTORE PERMISSION ERROR');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error('The app cannot read user data from Firestore.');
        console.error('');
        console.error('📋 TO FIX THIS:');
        console.error('1. Go to Firebase Console > Firestore Database > Rules');
        console.error('2. Copy the rules from /FIRESTORE_RULES.md');
        console.error('3. Click "Publish" to apply the rules');
        console.error('');
        console.error('📖 Read /FIRESTORE_RULES.md for detailed instructions');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      
      // Set minimal user data to prevent crashes
      setUserData({
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        isAdmin: ADMIN_UIDS.includes(user.uid),
        products: [],
        membershipType: 'regular'
      });
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user was registered but their data is still in invitedMembers
    const invitedQuery = query(collection(db, 'invitedMembers'), where('email', '==', email));
    const invitedSnapshot = await getDocs(invitedQuery);
    
    if (!invitedSnapshot.empty) {
      const invitedMemberData = invitedSnapshot.docs[0].data();
      const invitedDocId = invitedSnapshot.docs[0].id;
      
      // Move data from invitedMembers to buyers
      await setDoc(doc(db, 'buyers', userCredential.user.uid), {
        ...invitedMemberData,
        name: userCredential.user.displayName || invitedMemberData.name,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        registeredAt: new Date().toISOString(),
        products: invitedMemberData?.products || [],
        membershipType: invitedMemberData?.membershipType || 'regular',
        isAdmin: ADMIN_UIDS.includes(userCredential.user.uid) || invitedMemberData?.isAdmin === true
      });
      
      // Delete from invitedMembers
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'invitedMembers', invitedDocId));
    }
    
    // Also check for legacy buyer documents and clean them up
    const legacyBuyersQuery = query(collection(db, 'buyers'), where('email', '==', email));
    const legacyBuyersSnapshot = await getDocs(legacyBuyersQuery);
    
    for (const legacyDoc of legacyBuyersSnapshot.docs) {
      if (legacyDoc.id !== userCredential.user.uid) {
        try {
          const { deleteDoc } = await import('firebase/firestore');
          await deleteDoc(legacyDoc.ref);
        } catch (error) {
          console.warn('Could not delete legacy buyer document:', error);
        }
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    // First, check if email is in invitedMembers list
    const invitedQuery = query(collection(db, 'invitedMembers'), where('email', '==', email));
    const invitedSnapshot = await getDocs(invitedQuery);
    
    let invitedMemberData = null;
    let invitedDocId = null;
    let legacyBuyerDocId = null;
    
    if (!invitedSnapshot.empty) {
      // Email found in invitedMembers
      invitedMemberData = invitedSnapshot.docs[0].data();
      invitedDocId = invitedSnapshot.docs[0].id;
    } else {
      // Check if email is in buyers list (legacy support)
      const buyersQuery = query(collection(db, 'buyers'), where('email', '==', email));
      const buyersSnapshot = await getDocs(buyersQuery);
      
      if (buyersSnapshot.empty) {
        throw new Error('EMAIL_NOT_AUTHORIZED');
      }
      
      // Use existing buyer data and store the doc ID for cleanup
      invitedMemberData = buyersSnapshot.docs[0].data();
      legacyBuyerDocId = buyersSnapshot.docs[0].id;
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create buyer document with invited member data
    await setDoc(doc(db, 'buyers', userCredential.user.uid), {
      ...invitedMemberData,
      name,
      uid: userCredential.user.uid,
      email,
      registeredAt: new Date().toISOString(),
      products: invitedMemberData?.products || [],
      membershipType: invitedMemberData?.membershipType || 'regular',
      isAdmin: ADMIN_UIDS.includes(userCredential.user.uid) || invitedMemberData?.isAdmin === true
    });
    
    // Delete from invitedMembers if it was there
    if (invitedDocId) {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'invitedMembers', invitedDocId));
    }
    
    // Also delete legacy buyer document if it exists (it's replaced by the UID-based one)
    // Legacy buyer docs use email-based IDs, not UIDs
    if (legacyBuyerDocId) {
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'buyers', legacyBuyerDocId));
      } catch (error) {
        console.warn('Could not delete legacy buyer document:', error);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (currentUser) {
      await updatePassword(currentUser, newPassword);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (currentUser) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.products !== undefined) updateData.products = data.products;
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
      if (data.profileImagePublicId !== undefined) updateData.profileImagePublicId = data.profileImagePublicId;
      
      await setDoc(doc(db, 'buyers', currentUser.uid), updateData, { merge: true });
      await refreshUserData();
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserPassword,
    updateUserData,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
