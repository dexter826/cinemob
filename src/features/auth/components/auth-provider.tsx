import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/shared/lib/firebase';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import { sendVerificationEmail, signInWithEmail } from '@/features/auth/services/auth-service';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  retryAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
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
        setUser(currentUser ? cloneFirebaseUser(currentUser) : null);
        setLoading(false);
        setError(null);
      },
      () => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
          setError('Không xác thực được phiên đăng nhập. Vui lòng tải lại trang.');
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
      showToast(MESSAGES.AUTH.LOGIN_ERROR, 'error');
    }
  }, [showToast]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) throw new Error('No signed-in user');
    await sendVerificationEmail(auth.currentUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      showToast(MESSAGES.AUTH.LOGOUT_ERROR, 'error');
    }
  }, [showToast]);

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    await currentUser.reload();
    if (currentUser.emailVerified) await currentUser.getIdToken(true);
    if (auth.currentUser !== currentUser) return false;
    setUser(cloneFirebaseUser(currentUser));
    return currentUser.emailVerified;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      retryAuth,
      signInWithGoogle,
      signInWithEmail: loginWithEmail,
      resendVerificationEmail,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      error,
      retryAuth,
      signInWithGoogle,
      loginWithEmail,
      resendVerificationEmail,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
