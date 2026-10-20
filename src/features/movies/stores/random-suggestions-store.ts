import { create } from 'zustand';
import { TMDBMovieResult } from '@/types';
import { getRandomSuggestions } from '@/features/search/services/tmdb';

let randomMoviesRequestId = 0;

interface RandomSuggestionsState {
  movies: TMDBMovieResult[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchRandomMovies: (forceRefresh?: boolean) => Promise<void>;
}

const useRandomSuggestionsStore = create<RandomSuggestionsState>((set, get) => ({
  movies: [],
  isLoading: false,
  hasLoaded: false,
  error: null,
  fetchRandomMovies: async (forceRefresh = false) => {
    if (get().movies.length > 0 && !forceRefresh) return;

    const requestId = ++randomMoviesRequestId;
    set({ isLoading: true, error: null });

    try {
      const results = await getRandomSuggestions();
      if (requestId === randomMoviesRequestId) {
        set({ movies: results, hasLoaded: true });
      }
    } catch (error) {
      console.error('Failed to fetch random suggestions:', error);
      if (requestId === randomMoviesRequestId) {
        set({ error: 'Không tải được đề xuất.', hasLoaded: true });
      }
    } finally {
      if (requestId === randomMoviesRequestId) {
        set({ isLoading: false });
      }
    }
  },
}));

export default useRandomSuggestionsStore;
