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
  collection,
  query,
  where,
  getDocs,
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
  applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = 'h4k3rxbd@gmail.com';

function generateReferralCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return `NEST-${clean}`;
}

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
          premiumExpiresAt: profile.premiumExpiresAt,
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
    const isSuperAdminEmail = fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    const defaultCode = generateReferralCode(fbUser.uid);

    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        let profile = userSnap.data() as AppUserProfile;

        // Ensure referral code is present
        if (!profile.referralCode) {
          profile.referralCode = defaultCode;
          profile.referralsCount = profile.referralsCount || 0;
          profile.referralBonusDays = profile.referralBonusDays || 0;
          await updateDoc(userRef, {
            referralCode: defaultCode,
            referralsCount: profile.referralsCount,
            referralBonusDays: profile.referralBonusDays,
          }).catch(() => {});
        }

        // If this is bootstrap admin email but marked as something else, promote to admin
        if (isSuperAdminEmail && profile.role !== 'admin') {
          profile = {
            ...profile,
            role: 'admin',
            isPremium: true,
            updatedAt: new Date().toISOString(),
          };
          await updateDoc(userRef, { role: 'admin', isPremium: true, updatedAt: profile.updatedAt }).catch(() => {});
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
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'NESTTUBE Member',
          role: newRole,
          avatarUrl: fbUser.photoURL || undefined,
          channelName: isSuperAdminEmail ? 'NESTTUBE HQ' : `${fbUser.displayName || 'My'} Channel`,
          channelHandle: `@${(fbUser.displayName || fbUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          isPremium: isSuperAdminEmail,
          referralCode: defaultCode,
          referralsCount: 0,
          referralBonusDays: 0,
          subscribersCount: isSuperAdminEmail ? 24500 : 0,
          totalViews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile).catch((e) => console.warn('setDoc user warning:', e));
        if (isSuperAdminEmail) {
          await syncAdminDocIfNeeded(fbUser.uid, fbUser.email || '');
        }

        setUserProfile(newProfile);
        syncToZustand(newProfile);
      }
    } catch (err) {
      console.warn('Note on Firestore loadUserProfile fallback:', err);
      // Safe fallback profile so login always succeeds without throwing
      const fallbackProfile: AppUserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'NESTTUBE Member',
        role: isSuperAdminEmail ? 'admin' : 'viewer',
        avatarUrl: fbUser.photoURL || undefined,
        channelName: `${fbUser.displayName || 'My'} Channel`,
        channelHandle: `@${(fbUser.displayName || fbUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        isPremium: isSuperAdminEmail,
        referralCode: defaultCode,
        referralsCount: 0,
        referralBonusDays: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProfile);
      syncToZustand(fallbackProfile);
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
      if (res?.user) {
        await loadUserProfile(res.user);
      }
    } catch (error: any) {
      console.warn('Google Sign-in status:', error);
      // Don't re-throw if user closed popup voluntarily
      if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('closed-by-user')) {
        return;
      }
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

  const applyReferralCode = async (rawCode: string): Promise<{ success: boolean; message: string }> => {
    const code = rawCode.trim().toUpperCase();
    if (!user || !userProfile) {
      return { success: false, message: 'রেফারেল প্রয়োগ করতে প্রথমে লগইন করুন' };
    }

    if (code === userProfile.referralCode) {
      return { success: false, message: 'আপনি নিজের রেফারেল কোড নিজে ব্যবহার করতে পারবেন না' };
    }

    if (userProfile.referredBy) {
      return { success: false, message: 'আপনি ইতিমধ্যে একটি রেফারেল কোড প্রয়োগ করেছেন' };
    }

    try {
      // Find referrer user in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', code));
      const querySnap = await getDocs(q);

      let referrerUid: string | null = null;
      let referrerData: AppUserProfile | null = null;

      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        referrerUid = docSnap.id;
        referrerData = docSnap.data() as AppUserProfile;
      }

      // Calculate 30-day extension
      const now = Date.now();
      const currentExpiry = userProfile.premiumExpiresAt ? new Date(userProfile.premiumExpiresAt).getTime() : now;
      const baseTime = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Update current user
      const currentUserRef = doc(db, 'users', user.uid);
      const userUpdates: Partial<AppUserProfile> = {
        referredBy: code,
        isPremium: true,
        premiumExpiresAt: newExpiry,
        referralBonusDays: (userProfile.referralBonusDays || 0) + 30,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(currentUserRef, userUpdates).catch(() => {});

      // If referrer was found, give them 30 days extension too!
      if (referrerUid && referrerData) {
        const refExpiry = referrerData.premiumExpiresAt ? new Date(referrerData.premiumExpiresAt).getTime() : now;
        const refBaseTime = refExpiry > now ? refExpiry : now;
        const refNewExpiry = new Date(refBaseTime + 30 * 24 * 60 * 60 * 1000).toISOString();

        const refDoc = doc(db, 'users', referrerUid);
        await updateDoc(refDoc, {
          referralsCount: (referrerData.referralsCount || 0) + 1,
          referralBonusDays: (referrerData.referralBonusDays || 0) + 30,
          isPremium: true,
          premiumExpiresAt: refNewExpiry,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }

      // Merge locally
      const merged: AppUserProfile = {
        ...userProfile,
        ...userUpdates,
      };
      setUserProfile(merged);
      syncToZustand(merged);

      return {
        success: true,
        message: 'অভিনন্দন! সফল রেফারেলের জন্য ৩০ দিনের প্রিমিয়াম যোগ করা হয়েছে!',
      };
    } catch (err: any) {
      console.warn('Error applying referral code:', err);
      // Fallback local application so user always gets rewarded!
      const now = Date.now();
      const newExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
      const merged: AppUserProfile = {
        ...userProfile,
        referredBy: code,
        isPremium: true,
        premiumExpiresAt: newExpiry,
        referralBonusDays: (userProfile.referralBonusDays || 0) + 30,
      };
      setUserProfile(merged);
      syncToZustand(merged);

      return {
        success: true,
        message: 'রেফারেল সফল! ৩০ দিনের প্রিমিয়াম সক্রিয় হয়েছে।',
      };
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
        applyReferralCode,
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
