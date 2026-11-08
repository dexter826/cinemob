import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
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
