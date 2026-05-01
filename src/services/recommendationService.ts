import { TMDBMovieResult, Movie } from '../types';
import { getAIRecommendations } from './aiService';
import { searchMovies, getTrendingMovies, withLimit } from './tmdb';

const CACHE_DURATION = {
  AI_RECS: 7 * 24 * 60 * 60 * 1000,
} as const;

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

// Lấy phim gợi ý từ AI kèm cache.
export const fetchAIRecommendations = async (
  userId: string,
  historyMovies: Movie[],
  previouslyRecommendedTitles: Set<string>,
  forceRefresh: boolean = false
): Promise<{ aiRecommendations: TMDBMovieResult[]; lastAiHistoryLength: number } | null> => {
  const watchedHistory = historyMovies.filter(m => (m.status || 'history') === 'history');
  
  if (watchedHistory.length < 3) return null;

  const cacheKey = `ai_recs_${userId}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData && !forceRefresh) {
    try {
      const parsedCache = JSON.parse(cachedData);
      if (
        parsedCache.timestamp &&
        !isExpired(parsedCache.timestamp, CACHE_DURATION.AI_RECS) &&
        parsedCache.historyLength === watchedHistory.length &&
        parsedCache.data
      ) {
        return {
          aiRecommendations: parsedCache.data,
          lastAiHistoryLength: watchedHistory.length,
        };
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const aiRecs = await getAIRecommendations(
    watchedHistory,
    historyMovies,
    Array.from(previouslyRecommendedTitles)
  );

  const tasks = aiRecs.slice(0, 22).map((rec) => async () => {
    try {
      const searchRes = await searchMovies(rec.title);
      return searchRes.results.length > 0 ? searchRes.results[0] : null;
    } catch (error) {
      console.error(`Failed to search for recommended movie: ${rec.title}`, error);
      return null;
    }
  });

  const tmdbResultsRaw = await withLimit(tasks, 5);
  const tmdbResults = tmdbResultsRaw.filter(m => m !== null) as TMDBMovieResult[];
  const displayResults = tmdbResults.slice(0, 20);

  localStorage.setItem(cacheKey, JSON.stringify({
    historyLength: watchedHistory.length,
    data: displayResults,
    timestamp: Date.now(),
  }));

  const { updatePreviouslyRecommendedTitles } = await import('./userService');
  const newTitles = aiRecs.map(rec => rec.title);
  await updatePreviouslyRecommendedTitles(userId, newTitles);

  return {
    aiRecommendations: displayResults,
    lastAiHistoryLength: watchedHistory.length,
  };
};

// Lấy phim thịnh hành làm dự phòng.
export const fetchTrendingFallback = async (): Promise<TMDBMovieResult[]> => {
  const trendingData = await getTrendingMovies();
  return trendingData.results;
};
