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

/** Thêm album mới vào bộ sưu tập của người dùng. */
export const addAlbum = async (album: Omit<Album, 'docId' | 'createdAt' | 'updatedAt'>) => {
  const payload = {
    ...album,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return docRef.id;
};

/** Cập nhật thông tin album. */
export const updateAlbum = async (docId: string, updates: Partial<Album>) => {
  const albumRef = doc(db, COLLECTION_NAME, docId);
  const payload: Partial<Album & { updatedAt: Timestamp }> = {
    ...updates,
    updatedAt: serverTimestamp() as unknown as Timestamp,
  };
  await updateDoc(albumRef, payload as any);
};

/** Xóa album khỏi Firestore. */
export const deleteAlbum = async (docId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, docId));
};

/** Đăng ký lắng nghe thay đổi danh sách album của người dùng. */
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
        movieDocIds: data.movieDocIds || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Album;
    });
    callback(albums);
  });
};

/** Đăng ký lắng nghe thay đổi của một album cụ thể. */
export const subscribeToAlbum = (uid: string, docId: string, callback: (album: Album | null) => void) => {
  const ref = doc(db, COLLECTION_NAME, docId);
  return onSnapshot(ref, snapshot => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data();
    if (data.uid !== uid) {
      callback(null);
      return;
    }
    callback({
      docId: snapshot.id,
      uid: data.uid,
      name: data.name,
      movieDocIds: data.movieDocIds || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Album);
  });
};
