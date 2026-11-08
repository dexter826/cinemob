import { FirebaseError, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  linkWithCredential,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/shared/lib/firebase';

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
      });
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(temporaryAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential)
      throw new FirebaseError('auth/invalid-credential', 'Missing Google credential');
    if (!user.email || result.user.email?.toLowerCase() !== user.email.toLowerCase()) {
      throw new FirebaseError('auth/google-email-mismatch', 'Google email does not match');
    }
    requireAccount(uid);
    await linkWithCredential(user, credential);
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
