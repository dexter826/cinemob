import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Movie, PublicShare, PublicShareMovie } from '@/types';

const COLLECTION_NAME = 'public_shares';

export const getPublicShare = async (uid: string): Promise<PublicShare | null> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<PublicShare>;
  if (typeof data.isEnabled !== 'boolean') return null;
  if (!Array.isArray(data.movies)) return null;
  return snap.data() as PublicShare;
};

export const upsertPublicShare = async (uid: string, data: Omit<PublicShare, 'updatedAt'>): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const setShareEnabled = async (uid: string, enabled: boolean): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  await setDoc(ref, { isEnabled: enabled, updatedAt: serverTimestamp() }, { merge: true });
};

export const buildShareMovies = (movies: Movie[]): PublicShareMovie[] => {
  return movies.filter((m) => (m.status || 'history') === 'history').slice(0, 500).map((m) => ({
    id: m.id,
    title: m.title,
    title_vi: m.title_vi ?? '',
    poster_path: m.poster_path ?? '',
    media_type: m.media_type ?? 'movie' as const,
    release_date: m.release_date ?? '',
    rating: m.rating ?? 0
  }));
};
