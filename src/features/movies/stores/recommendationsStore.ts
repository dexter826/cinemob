import { create } from 'zustand';
import { TMDBMovieResult, Movie } from '@/types';
import { fetchAIRecommendations, fetchTrendingFallback } from '../services/recommendationService';
import { getUserData, updatePreviouslyRecommendedTitles } from '@/features/auth/services/userService';

const pendingRequests = new Map<string, { requestId: number; promise: Promise<void> }>();
let userGeneration = 0;
let aiRequestId = 0;
let trendingRequestId = 0;

interface RecommendationsState {
  activeUserId: string | null;
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
  reset: () => void;
  initializeForUser: (userId: string) => Promise<void>;
  refreshRecommendations: (userId: string, forceRefresh?: boolean) => Promise<void>;
  removeRecommendation: (userId: string, movieTitle: string) => Promise<void>;
}

// Quản lý gợi ý phim từ AI và xu hướng.
const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  activeUserId: null,
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
  reset: () => {
    userGeneration += 1;
    aiRequestId += 1;
    trendingRequestId += 1;
    pendingRequests.clear();
    set({
      activeUserId: null,
      aiRecommendations: [],
      trendingMovies: [],
      isAiLoading: false,
      isTrendingLoading: false,
      historyMovies: [],
      previouslyRecommendedTitles: new Set<string>(),
    });
  },
  initializeForUser: async (userId: string) => {
    if (get().activeUserId !== userId) {
      userGeneration += 1;
      aiRequestId += 1;
      trendingRequestId += 1;
      pendingRequests.clear();
      set({
        activeUserId: userId,
        aiRecommendations: [],
        trendingMovies: [],
        isAiLoading: false,
        isTrendingLoading: false,
        historyMovies: [],
        previouslyRecommendedTitles: new Set<string>(),
      });
    }
    const generation = userGeneration;
    try {
      const userData = await getUserData(userId);
      if (get().activeUserId !== userId || generation !== userGeneration) return;
      if (userData && userData.previouslyRecommendedTitles) {
        set({ previouslyRecommendedTitles: new Set(userData.previouslyRecommendedTitles) });
      } else {
        set({ previouslyRecommendedTitles: new Set<string>() });
      }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code !== 'permission-denied') {
        console.error('Failed to initialize user data from Firestore:', e);
      }
      if (get().activeUserId === userId && generation === userGeneration) {
        set({ previouslyRecommendedTitles: new Set<string>() });
      }
    }
  },
  refreshRecommendations: async (userId: string, forceRefresh = false) => {
    if (get().activeUserId !== userId) return;
    const generation = userGeneration;
    const shouldFetchTrending = get().trendingMovies.length === 0 || forceRefresh;

    if (shouldFetchTrending) {
      const requestId = ++trendingRequestId;
      set({ isTrendingLoading: true });
      try {
        const trending = await fetchTrendingFallback();
        if (trending && get().activeUserId === userId && generation === userGeneration && requestId === trendingRequestId) {
          set({ trendingMovies: trending });
        }
      } catch (e) {
        console.error("Failed to fetch trending movies:", e);
      } finally {
        if (get().activeUserId === userId && generation === userGeneration && requestId === trendingRequestId) {
          set({ isTrendingLoading: false });
        }
      }
    }
    
    const pendingKey = `ai_${userId}`;
    if (pendingRequests.has(pendingKey) && !forceRefresh) {
      return pendingRequests.get(pendingKey)?.promise;
    }

    set({ isAiLoading: true });
    const requestId = ++aiRequestId;

    const requestPromise = (async () => {
      try {
        const currentState = get();
        const aiResult = await fetchAIRecommendations(
          userId,
          currentState.historyMovies,
          currentState.previouslyRecommendedTitles,
          forceRefresh
        );

        if (aiResult && get().activeUserId === userId && generation === userGeneration && requestId === aiRequestId) {
          const newRecTitles = aiResult.aiRecommendations.map(m => m.title).filter((t): t is string => typeof t === 'string');
          set(state => ({
            aiRecommendations: aiResult.aiRecommendations,
            previouslyRecommendedTitles: new Set([...Array.from(state.previouslyRecommendedTitles), ...newRecTitles])
          }));
        }
      } catch (error) {
        console.error("AI Recommendations failed:", error);
      } finally {
        if (get().activeUserId === userId && generation === userGeneration && requestId === aiRequestId) {
          set({ isAiLoading: false });
        }
        if (pendingRequests.get(pendingKey)?.requestId === requestId) {
          pendingRequests.delete(pendingKey);
        }
      }
    })();

    pendingRequests.set(pendingKey, { requestId, promise: requestPromise });
    return requestPromise;
  },
  removeRecommendation: async (userId: string, movieTitle: string) => {
    if (get().activeUserId !== userId) return;
    set(state => ({
      aiRecommendations: state.aiRecommendations.filter(m => m.title !== movieTitle),
      previouslyRecommendedTitles: new Set([...state.previouslyRecommendedTitles, movieTitle])
    }));
    try {
      await updatePreviouslyRecommendedTitles(userId, [movieTitle]);
    } catch (error) {
      console.error("Failed to sync removed recommendation:", error);
    }
  },
}));

export default useRecommendationsStore;
