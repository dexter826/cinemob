import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';
import { FirebaseError } from 'firebase/app';

// Chỉ giữ tên cần lưu lại sau lỗi mạng; không lưu mật khẩu hay credential.
const pendingProfileNames = new Map<string, string>();
const profileDraftKey = (user: User) => `cinemob:registration-name:${user.uid}`;

const pendingProfileName = (user: User): string | null => {
  const name = pendingProfileNames.get(user.uid);
  if (name) return name;
  try {
    return sessionStorage.getItem(profileDraftKey(user));
  } catch {
    return null;
  }
};

export const hasPendingRegistrationProfile = (user: User): boolean => !!pendingProfileName(user);

export const completeRegistrationProfile = async (user: User): Promise<void> => {
  const displayName = pendingProfileName(user);
  if (!displayName) return;
  try {
    await updateProfile(user, { displayName });
  } catch {
    throw new FirebaseError('auth/registration-profile-pending', 'Registration profile not saved');
  }
  pendingProfileNames.delete(user.uid);
  try {
    sessionStorage.removeItem(profileDraftKey(user));
  } catch {
    // Bản nháp trong bộ nhớ vẫn được dọn khi trình duyệt chặn storage.
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    // Giữ cùng kết quả ngay cả khi dự án cũ trả user-not-found.
    if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
  }
};

export const sendVerificationEmail = async (user: User): Promise<void> => {
  await sendEmailVerification(user);
};

export const registerWithEmail = async (
  displayName: string,
  email: string,
  password: string,
): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  pendingProfileNames.set(user.uid, displayName.trim());
  try {
    sessionStorage.setItem(profileDraftKey(user), displayName.trim());
  } catch {
    // Vẫn có thể thử lại bằng bản nháp trong bộ nhớ.
  }
  return user;
};
