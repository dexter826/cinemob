import { create } from 'zustand';
import { TMDBMovieResult } from '@/types';
import { getTrendingMovies } from '@/features/search/services/tmdb';

let trendingRequestId = 0;

interface TrendingState {
  trendingMovies: TMDBMovieResult[];
  isTrendingLoading: boolean;
  trendingError: string | null;
  fetchTrending: (forceRefresh?: boolean) => Promise<void>;
}

export const useTrendingStore = create<TrendingState>((set, get) => ({
  trendingMovies: [],
  isTrendingLoading: false,
  trendingError: null,
  fetchTrending: async (forceRefresh = false) => {
    if (get().trendingMovies.length > 0 && !forceRefresh) return;

    const requestId = ++trendingRequestId;
    set({ isTrendingLoading: true, trendingError: null });

    try {
      const data = await getTrendingMovies();
      if (requestId === trendingRequestId) {
        set({ trendingMovies: data.results || [] });
      }
    } catch (e) {
      console.error('Failed to fetch trending movies:', e);
      if (requestId === trendingRequestId) {
        set({ trendingError: 'Không cập nhật được phim thịnh hành.' });
      }
    } finally {
      if (requestId === trendingRequestId) {
        set({ isTrendingLoading: false });
      }
    }
  },
}));

export default useTrendingStore;
