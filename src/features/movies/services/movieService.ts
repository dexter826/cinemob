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
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Movie } from '@/types';

const COLLECTION_NAME = 'movies';

// Lưu phim mới vào kho cá nhân.
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

// Cập nhật thông tin phim.
export const updateMovie = async (docId: string, updates: Partial<Movie>) => {
  try {
    const movieRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(movieRef, updates);
  } catch (error) {
    console.error("Error updating movie: ", error);
    throw error;
  }
};

// Xóa phim khỏi danh sách.
export const deleteMovie = async (docId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, docId));
  } catch (error) {
    console.error("Error deleting movie: ", error);
    throw error;
  }
};

// Kiểm tra phim đã tồn tại chưa. Ném lỗi để caller phân biệt lỗi mạng/quyền với "chưa tồn tại".
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
    throw error;
  }
};

// Chuyển dữ liệu Firestore sang Object Movie.
export const mapDocToMovie = (docId: string, data: Record<string, unknown>): Movie => {
  const d = data as Partial<Movie> & Record<string, unknown>;
  return {
    docId,
    uid: typeof d.uid === 'string' ? d.uid : '',
    id: typeof d.id === 'string' || typeof d.id === 'number' ? d.id : '',
    title: typeof d.title === 'string' ? d.title : '',
    title_vi: typeof d.title_vi === 'string' ? d.title_vi : '',
    poster_path: typeof d.poster_path === 'string' ? d.poster_path : '',
    runtime: typeof d.runtime === 'number' ? d.runtime : 0,
    seasons: typeof d.seasons === 'number' ? d.seasons : 0,
    total_episodes: typeof d.total_episodes === 'number' ? d.total_episodes : 0,
    watched_at: (d.watched_at as Movie['watched_at']) ?? new Date(),
    source: d.source === 'manual' ? 'manual' : 'tmdb',
    media_type: d.media_type === 'tv' ? 'tv' : 'movie',
    status: d.status === 'watchlist' ? 'watchlist' : 'history',
    rating: typeof d.rating === 'number' ? d.rating : 0,
    review: typeof d.review === 'string' ? d.review : '',
    tagline: typeof d.tagline === 'string' ? d.tagline : '',
    genres: typeof d.genres === 'string' ? d.genres : '',
    release_date: typeof d.release_date === 'string' ? d.release_date : '',
    country: typeof d.country === 'string' ? d.country : '',
    content: typeof d.content === 'string' ? d.content : '',
    progress: d.progress as Movie['progress'],
    is_review: d.is_review === true
  };
};

// Theo dõi danh sách phim thời gian thực.
export const subscribeToMovies = (uid: string, callback: (movies: Movie[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("uid", "==", uid),
    orderBy("watched_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const movies = snapshot.docs.map(doc => mapDocToMovie(doc.id, doc.data() as Record<string, unknown>));
    callback(movies);
  }, (error) => {
    console.error("Snapshot error:", error);
    callback([]);
  });
};
