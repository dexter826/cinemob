import { TMDBMovieResult, Movie } from '@/types';
import { getAIRecommendations } from './ai-service';
import { searchMovies, getTrendingMovies, withLimit } from '@/features/search/services/tmdb';
import { isWatchedMovie } from '../utils/movie-utils';

const CACHE_DURATION = {
  AI_RECS: 7 * 24 * 60 * 60 * 1000,
} as const;

const AI_RECOMMENDATIONS_LIMIT = 10;
const AI_CANDIDATE_LIMIT = 22;
const AI_CACHE_VERSION = 'v2';

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

// Lấy phim gợi ý từ AI kèm cache.
export const fetchAIRecommendations = async (
  userId: string,
  allMovies: Movie[],
  forceRefresh: boolean = false,
): Promise<{ aiRecommendations: TMDBMovieResult[] } | null> => {
  const watchedHistory = allMovies.filter(isWatchedMovie);

  if (watchedHistory.length < 3) return null;

  const cacheKey = `ai_recs_${AI_CACHE_VERSION}_${userId}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData && !forceRefresh) {
    try {
      const parsedCache: unknown = JSON.parse(cachedData);
      if (
        typeof parsedCache === 'object' &&
        parsedCache !== null &&
        typeof (parsedCache as { timestamp?: unknown }).timestamp === 'number' &&
        !isExpired((parsedCache as { timestamp: number }).timestamp, CACHE_DURATION.AI_RECS) &&
        (parsedCache as { historyLength?: unknown }).historyLength === watchedHistory.length &&
        Array.isArray((parsedCache as { data?: unknown }).data)
      ) {
        return {
          aiRecommendations: (parsedCache as { data: TMDBMovieResult[] }).data,
        };
      }
    } catch (e) {
      try {
        localStorage.removeItem(cacheKey);
      } catch {
        /* bỏ qua */
      }
    }
  }

  const aiRecs = await getAIRecommendations(watchedHistory, allMovies);

  const tasks = aiRecs.slice(0, AI_CANDIDATE_LIMIT).map((rec) => async () => {
    try {
      const yearMatch = rec.title.match(/\((\d{4})\)$/);
      const title = yearMatch ? rec.title.replace(/\s*\(\d{4}\)$/, '') : rec.title;
      const year = yearMatch ? yearMatch[1] : undefined;

      const searchRes = await searchMovies(title, 1, year);
      return searchRes.results.length > 0 ? searchRes.results[0] : null;
    } catch (error) {
      console.error('Failed to search for recommended movie', error);
      return null;
    }
  });

  const tmdbResultsRaw = await withLimit(tasks, 5);

  const savedMovieIds = new Set(allMovies.map((m) => m.id.toString()));
  const tmdbResults = tmdbResultsRaw.filter(
    (m) => m !== null && !savedMovieIds.has(m.id.toString()),
  ) as TMDBMovieResult[];

  const displayResults = tmdbResults.slice(0, AI_RECOMMENDATIONS_LIMIT);

  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        historyLength: watchedHistory.length,
        data: displayResults,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // QuotaExceeded: bỏ qua cache.
  }

  return {
    aiRecommendations: displayResults,
  };
};

// Lấy phim thịnh hành làm dự phòng.
export const fetchTrendingFallback = async (): Promise<TMDBMovieResult[]> => {
  const trendingData = await getTrendingMovies();
  return trendingData.results;
};
