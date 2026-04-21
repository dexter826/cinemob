import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';

/** Lấy dữ liệu người dùng từ Firestore. */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Failed to get user data:', error);
    }
    return null;
  }
};

/** Cập nhật danh sách phim đã gợi ý để tránh lặp lại. */
export const updatePreviouslyRecommendedTitles = async (userId: string, titles: string[]): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        previouslyRecommendedTitles: arrayUnion(...titles)
      });
    } else {
      await setDoc(userRef, {
        previouslyRecommendedTitles: titles
      });
    }
  } catch (error) {
    console.error('Failed to update previously recommended titles:', error);
  }
};
