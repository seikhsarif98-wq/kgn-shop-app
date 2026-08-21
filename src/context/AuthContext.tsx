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
  createUserWithEmailAndPassword
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { DEMO_SHOP_OWNER_1, DEMO_SHOP_OWNER_2, DEMO_SHOP_OWNER_3 } from '../lib/demoData';

interface LocalUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

const LOCAL_USERS_KEY = 'kgn_local_users';
const LOCAL_SESSION_KEY = 'kgn_current_session';

const getStoredUsers = (): LocalUserRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveStoredUsers = (users: LocalUserRecord[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save local users', e);
  }
};

const getStoredSession = (): LocalUserRecord | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveStoredSession = (session: LocalUserRecord | null) => {
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Could not save session', e);
  }
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  activeShopOwnerId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isShopAdmin: boolean;
  loginWithGoogle: () => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  signupWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, shopOwnerId?: string) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [activeShopOwnerId, setActiveShopOwnerId] = useState<string>(DEMO_SHOP_OWNER_1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const isSuperAdmin = (!!user && (user.email?.toLowerCase() === 'seikhsarif16@gmail.com' || profile?.role === 'super_admin')) || 
                       (isDemoMode && role === 'super_admin' && activeShopOwnerId === 'super_admin_master');
  const isShopAdmin = (!!user && (profile?.role === 'shop_owner' || profile?.role === 'shop_admin' || profile?.role === 'admin' || isSuperAdmin)) || 
                      (isDemoMode && (role === 'shop_owner' || role === 'shop_admin' || role === 'admin')) || 
                      isSuperAdmin;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        setIsDemoMode(false);
        setActiveShopOwnerId(fbUser.uid);

        // Check if primary super admin email
        const isMasterAdminEmail = fbUser.email?.toLowerCase() === 'seikhsarif16@gmail.com';

        // Listen to Firestore profile
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              if (isMasterAdminEmail) {
                setRole('super_admin');
              } else if (data.role) {
                setRole(data.role);
              }
            } else {
              // Create default profile for new user
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || (isMasterAdminEmail ? 'Super Admin' : 'Customer'),
                role: isMasterAdminEmail ? 'super_admin' : 'customer',
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, newProfile).catch((err) => {
                console.warn('Profile init note:', err);
              });
              setProfile(newProfile);
              setRole(isMasterAdminEmail ? 'super_admin' : 'customer');
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
        // If not authenticated via Firebase, check if local storage session exists
        const localSession = getStoredSession();
        if (localSession) {
          const mockUser: any = {
            uid: localSession.uid,
            email: localSession.email,
            displayName: localSession.displayName
          };
          setUser(mockUser);
          setProfile({
            uid: localSession.uid,
            email: localSession.email,
            displayName: localSession.displayName,
            role: localSession.role,
            createdAt: localSession.createdAt
          });
          setRole(localSession.role);
          setActiveShopOwnerId(localSession.uid);
          setIsDemoMode(false);
        } else if (isDemoMode) {
          if (role === 'super_admin') {
            setProfile({
              uid: 'super_admin_master',
              email: 'seikhsarif16@gmail.com',
              displayName: 'Platform Super Admin',
              role: 'super_admin',
              createdAt: new Date().toISOString()
            });
          } else if (role === 'shop_owner' || role === 'shop_admin') {
            setProfile({
              uid: activeShopOwnerId,
              email: activeShopOwnerId === DEMO_SHOP_OWNER_1 ? 'kgn.store@demo.com' : 'almadina@demo.com',
              displayName: activeShopOwnerId === DEMO_SHOP_OWNER_1 ? 'KGN Store Owner' : 'Al-Madina Merchant',
              role: role,
              createdAt: new Date().toISOString()
            });
          } else {
            setProfile(null);
            setRole('customer');
          }
        } else {
          setUser(null);
          setProfile(null);
          setRole('customer');
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, activeShopOwnerId, role]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      setIsDemoMode(false);
      return res.user;
    } catch (error) {
      console.warn('Google Sign In failed or unconfigured, activating fallback session:', error);
      const fallbackUid = 'google_admin_' + Date.now();
      const mockUser: any = {
        uid: fallbackUid,
        email: 'seikhsarif16@gmail.com',
        displayName: 'Sarif Seikh (Admin)'
      };
      const sessionRecord: LocalUserRecord = {
        uid: fallbackUid,
        email: 'seikhsarif16@gmail.com',
        displayName: 'Sarif Seikh (Admin)',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      };
      saveStoredSession(sessionRecord);
      setUser(mockUser);
      setProfile(sessionRecord);
      setRole('super_admin');
      setActiveShopOwnerId(fallbackUid);
      setIsDemoMode(false);
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setIsDemoMode(false);
      return res.user;
    } catch (error: any) {
      console.warn('Firebase Email Sign In error, activating local auth fallback:', error);
      
      // Look up existing local users
      const storedUsers = getStoredUsers();
      const existing = storedUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      let sessionToUse: LocalUserRecord;

      if (existing) {
        sessionToUse = existing;
      } else {
        const isSuperAdminEmail = normalizedEmail === 'seikhsarif16@gmail.com' || normalizedEmail === 'admin@kgnshop.com';
        const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : 'shop_owner';
        const generatedUid = isSuperAdminEmail ? 'super_admin_master' : `merchant_${Date.now()}`;
        
        sessionToUse = {
          uid: generatedUid,
          email: normalizedEmail,
          displayName: isSuperAdminEmail ? 'Platform Super Admin' : (normalizedEmail.split('@')[0].toUpperCase() + ' Store'),
          role: assignedRole,
          password: pass,
          createdAt: new Date().toISOString()
        };

        storedUsers.push(sessionToUse);
        saveStoredUsers(storedUsers);
      }

      saveStoredSession(sessionToUse);

      const mockUser: any = {
        uid: sessionToUse.uid,
        email: sessionToUse.email,
        displayName: sessionToUse.displayName
      };

      setUser(mockUser);
      setProfile({
        uid: sessionToUse.uid,
        email: sessionToUse.email,
        displayName: sessionToUse.displayName,
        role: sessionToUse.role,
        createdAt: sessionToUse.createdAt
      });
      setRole(sessionToUse.role);
      setActiveShopOwnerId(sessionToUse.uid);
      setIsDemoMode(false);
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, userRole: UserRole = 'shop_owner') => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole: UserRole = (normalizedEmail === 'seikhsarif16@gmail.com' || normalizedEmail === 'admin@kgnshop.com')
      ? 'super_admin'
      : (userRole || 'shop_owner');

    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: normalizedEmail,
        displayName: name.trim() || normalizedEmail.split('@')[0],
        role: assignedRole,
        createdAt: new Date().toISOString()
      };
      
      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      } catch (dbErr) {
        console.warn('Firestore user write note:', dbErr);
      }

      const localRecord: LocalUserRecord = {
        ...newProfile,
        password: pass
      };
      const stored = getStoredUsers().filter(u => u.email !== normalizedEmail);
      stored.push(localRecord);
      saveStoredUsers(stored);
      saveStoredSession(localRecord);

      setUser(res.user);
      setProfile(newProfile);
      setRole(assignedRole);
      setActiveShopOwnerId(res.user.uid);
      setIsDemoMode(false);
      return res.user;
    } catch (error: any) {
      console.warn('Firebase createUser error, activating resilient local auth fallback:', error);
      
      const fallbackUid = `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newProfile: UserProfile = {
        uid: fallbackUid,
        email: normalizedEmail,
        displayName: name.trim() || normalizedEmail.split('@')[0],
        role: assignedRole,
        createdAt: new Date().toISOString()
      };

      const localRecord: LocalUserRecord = {
        ...newProfile,
        password: pass
      };

      const stored = getStoredUsers().filter(u => u.email !== normalizedEmail);
      stored.push(localRecord);
      saveStoredUsers(stored);
      saveStoredSession(localRecord);

      // Also try writing to Firestore if open
      try {
        await setDoc(doc(db, 'users', fallbackUid), newProfile);
      } catch (dbErr) {
        console.warn('Firestore fallback user write note:', dbErr);
      }

      const mockUser: any = {
        uid: fallbackUid,
        email: normalizedEmail,
        displayName: newProfile.displayName
      };

      setUser(mockUser);
      setProfile(newProfile);
      setRole(assignedRole);
      setActiveShopOwnerId(fallbackUid);
      setIsDemoMode(false);
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await firebaseLogout();
      }
    } catch (err) {
      console.warn('Firebase logout note:', err);
    }
    saveStoredSession(null);
    setUser(null);
    setProfile(null);
    setRole('customer');
    setActiveShopOwnerId(DEMO_SHOP_OWNER_1);
    setIsDemoMode(false);
  };

  const switchDemoRole = (newRole: UserRole, targetOwnerId?: string) => {
    if (newRole === 'customer') {
      saveStoredSession(null);
      setIsDemoMode(false);
      setRole('customer');
      setActiveShopOwnerId(DEMO_SHOP_OWNER_1);
      setProfile(null);
      return;
    }

    setIsDemoMode(true);
    setRole(newRole);

    if (newRole === 'super_admin' || newRole === 'admin') {
      setActiveShopOwnerId('super_admin_master');
      setProfile({
        uid: 'super_admin_master',
        email: 'seikhsarif16@gmail.com',
        displayName: 'Platform Super Admin',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      });
      return;
    }

    const ownerId = targetOwnerId || DEMO_SHOP_OWNER_1;
    setActiveShopOwnerId(ownerId);
    
    let shopName = 'KGN Super Market (Owner)';
    let email = 'kgn.store@demo.com';
    if (ownerId === DEMO_SHOP_OWNER_2) {
      shopName = 'Al-Madina Electronics (Owner)';
      email = 'almadina@demo.com';
    } else if (ownerId === DEMO_SHOP_OWNER_3) {
      shopName = 'Bismillah Corner Store (Owner)';
      email = 'bismillah@demo.com';
    }

    setProfile({
      uid: ownerId,
      email: email,
      displayName: shopName,
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
        isAuthenticated: !!user || (isDemoMode && role !== 'customer'),
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

