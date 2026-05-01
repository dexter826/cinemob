import { create } from 'zustand';
import { TMDBMovieResult, Movie } from '../types';

const CACHE_DURATION = {
  AI_RECS: 7 * 24 * 60 * 60 * 1000,
  PREVIOUSLY_RECOMMENDED: 30 * 24 * 60 * 60 * 1000
} as const;

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

const pendingRequests = new Map<string, Promise<any>>();

interface RecommendationsState {
  aiRecommendations: TMDBMovieResult[];
  trendingMovies: TMDBMovieResult[];
  isAiLoading: boolean;
  historyMovies: Movie[];
  previouslyRecommendedTitles: Set<string>;
  setAiRecommendations: (recs: TMDBMovieResult[]) => void;
  setTrendingMovies: (movies: TMDBMovieResult[]) => void;
  setIsAiLoading: (loading: boolean) => void;
  setHistoryMovies: (movies: Movie[]) => void;
  setPreviouslyRecommendedTitles: (titles: Set<string>) => void;
  initializeForUser: (userId: string) => Promise<void>;
  refreshRecommendations: (userId: string, forceRefresh?: boolean) => Promise<void>;
}

// Quản lý phim gợi ý từ AI và trending.
const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  aiRecommendations: [],
  trendingMovies: [],
  isAiLoading: false,
  historyMovies: [],
  previouslyRecommendedTitles: new Set(),
  setAiRecommendations: (recs) => set({ aiRecommendations: recs }),
  setTrendingMovies: (movies) => set({ trendingMovies: movies }),
  setIsAiLoading: (loading) => set({ isAiLoading: loading }),
  setHistoryMovies: (movies) => set({ historyMovies: movies }),
  setPreviouslyRecommendedTitles: (titles) => set({ previouslyRecommendedTitles: titles }),
  initializeForUser: async (userId: string) => {
    try {
      const { getUserData } = await import('../services/userService');
      const userData = await getUserData(userId);
      if (userData && userData.previouslyRecommendedTitles) {
        set({ previouslyRecommendedTitles: new Set(userData.previouslyRecommendedTitles) });
      } else {
        set({ previouslyRecommendedTitles: new Set<string>() });
      }
    } catch (e: any) {
      if (e?.code !== 'permission-denied') {
        console.error('Failed to initialize user data from Firestore:', e);
      }
      set({ previouslyRecommendedTitles: new Set<string>() });
    }
  },
  refreshRecommendations: async (userId: string, forceRefresh = false) => {
    const state = get();
    
    const pendingKey = `ai_${userId}`;
    if (pendingRequests.has(pendingKey) && !forceRefresh) {
      return pendingRequests.get(pendingKey);
    }

    set({ isAiLoading: true });

    const requestPromise = (async () => {
      try {
        const { fetchAIRecommendations, fetchTrendingFallback } = await import('../services/recommendationService');
        
        const result = await fetchAIRecommendations(
          userId,
          state.historyMovies,
          state.previouslyRecommendedTitles,
          forceRefresh
        );

        if (result) {
          set({
            aiRecommendations: result.aiRecommendations,
            previouslyRecommendedTitles: new Set(JSON.parse(localStorage.getItem(`previously_recommended_${userId}`) || '{"titles":[]}').titles)
          });
        } else {
          const trending = await fetchTrendingFallback();
          set({ trendingMovies: trending });
        }
      } catch (error) {
        console.error("Recommendations failed:", error);
        const { fetchTrendingFallback } = await import('../services/recommendationService');
        const trending = await fetchTrendingFallback();
        set({ trendingMovies: trending });
      } finally {
        set({ isAiLoading: false });
        pendingRequests.delete(pendingKey);
      }
    })();

    pendingRequests.set(pendingKey, requestPromise);
    return requestPromise;
  },
}));

export default useRecommendationsStore;