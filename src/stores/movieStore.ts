import { create } from 'zustand';
import { Movie } from '../types';
import { subscribeToMovies } from '../services/movieService';

interface MovieState {
  movies: Movie[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  initialize: (uid: string) => void;
  cleanup: () => void;
  setMovies: (movies: Movie[]) => void;
}

/** Store trung tâm quản lý và đồng bộ danh sách phim. */
const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  loading: true,
  initialized: false,
  unsubscribe: null,

  /** Khởi tạo listener Firestore duy nhất. */
  initialize: (uid: string) => {
    if (get().unsubscribe) return;

    const unsub = subscribeToMovies(uid, (movies) => {
      set({ 
        movies, 
        loading: false, 
        initialized: true 
      });
    });

    set({ unsubscribe: unsub });
  },

  /** Hủy lắng nghe dữ liệu. */
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ 
        unsubscribe: null, 
        movies: [], 
        loading: true, 
        initialized: false 
      });
    }
  },

  /** Cập nhật thủ công danh sách phim. */
  setMovies: (movies) => set({ movies })
}));

export default useMovieStore;
