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
  isTrendingLoading: boolean;
  historyMovies: Movie[];
  previouslyRecommendedTitles: Set<string>;
  setAiRecommendations: (recs: TMDBMovieResult[]) => void;
  setTrendingMovies: (movies: TMDBMovieResult[]) => void;
  setIsAiLoading: (loading: boolean) => void;
  setIsTrendingLoading: (loading: boolean) => void;
  setHistoryMovies: (movies: Movie[]) => void;
  setPreviouslyRecommendedTitles: (titles: Set<string>) => void;
  initializeForUser: (userId: string) => Promise<void>;
  refreshRecommendations: (userId: string, forceRefresh?: boolean) => Promise<void>;
  removeRecommendation: (userId: string, movieTitle: string) => Promise<void>;
}

const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  aiRecommendations: [],
  trendingMovies: [],
  isAiLoading: false,
  isTrendingLoading: false,
  historyMovies: [],
  previouslyRecommendedTitles: new Set(),
  setAiRecommendations: (recs) => set({ aiRecommendations: recs }),
  setTrendingMovies: (movies) => set({ trendingMovies: movies }),
  setIsAiLoading: (loading) => set({ isAiLoading: loading }),
  setIsTrendingLoading: (loading) => set({ isTrendingLoading: loading }),
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

    if (state.trendingMovies.length === 0 || forceRefresh) {
      set({ isTrendingLoading: true });
      (async () => {
        try {
          const { fetchTrendingFallback } = await import('../services/recommendationService');
          const trending = await fetchTrendingFallback();
          if (trending) {
            set({ trendingMovies: trending });
          }
        } catch (e) {
          console.error("Failed to fetch trending movies:", e);
        } finally {
          set({ isTrendingLoading: false });
        }
      })();
    }
    
    const pendingKey = `ai_${userId}`;
    if (pendingRequests.has(pendingKey) && !forceRefresh) {
      return pendingRequests.get(pendingKey);
    }

    set({ isAiLoading: true });

    const requestPromise = (async () => {
      try {
        const { fetchAIRecommendations } = await import('../services/recommendationService');
        const aiResult = await fetchAIRecommendations(
          userId,
          state.historyMovies,
          state.previouslyRecommendedTitles,
          forceRefresh
        );

        if (aiResult) {
          const newRecTitles = aiResult.aiRecommendations.map(m => m.title);
          set(state => ({
            aiRecommendations: aiResult.aiRecommendations,
            previouslyRecommendedTitles: new Set([...Array.from(state.previouslyRecommendedTitles), ...newRecTitles])
          }));
        }
      } catch (error) {
        console.error("AI Recommendations failed:", error);
      } finally {
        set({ isAiLoading: false });
        pendingRequests.delete(pendingKey);
      }
    })();

    pendingRequests.set(pendingKey, requestPromise);
    return requestPromise;
  },
  removeRecommendation: async (userId: string, movieTitle: string) => {
    set(state => ({
      aiRecommendations: state.aiRecommendations.filter(m => m.title !== movieTitle),
      previouslyRecommendedTitles: new Set([...Array.from(state.previouslyRecommendedTitles), movieTitle])
    }));
    try {
      const { updatePreviouslyRecommendedTitles } = await import('../services/userService');
      await updatePreviouslyRecommendedTitles(userId, [movieTitle]);
    } catch (error) {
      console.error("Failed to sync removed recommendation:", error);
    }
  },
}));

export default useRecommendationsStore;