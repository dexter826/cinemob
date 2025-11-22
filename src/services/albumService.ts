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
import { Album } from '../types';

const COLLECTION_NAME = 'albums';

export const addAlbum = async (album: Omit<Album, 'docId' | 'createdAt' | 'updatedAt'>) => {
  const payload = {
    ...album,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return docRef.id;
};

export const updateAlbum = async (docId: string, updates: Partial<Album>) => {
  const albumRef = doc(db, COLLECTION_NAME, docId);
  const payload: Partial<Album & { updatedAt: Timestamp }> = {
    ...updates,
    updatedAt: serverTimestamp() as unknown as Timestamp,
  };
  await updateDoc(albumRef, payload as any);
};

export const deleteAlbum = async (docId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, docId));
};

export const subscribeToAlbums = (uid: string, callback: (albums: Album[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const albums: Album[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        docId: d.id,
        uid: data.uid,
        name: data.name,
        description: data.description || '',
        movieDocIds: data.movieDocIds || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Album;
    });
    callback(albums);
  });
};

export const subscribeToAlbum = (docId: string, callback: (album: Album | null) => void) => {
  const ref = doc(db, COLLECTION_NAME, docId);
  return onSnapshot(ref, snapshot => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data();
    callback({
      docId: snapshot.id,
      uid: data.uid,
      name: data.name,
      description: data.description || '',
      movieDocIds: data.movieDocIds || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Album);
  });
};
