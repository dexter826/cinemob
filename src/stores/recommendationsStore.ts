import { create } from 'zustand';
import { TMDBMovieResult, Movie } from '../types';

interface RecommendationsState {
  aiRecommendations: TMDBMovieResult[];
  trendingMovies: TMDBMovieResult[];
  isAiLoading: boolean;
  historyMovies: Movie[];
  lastAiHistoryLength: number;
  hasFetchedInitial: boolean;
  previouslyRecommendedTitles: Set<string>;
  setAiRecommendations: (recs: TMDBMovieResult[]) => void;
  setTrendingMovies: (movies: TMDBMovieResult[]) => void;
  setIsAiLoading: (loading: boolean) => void;
  setHistoryMovies: (movies: Movie[]) => void;
  setLastAiHistoryLength: (length: number) => void;
  setHasFetchedInitial: (fetched: boolean) => void;
  setPreviouslyRecommendedTitles: (titles: Set<string>) => void;
  initializeForUser: (userId: string) => void;
  refreshRecommendations: (userId: string, forceRefresh?: boolean) => Promise<void>;
}

const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  aiRecommendations: [],
  trendingMovies: [],
  isAiLoading: false,
  historyMovies: [],
  lastAiHistoryLength: 0,
  hasFetchedInitial: false,
  previouslyRecommendedTitles: new Set(),
  setAiRecommendations: (recs) => set({ aiRecommendations: recs }),
  setTrendingMovies: (movies) => set({ trendingMovies: movies }),
  setIsAiLoading: (loading) => set({ isAiLoading: loading }),
  setHistoryMovies: (movies) => set({ historyMovies: movies }),
  setLastAiHistoryLength: (length) => set({ lastAiHistoryLength: length }),
  setHasFetchedInitial: (fetched) => set({ hasFetchedInitial: fetched }),
  setPreviouslyRecommendedTitles: (titles) => set({ previouslyRecommendedTitles: titles }),
  initializeForUser: (userId: string) => {
    // Load previously recommended titles
    const stored = sessionStorage.getItem(`previously_recommended_${userId}`);
    const titles = stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    set({ previouslyRecommendedTitles: titles });
  },
  refreshRecommendations: async (userId: string, forceRefresh = false) => {
    const state = get();

    const watchedHistory = state.historyMovies.filter(m => (m.status || 'history') === 'history');

    // If user has watched at least 3 movies, try AI recommendations
    if (watchedHistory.length >= 3) {
      const cacheKey = `ai_recs_${userId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      // Use cache if available and history length matches, unless force refresh
      if (cachedData && !forceRefresh) {
        const parsedCache = JSON.parse(cachedData);
        if (parsedCache.historyLength === watchedHistory.length && parsedCache.data) {
          set({
            aiRecommendations: parsedCache.data,
            lastAiHistoryLength: watchedHistory.length
          });
          return;
        }
      }

      set({ isAiLoading: true });
      try {
        // Import here to avoid circular dependencies
        const { getAIRecommendations } = await import('../services/aiService');
        const { searchMovies, getTrendingMovies } = await import('../services/tmdbService');

        const aiRecs = await getAIRecommendations(watchedHistory, state.historyMovies, Array.from(state.previouslyRecommendedTitles));
        const tmdbPromises = aiRecs.map(async (rec) => {
          const searchRes = await searchMovies(rec.title);
          return searchRes.results.length > 0 ? searchRes.results[0] : null;
        });

        const tmdbResults = (await Promise.all(tmdbPromises)).filter(m => m !== null) as TMDBMovieResult[];
        // Lấy 15 phim từ 17 phim được trả về (để phòng trường hợp một số phim không có trong TMDB)
        const displayResults = tmdbResults.slice(0, 15);
        set({
          aiRecommendations: displayResults,
          lastAiHistoryLength: watchedHistory.length
        });

        // Add new recommendations to previously recommended list
        const newTitles = aiRecs.map(rec => rec.title);
        const updatedPreviouslyRecommended = new Set([...state.previouslyRecommendedTitles, ...newTitles]);
        set({ previouslyRecommendedTitles: updatedPreviouslyRecommended });

        // Save to sessionStorage
        sessionStorage.setItem(`previously_recommended_${userId}`, JSON.stringify([...updatedPreviouslyRecommended]));

        sessionStorage.setItem(cacheKey, JSON.stringify({
          historyLength: watchedHistory.length,
          data: tmdbResults
        }));
      } catch (e) {
        console.error('AI recommendations failed, falling back to trending:', e);
        // Fallback to trending movies
        const { getTrendingMovies } = await import('../services/tmdbService');
        const trendingData = await getTrendingMovies();
        set({ trendingMovies: trendingData.results });
      } finally {
        set({ isAiLoading: false });
      }
    } else {
      // Not enough history, show trending movies
      const { getTrendingMovies } = await import('../services/tmdbService');
      const trendingData = await getTrendingMovies();
      set({ trendingMovies: trendingData.results });
    }
  },
}));

export default useRecommendationsStore;