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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Movie } from '../types';

const COLLECTION_NAME = 'movies';

export const addMovie = async (movie: Omit<Movie, 'docId'>) => {
  try {
    // Ensure watched_at is a Date or Timestamp, default to serverTimestamp if missing
    // Note: If passed a JS Date, Firestore handles it.
    const payload = {
      ...movie,
      watched_at: movie.watched_at || serverTimestamp()
    };
    
    await addDoc(collection(db, COLLECTION_NAME), payload);
  } catch (error) {
    console.error("Error adding movie: ", error);
    throw error;
  }
};

export const updateMovie = async (docId: string, updates: Partial<Movie>) => {
  try {
    const movieRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(movieRef, updates);
  } catch (error) {
    console.error("Error updating movie: ", error);
    throw error;
  }
};

export const deleteMovie = async (docId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, docId));
  } catch (error) {
    console.error("Error deleting movie: ", error);
    throw error;
  }
};

export const subscribeToMovies = (uid: string, callback: (movies: Movie[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("uid", "==", uid),
    orderBy("watched_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const movies = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert timestamp to Date for easier handling in UI if needed, 
      // but keeping as Timestamp/Date mix is handled by helper functions in UI
      return {
        docId: doc.id,
        uid: data.uid,
        id: data.id,
        title: data.title,
        poster_path: data.poster_path,
        runtime: data.runtime,
        seasons: data.seasons || 0,
        watched_at: data.watched_at,
        source: data.source,
        media_type: data.media_type || 'movie',
        rating: data.rating || 0,
        review: data.review || '',
        tagline: data.tagline || '',
        genres: data.genres || '',
        release_date: data.release_date || ''
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