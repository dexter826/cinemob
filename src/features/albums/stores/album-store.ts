import { create } from 'zustand';
import { Album, Movie } from '@/types';
import { subscribeToAlbums } from '../services/album-service';
interface AlbumState {
  albums: Album[];
  loading: boolean;
  error: string | null;
  activeUid: string | null;
  albumCoverMovies: Record<string, Movie[]>;
  initialize: (uid: string) => void;
  cleanup: () => void;
  retry: () => void;
  setAlbums: (albums: Album[]) => void;
  setLoading: (loading: boolean) => void;
  setAlbumCoverMovies: (covers: Record<string, Movie[]>) => void;
}
let unsubscribe: (() => void) | null = null;
let generation = 0;
const useAlbumStore = create<AlbumState>((set, get) => ({
  albums: [],
  loading: true,
  error: null,
  activeUid: null,
  albumCoverMovies: {},
  initialize: (uid) => {
    if (get().activeUid === uid && unsubscribe) return;
    unsubscribe?.();
    const request = ++generation;
    const sameUser = get().activeUid === uid;
    set({
      activeUid: uid,
      loading: true,
      error: null,
      ...(!sameUser ? { albums: [], albumCoverMovies: {} } : {}),
    });
    unsubscribe = subscribeToAlbums(
      uid,
      (albums) => {
        if (generation === request) set({ albums, loading: false, error: null });
      },
      () => {
        if (generation === request)
          set({ loading: false, error: 'Không tải được danh sách album.' });
      },
    );
  },
  cleanup: () => {
    ++generation;
    unsubscribe?.();
    unsubscribe = null;
    set({ activeUid: null, albums: [], albumCoverMovies: {}, loading: false, error: null });
  },
  retry: () => {
    const uid = get().activeUid;
    if (!uid) return;
    unsubscribe?.();
    unsubscribe = null;
    get().initialize(uid);
  },
  setAlbums: (albums) => set({ albums }),
  setLoading: (loading) => set({ loading }),
  setAlbumCoverMovies: (albumCoverMovies) => set({ albumCoverMovies }),
}));
export default useAlbumStore;
