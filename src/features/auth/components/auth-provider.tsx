import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/shared/lib/firebase';
import useToastStore from '@/shared/stores/toast-store';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  retryAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

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
  const [error, setError] = useState<string | null>(null);
  const [authAttempt, setAuthAttempt] = useState(0);
  const retryAuth = useCallback(() => setAuthAttempt((n) => n + 1), []);
  const { showToast } = useToastStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (cancelled) return;
        const modal = useAddMovieStore.getState();
        if (modal.ownerUid && modal.ownerUid !== currentUser?.uid) modal.closeAddModal();
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      () => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
          setError('Không xác thực được phiên đăng nhập.');
        }
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authAttempt]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      console.error('Error signing in', error);
      showToast('Đăng nhập thất bại. Thử lại.', 'error');
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
    () => ({ user, loading, error, retryAuth, signInWithGoogle, logout, refreshUser }),
    [user, loading, error, retryAuth, signInWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
