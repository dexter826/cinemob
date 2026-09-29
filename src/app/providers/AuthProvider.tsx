import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthContextType } from '@/types';
import useToastStore from '@/shared/stores/toastStore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cloneFirebaseUser = (user: User): User =>
  Object.assign(Object.create(Object.getPrototypeOf(user)), user);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      console.error('Error signing in', error);
      showToast('Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  }, []);

  // Làm mới thông tin người dùng từ Firebase Auth.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(cloneFirebaseUser(auth.currentUser));
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, logout, refreshUser }),
    [user, loading, signInWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
