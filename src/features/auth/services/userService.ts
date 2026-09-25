import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/types';

// Lấy dữ liệu người dùng từ Firestore.
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const raw: unknown = userDoc.data();
      if (typeof raw !== 'object' || raw === null) return null;
      const titles = (raw as Partial<UserData>).previouslyRecommendedTitles;
      return { previouslyRecommendedTitles: Array.isArray(titles) ? titles.filter((t): t is string => typeof t === 'string') : [] };
    }
    return null;
  } catch (error: unknown) {
    if ((error as { code?: string })?.code !== 'permission-denied') {
      console.error('Failed to get user data:', error);
    }
    return null;
  }
};

// Cập nhật danh sách phim đã gợi ý.
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
    throw error;
  }
};
