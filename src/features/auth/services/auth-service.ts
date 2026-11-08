import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

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
  await updateProfile(user, { displayName: displayName.trim() });
  return user;
};
