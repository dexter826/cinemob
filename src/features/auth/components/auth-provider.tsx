import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  linkWithCredential,
  type OAuthCredential,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '@/shared/lib/firebase';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import {
  registerWithEmail,
  completeRegistrationProfile,
  hasPendingRegistrationProfile,
  sendVerificationEmail,
  signInWithEmail,
} from '@/features/auth/services/auth-service';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import { sameAccountEmail } from '@/features/auth/utils/auth-validation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  retryAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  pendingGoogleEmail: string | null;
  cancelGoogleLink: () => void;
  finishGoogleLink: () => Promise<void>;
  registrationProfilePending: boolean;
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
  const registering = useRef(false);
  const [registrationProfilePending, setRegistrationProfilePending] = useState(false);
  const [pendingGoogle, setPendingGoogle] = useState<{
    email: string;
    credential: OAuthCredential;
  } | null>(null);
  const navigate = useNavigate();
  const cancelGoogleLink = useCallback(() => setPendingGoogle(null), []);

  const finishGoogleLink = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!pendingGoogle || !currentUser?.emailVerified) {
      throw new FirebaseError('auth/unverified-email', 'Verify email before linking');
    }
    if (!sameAccountEmail(currentUser.email, pendingGoogle.email)) {
      throw new FirebaseError('auth/google-email-mismatch', 'Account email does not match');
    }
    await linkWithCredential(currentUser, pendingGoogle.credential);
    await currentUser.getIdToken(true);
    if (auth.currentUser !== currentUser) return;
    setUser(cloneFirebaseUser(currentUser));
    setPendingGoogle(null);
    showToast('Đã kết nối Google', 'success');
  }, [pendingGoogle, showToast]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (cancelled || registering.current) return;
        const modal = useAddMovieStore.getState();
        if (modal.ownerUid && modal.ownerUid !== currentUser?.uid) modal.closeAddModal();
        setUser(currentUser ? cloneFirebaseUser(currentUser) : null);
        setRegistrationProfilePending(
          currentUser ? hasPendingRegistrationProfile(currentUser) : false,
        );
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
    setPendingGoogle(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      if (
        code === 'auth/account-exists-with-different-credential' &&
        error instanceof FirebaseError
      ) {
        const credential = GoogleAuthProvider.credentialFromError(error);
        const email = error.customData?.email;
        if (credential && typeof email === 'string') {
          setPendingGoogle({ email, credential });
          return;
        }
      }
      showToast(getAuthErrorMessage(error), 'error');
    }
  }, [showToast]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const signedInUser = await signInWithEmail(email, password);
      if (!pendingGoogle) return;
      if (!sameAccountEmail(signedInUser.email, pendingGoogle.email)) {
        setPendingGoogle(null);
        showToast(
          'Đã đăng nhập. Yêu cầu liên kết Google đã hủy vì email không trùng khớp.',
          'info',
        );
        return;
      }
      if (!signedInUser.emailVerified) {
        navigate('/settings/account');
        return;
      }
      try {
        await finishGoogleLink();
      } catch (error) {
        showToast(
          getAuthErrorMessage(
            error,
            'Đã đăng nhập nhưng chưa kết nối được Google. Thử lại trong Tài khoản & bảo mật.',
          ),
          'error',
        );
        navigate('/settings/account');
      }
    },
    [pendingGoogle, finishGoogleLink, showToast, navigate],
  );

  const register = useCallback(
    async (displayName: string, email: string, password: string) => {
      registering.current = true;
      try {
        const newUser = await registerWithEmail(displayName, email, password);
        try {
          await completeRegistrationProfile(newUser);
        } catch (error) {
          showToast(getAuthErrorMessage(error), 'error');
        }
        try {
          await sendVerificationEmail(newUser);
        } catch (error) {
          showToast(getAuthErrorMessage(error, MESSAGES.AUTH.VERIFICATION_RESEND_ERROR), 'error');
        }
      } finally {
        registering.current = false;
        setUser(auth.currentUser ? cloneFirebaseUser(auth.currentUser) : null);
        setRegistrationProfilePending(
          auth.currentUser ? hasPendingRegistrationProfile(auth.currentUser) : false,
        );
        setLoading(false);
      }
    },
    [showToast],
  );

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) throw new Error('No signed-in user');
    await sendVerificationEmail(auth.currentUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setPendingGoogle(null);
    } catch (error) {
      console.error('Error signing out', error);
      showToast(MESSAGES.AUTH.LOGOUT_ERROR, 'error');
    }
  }, [showToast]);

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    await completeRegistrationProfile(currentUser);
    await currentUser.reload();
    if (currentUser.emailVerified) await currentUser.getIdToken(true);
    if (auth.currentUser !== currentUser) return false;
    setUser(cloneFirebaseUser(currentUser));
    setRegistrationProfilePending(false);
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
      register,
      resendVerificationEmail,
      logout,
      refreshUser,
      pendingGoogleEmail: pendingGoogle?.email ?? null,
      cancelGoogleLink,
      finishGoogleLink,
      registrationProfilePending,
    }),
    [
      user,
      loading,
      error,
      retryAuth,
      signInWithGoogle,
      loginWithEmail,
      register,
      resendVerificationEmail,
      logout,
      refreshUser,
      pendingGoogle,
      cancelGoogleLink,
      finishGoogleLink,
      registrationProfilePending,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
