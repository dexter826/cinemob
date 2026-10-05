import { create } from 'zustand';
import { Movie } from '@/types';
import { subscribeToMovies } from '../services/movieService';

interface MovieState {
  movies: Movie[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  activeUid: string | null;
  pendingDeleteIds: string[];
  initialize: (uid: string) => void;
  cleanup: () => void;
  setMovies: (movies: Movie[]) => void;
  removeLocal: (docId: string) => void;
  restoreMovie: (movie: Movie) => void;
  clearPendingDelete: (docId: string) => void;
}

// Quản lý và đồng bộ danh sách phim.
const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  loading: true,
  initialized: false,
  unsubscribe: null,
  activeUid: null,
  pendingDeleteIds: [],

  initialize: (uid: string) => {
    const { unsubscribe, activeUid } = get();
    if (unsubscribe && activeUid === uid) return;
    if (unsubscribe) unsubscribe();

    const unsub = subscribeToMovies(uid, (movies) => {
      const pending = get().pendingDeleteIds;
      set({
        movies: movies.filter((m) => !m.docId || !pending.includes(m.docId)),
        loading: false,
        initialized: true,
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
        pendingDeleteIds: [],
        loading: true,
        initialized: false,
      });
    }
  },

  setMovies: (movies) => set({ movies }),
  removeLocal: (docId) =>
    set((state) => ({
      movies: state.movies.filter((m) => m.docId !== docId),
      pendingDeleteIds: [...state.pendingDeleteIds, docId],
    })),
  restoreMovie: (movie) =>
    set((state) => ({
      movies: state.movies.some((m) => m.docId === movie.docId)
        ? state.movies.map((m) => (m.docId === movie.docId ? movie : m))
        : [...state.movies, movie],
      pendingDeleteIds: state.pendingDeleteIds.filter((id) => id !== movie.docId),
    })),
  clearPendingDelete: (docId) =>
    set((state) => ({
      pendingDeleteIds: state.pendingDeleteIds.filter((id) => id !== docId),
    })),
}));

export default useMovieStore;
