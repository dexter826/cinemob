import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { Movie } from '../types';

const COLLECTION_NAME = 'movies';

/** Thêm phim mới vào kho lưu trữ cá nhân. */
export const addMovie = async (movie: Omit<Movie, 'docId'>) => {
  try {
    const payload = {
      ...movie,
      watched_at: movie.watched_at || serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return docRef.id;
  } catch (error) {
    console.error("Error adding movie: ", error);
    throw error;
  }
};

/** Cập nhật thông tin của một bộ phim đã lưu. */
export const updateMovie = async (docId: string, updates: Partial<Movie>) => {
  try {
    const movieRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(movieRef, updates);
  } catch (error) {
    console.error("Error updating movie: ", error);
    throw error;
  }
};

/** Xóa phim khỏi danh sách của người dùng. */
export const deleteMovie = async (docId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, docId));
  } catch (error) {
    console.error("Error deleting movie: ", error);
    throw error;
  }
};

/** Kiểm tra xem phim đã tồn tại trong danh sách của người dùng chưa. */
export const checkMovieExists = async (uid: string, movieId: string | number): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("uid", "==", uid),
      where("id", "==", movieId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking movie existence: ", error);
    return false;
  }
};

/** Theo dõi thay đổi danh sách phim của người dùng theo thời gian thực. */
export const subscribeToMovies = (uid: string, callback: (movies: Movie[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("uid", "==", uid),
    orderBy("watched_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const movies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        docId: doc.id,
        uid: data.uid,
        id: data.id,
        title: data.title,
        title_vi: data.title_vi || '',
        poster_path: data.poster_path,
        runtime: data.runtime,
        seasons: data.seasons || 0,
        total_episodes: data.total_episodes || 0,
        watched_at: data.watched_at,
        source: data.source,
        media_type: data.media_type || 'movie',
        status: data.status || 'history',
        rating: data.rating || 0,
        review: data.review || '',
        tagline: data.tagline || '',
        genres: data.genres || '',
        release_date: data.release_date || '',
        country: data.country || '',
        content: data.content || '',
        progress: data.progress || undefined
      } as Movie;
    });
    callback(movies);
  }, (error) => {
    console.error("Snapshot error:", error);
    if (error.code === 'permission-denied') {
      console.error("Permission Denied: Check Firestore Security Rules.");
    }
  });
};