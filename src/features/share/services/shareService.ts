import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Movie, PublicShare, PublicShareMovie } from '@/types';

const COLLECTION_NAME = 'public_shares';

export const getPublicShare = async (uid: string): Promise<PublicShare | null> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const raw: unknown = snap.data();
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Partial<PublicShare>;
  if (typeof data.isEnabled !== 'boolean') return null;
  const movies = Array.isArray(data.movies)
    ? data.movies.filter(
        (m): m is PublicShareMovie =>
          typeof m === 'object' && m !== null &&
          (typeof (m as PublicShareMovie).id === 'string' || typeof (m as PublicShareMovie).id === 'number') &&
          typeof (m as PublicShareMovie).title === 'string'
      )
    : [];
  return {
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
    isEnabled: data.isEnabled,
    updatedAt: (data.updatedAt as PublicShare['updatedAt']) ?? new Date(),
    totalCount: typeof data.totalCount === 'number' ? data.totalCount : movies.length,
    movies,
  };
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
