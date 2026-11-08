import { FirebaseError, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  linkWithCredential,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  signInWithPopup,
  signOut,
  updatePassword,
  unlink,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/shared/lib/firebase';
import { sameAccountEmail } from '../utils/auth-validation';

export const requireAccount = (uid: string): User => {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) throw new FirebaseError('auth/user-mismatch', 'Account changed');
  return user;
};

export const hasProvider = (user: User, providerId: string): boolean =>
  user.providerData.some((provider) => provider.providerId === providerId);

export const connectGoogle = async (uid: string): Promise<void> => {
  const user = requireAccount(uid);
  // Phiên tạm chỉ dùng để chọn Google, không thay đổi phiên đăng nhập chính.
  const appName = 'cinemob-account-link';
  const existingApp = getApps().find((app) => app.name === appName);
  const temporaryAuth = existingApp
    ? getAuth(existingApp)
    : initializeAuth(initializeApp(auth.app.options, appName), {
        persistence: inMemoryPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(temporaryAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential)
      throw new FirebaseError('auth/invalid-credential', 'Missing Google credential');
    if (!sameAccountEmail(result.user.email, user.email)) {
      throw new FirebaseError('auth/google-email-mismatch', 'Google email does not match');
    }
    requireAccount(uid);
    // Google có thể đã được Firebase tự liên kết với email do Google quản lý.
    await user.reload();
    requireAccount(uid);
    if (!hasProvider(user, 'google.com')) await linkWithCredential(user, credential);
  } finally {
    await signOut(temporaryAuth);
  }
};

export const reauthenticateAccount = async (uid: string, password?: string): Promise<void> => {
  const user = requireAccount(uid);
  if (password !== undefined) {
    if (!user.email) throw new FirebaseError('auth/invalid-email', 'Missing account email');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    await reauthenticateWithPopup(user, googleProvider);
  }
  requireAccount(uid);
};

export const saveAccountPassword = async (
  uid: string,
  newPassword: string,
  currentPassword?: string,
): Promise<void> => {
  const user = requireAccount(uid);
  if (!user.email) throw new FirebaseError('auth/invalid-email', 'Missing account email');
  if (hasProvider(user, 'password')) {
    if (!currentPassword)
      throw new FirebaseError('auth/incorrect-current-password', 'Missing password');
    try {
      await reauthenticateAccount(uid, currentPassword);
    } catch (error) {
      if (
        ['auth/invalid-credential', 'auth/wrong-password'].includes(
          (error as { code?: string }).code ?? '',
        )
      ) {
        throw new FirebaseError('auth/incorrect-current-password', 'Incorrect current password');
      }
      throw error;
    }
    await updatePassword(requireAccount(uid), newPassword);
  } else {
    await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPassword));
  }
};

export const unlinkAccountMethod = async (uid: string, providerId: string): Promise<void> => {
  const user = requireAccount(uid);
  await user.reload();
  requireAccount(uid);
  if (!hasProvider(user, providerId))
    throw new FirebaseError('auth/no-such-provider', 'Provider missing');
  if (user.providerData.length <= 1)
    throw new FirebaseError('auth/last-sign-in-method', 'Last sign-in method');
  await unlink(user, providerId);
};
