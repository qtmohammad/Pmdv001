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
const ADMIN_UIDS = ['TH2TF7maQaWA8Q7YpKAKk6Yvbp02'];

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
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    // Check if email is in buyers list
    const buyersQuery = query(collection(db, 'buyers'), where('email', '==', email));
    const buyersSnapshot = await getDocs(buyersQuery);
    
    if (buyersSnapshot.empty) {
      // Note: Error messages in AuthContext are caught and displayed through translation keys
      // The actual translation happens in the component that catches this error
      throw new Error('EMAIL_NOT_AUTHORIZED');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Update buyer document with uid
    const buyerDoc = buyersSnapshot.docs[0];
    await setDoc(doc(db, 'buyers', userCredential.user.uid), {
      ...buyerDoc.data(),
      name,
      uid: userCredential.user.uid,
      registeredAt: new Date().toISOString()
    });
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
