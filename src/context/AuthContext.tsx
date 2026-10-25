import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser,
} from '../firebase';
import { AppUserProfile, UserRole } from '../types/auth';
import { useUserStore } from '../store/useUserStore';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: AppUserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isCreator: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<AppUserProfile>) => Promise<void>;
  becomeCreator: (channelName: string, channelHandle: string, bio?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = 'h4k3rxbd@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync to existing Zustand store for backwards compatibility
  const syncToZustand = (profile: AppUserProfile | null) => {
    if (profile) {
      useUserStore.setState({
        currentUser: {
          email: profile.email,
          name: profile.name,
          isPremium: !!profile.isPremium,
        },
        isPremium: !!profile.isPremium,
      });
    } else {
      useUserStore.setState({
        currentUser: null,
      });
    }
  };

  const syncAdminDocIfNeeded = async (uid: string, email: string) => {
    try {
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid,
          email,
          role: 'superadmin',
          grantedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Note: Admin doc sync attempt:', err);
    }
  };

  const loadUserProfile = async (fbUser: FirebaseUser) => {
    const userRef = doc(db, 'users', fbUser.uid);
    try {
      const userSnap = await getDoc(userRef);
      const isSuperAdminEmail = fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (userSnap.exists()) {
        let profile = userSnap.data() as AppUserProfile;

        // If this is bootstrap admin email but marked as something else, promote to admin
        if (isSuperAdminEmail && profile.role !== 'admin') {
          profile = {
            ...profile,
            role: 'admin',
            updatedAt: new Date().toISOString(),
          };
          await updateDoc(userRef, { role: 'admin', updatedAt: profile.updatedAt });
          await syncAdminDocIfNeeded(fbUser.uid, fbUser.email || '');
        }

        setUserProfile(profile);
        syncToZustand(profile);
      } else {
        // First-time registration / profile initialization
        const newRole: UserRole = isSuperAdminEmail ? 'admin' : 'viewer';
        const newProfile: AppUserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'NestTube Member',
          role: newRole,
          avatarUrl: fbUser.photoURL || undefined,
          channelName: isSuperAdminEmail ? 'NestTube HQ' : `${fbUser.displayName || 'My'} Channel`,
          channelHandle: `@${(fbUser.displayName || fbUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          isPremium: isSuperAdminEmail,
          subscribersCount: isSuperAdminEmail ? 24500 : 0,
          totalViews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);
        if (isSuperAdminEmail) {
          await syncAdminDocIfNeeded(fbUser.uid, fbUser.email || '');
        }

        setUserProfile(newProfile);
        syncToZustand(newProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.READ, `users/${fbUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
        syncToZustand(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await loadUserProfile(res.user);
      }
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
      syncToZustand(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateProfileData = async (data: Partial<AppUserProfile>) => {
    if (!user || !userProfile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userRef, updated);
      const merged = { ...userProfile, ...updated };
      setUserProfile(merged);
      syncToZustand(merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const becomeCreator = async (channelName: string, channelHandle: string, bio?: string) => {
    if (!user || !userProfile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const payload: Partial<AppUserProfile> = {
        role: userProfile.role === 'admin' ? 'admin' : 'creator',
        channelName,
        channelHandle: channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`,
        bio: bio || '',
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userRef, payload);
      const merged = { ...userProfile, ...payload };
      setUserProfile(merged);
      syncToZustand(merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  const role = userProfile?.role || 'viewer';
  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const isCreator = role === 'creator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isAdmin,
        isCreator,
        isLoading,
        signInWithGoogle,
        logout,
        updateProfileData,
        becomeCreator,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
