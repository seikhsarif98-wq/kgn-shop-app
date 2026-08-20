import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  onSnapshot, 
  doc, 
  db, 
  setDoc, 
  signInWithGoogle, 
  logOut as firebaseLogout,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { DEMO_SHOP_OWNER_1, DEMO_SHOP_OWNER_2, DEMO_SHOP_OWNER_3 } from '../lib/demoData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  activeShopOwnerId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isShopAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, shopOwnerId?: string) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('shop_owner');
  const [activeShopOwnerId, setActiveShopOwnerId] = useState<string>(DEMO_SHOP_OWNER_1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const isSuperAdmin = role === 'super_admin' || role === 'admin' || user?.email === 'seikhsarif16@gmail.com' || profile?.email === 'seikhsarif16@gmail.com' || profile?.email === 'admin@kgnshop.com';
  const isShopAdmin = role === 'shop_admin' || role === 'shop_owner' || isSuperAdmin;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        setIsDemoMode(false);
        setActiveShopOwnerId(fbUser.uid);

        // Check if primary super admin email
        const isMasterAdminEmail = fbUser.email === 'seikhsarif16@gmail.com';

        // Listen to Firestore profile
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              if (data.role) {
                setRole(isMasterAdminEmail ? 'super_admin' : data.role);
              } else if (isMasterAdminEmail) {
                setRole('super_admin');
              }
            } else {
              // Create default profile for new user
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || (isMasterAdminEmail ? 'Super Admin' : 'Shop Owner'),
                role: isMasterAdminEmail ? 'super_admin' : 'shop_owner',
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, newProfile).catch((err) => {
                console.warn('Profile init note:', err);
              });
              setProfile(newProfile);
              setRole(isMasterAdminEmail ? 'super_admin' : 'shop_owner');
            }
            setIsLoading(false);
          }, (error) => {
            console.warn('Profile sync note:', error);
            setIsLoading(false);
          });

          return () => unsubProfile();
        } catch (e) {
          console.warn('Auth profile listener init error:', e);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        // If not signed into Firebase, keep demo mode default so preview is interactive immediately
        if (isDemoMode) {
          if (role === 'super_admin' || role === 'admin') {
            setProfile({
              uid: 'super_admin_master',
              email: 'seikhsarif16@gmail.com',
              displayName: 'KGN Super Admin',
              role: 'super_admin',
              createdAt: new Date().toISOString()
            });
          } else {
            setProfile({
              uid: activeShopOwnerId,
              email: activeShopOwnerId === DEMO_SHOP_OWNER_1 ? 'kgn.store@demo.com' : 'almadina@demo.com',
              displayName: activeShopOwnerId === DEMO_SHOP_OWNER_1 ? 'KGN Storekeeper' : 'Al-Madina Merchant',
              role: role,
              createdAt: new Date().toISOString()
            });
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, activeShopOwnerId, role]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setIsDemoMode(false);
    } catch (error) {
      console.error('Google Sign In failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Email Sign In failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, userRole: UserRole = 'shop_owner') => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const assignedRole = email === 'seikhsarif16@gmail.com' ? 'super_admin' : userRole;
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role: assignedRole,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setProfile(newProfile);
      setRole(assignedRole);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await firebaseLogout();
      }
      setIsDemoMode(true);
      setRole('customer');
      setActiveShopOwnerId(DEMO_SHOP_OWNER_1);
      setProfile({
        uid: 'guest_customer',
        email: 'customer@guest.com',
        displayName: 'Guest Buyer',
        role: 'customer',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const switchDemoRole = (newRole: UserRole, targetOwnerId?: string) => {
    setIsDemoMode(true);
    setRole(newRole);

    if (newRole === 'super_admin' || newRole === 'admin') {
      setActiveShopOwnerId('super_admin_master');
      setProfile({
        uid: 'super_admin_master',
        email: 'seikhsarif16@gmail.com',
        displayName: 'Super Admin (Platform Owner)',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      });
      return;
    }

    const ownerId = targetOwnerId || (newRole === 'shop_owner' || newRole === 'shop_admin' ? DEMO_SHOP_OWNER_1 : 'guest_customer');
    setActiveShopOwnerId(ownerId);
    
    let shopName = 'KGN Super Market (Owner)';
    let email = 'kgn.store@demo.com';
    if (ownerId === DEMO_SHOP_OWNER_2) {
      shopName = 'Al-Madina Electronics (Owner)';
      email = 'almadina@demo.com';
    } else if (ownerId === DEMO_SHOP_OWNER_3) {
      shopName = 'Bismillah Corner Store (Free Plan)';
      email = 'bismillah@demo.com';
    }

    setProfile({
      uid: ownerId,
      email: (newRole === 'shop_owner' || newRole === 'shop_admin') ? email : 'buyer@demo.com',
      displayName: (newRole === 'shop_owner' || newRole === 'shop_admin') ? shopName : 'Shopper / Buyer',
      role: newRole,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        activeShopOwnerId,
        isAuthenticated: !!user || isDemoMode,
        isLoading,
        isSuperAdmin,
        isShopAdmin,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        switchDemoRole,
        isDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
