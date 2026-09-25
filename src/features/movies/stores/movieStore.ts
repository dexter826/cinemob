import { create } from 'zustand';
import { Movie } from '@/types';
import { subscribeToMovies } from '../services/movieService';

interface MovieState {
  movies: Movie[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  activeUid: string | null;
  initialize: (uid: string) => void;
  cleanup: () => void;
  setMovies: (movies: Movie[]) => void;
}

// Quản lý và đồng bộ danh sách phim.
const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  loading: true,
  initialized: false,
  unsubscribe: null,
  activeUid: null,

  initialize: (uid: string) => {
    const { unsubscribe, activeUid } = get();
    if (unsubscribe && activeUid === uid) return;
    if (unsubscribe) unsubscribe();

    const unsub = subscribeToMovies(uid, (movies) => {
      set({
        movies,
        loading: false,
        initialized: true
      });
    });

    set({ unsubscribe: unsub, activeUid: uid });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({
        unsubscribe: null,
        activeUid: null,
        movies: [],
        loading: true,
        initialized: false
      });
    }
  },

  setMovies: (movies) => set({ movies })
}));

export default useMovieStore;
