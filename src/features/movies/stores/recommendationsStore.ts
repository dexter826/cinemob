import { create } from 'zustand';
import { TMDBMovieResult } from '@/types';
import { fetchAIRecommendations, fetchTrendingFallback } from '../services/recommendationService';
import useMovieStore from './movieStore';

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
  aiFailed: boolean;
  reset: () => void;
  setActiveUser: (userId: string) => void;
  refreshRecommendations: (userId: string, forceRefresh?: boolean) => Promise<void>;
  removeRecommendation: (movieTitle: string) => void;
}

// Quản lý gợi ý phim từ AI và xu hướng.
const useRecommendationsStore = create<RecommendationsState>((set, get) => {
  const beginFreshState = (activeUserId: string | null) => {
    userGeneration += 1;
    aiRequestId += 1;
    trendingRequestId += 1;
    pendingRequests.clear();
    set({
      activeUserId,
      aiRecommendations: [],
      trendingMovies: [],
      isAiLoading: false,
      isTrendingLoading: false,
      aiFailed: false,
    });
  };

  return {
    activeUserId: null,
    aiRecommendations: [],
    trendingMovies: [],
    isAiLoading: false,
    isTrendingLoading: false,
    aiFailed: false,
    reset: () => beginFreshState(null),
    // Đặt user hiện tại, xoá dữ liệu cũ nếu đổi user.
    setActiveUser: (userId) => {
      if (get().activeUserId === userId) return;
      beginFreshState(userId);
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
          if (
            trending &&
            get().activeUserId === userId &&
            generation === userGeneration &&
            requestId === trendingRequestId
          ) {
            set({ trendingMovies: trending });
          }
        } catch (e) {
          console.error('Failed to fetch trending movies:', e);
        } finally {
          if (
            get().activeUserId === userId &&
            generation === userGeneration &&
            requestId === trendingRequestId
          ) {
            set({ isTrendingLoading: false });
          }
        }
      }

      // AI đã fail: chỉ gọi lại khi refresh thủ công.
      if (get().aiFailed && !forceRefresh) return;

      const pendingKey = `ai_${userId}`;
      if (pendingRequests.has(pendingKey) && !forceRefresh) {
        return pendingRequests.get(pendingKey)?.promise;
      }

      set({ isAiLoading: true });
      const requestId = ++aiRequestId;

      const requestPromise = (async () => {
        try {
          const allMovies = useMovieStore.getState().movies;
          const aiResult = await fetchAIRecommendations(userId, allMovies, forceRefresh);

          if (
            aiResult &&
            get().activeUserId === userId &&
            generation === userGeneration &&
            requestId === aiRequestId
          ) {
            set({ aiRecommendations: aiResult.aiRecommendations, aiFailed: false });
          }
        } catch (error) {
          console.error('AI Recommendations failed:', error);
          if (
            get().activeUserId === userId &&
            generation === userGeneration &&
            requestId === aiRequestId
          ) {
            set({ aiFailed: true });
          }
        } finally {
          if (
            get().activeUserId === userId &&
            generation === userGeneration &&
            requestId === aiRequestId
          ) {
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
    // Xoá gợi ý khỏi danh sách đang hiển thị.
    removeRecommendation: (movieTitle) => {
      set((state) => ({
        aiRecommendations: state.aiRecommendations.filter((m) => m.title !== movieTitle),
      }));
    },
  };
});

export default useRecommendationsStore;
