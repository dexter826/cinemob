import { sendEmailVerification, signInWithEmailAndPassword, type User } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
};

export const sendVerificationEmail = async (user: User): Promise<void> => {
  await sendEmailVerification(user);
};
