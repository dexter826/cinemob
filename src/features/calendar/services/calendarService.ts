import { Movie, UpcomingEpisode } from '@/types';
import { getTVShowUpcomingEpisodes, getMovieDetailsWithLanguage, withLimit } from '@/features/search/services/tmdb';

const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_VERSION = 3;

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

export const createCalendarFingerprint = (movies: Movie[]): string => JSON.stringify(
  movies
    .filter(movie => movie.media_type === 'tv' && movie.source === 'tmdb')
    .map(movie => ({
      id: String(movie.id),
      docId: movie.docId ?? '',
      title: movie.title,
      titleVi: movie.title_vi ?? '',
      posterPath: movie.poster_path,
    }))
    .sort((a, b) => a.id.localeCompare(b.id) || a.docId.localeCompare(b.docId)),
);

// Tải lịch chiếu tập mới từ TMDB kèm bộ nhớ tạm.
export const fetchUpcomingEpisodesForMovies = async (
  userId: string,
  movies: Movie[]
): Promise<UpcomingEpisode[]> => {
  const tvSeries = movies.filter(m =>
    m.media_type === 'tv' &&
    m.source === 'tmdb'
  );

  if (tvSeries.length === 0) {
    return [];
  }

  const cacheKey = `upcoming_episodes_v3_${userId}`;
  const fingerprint = createCalendarFingerprint(tvSeries);
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      const parsedCache: unknown = JSON.parse(cachedData);
      if (
        typeof parsedCache === 'object' && parsedCache !== null &&
        (parsedCache as { version?: unknown }).version === CACHE_VERSION &&
        (parsedCache as { fingerprint?: unknown }).fingerprint === fingerprint &&
        typeof (parsedCache as { timestamp?: unknown }).timestamp === 'number' &&
        !isExpired((parsedCache as { timestamp: number }).timestamp, CACHE_DURATION) &&
        Array.isArray((parsedCache as { data?: unknown }).data)
      ) {
        return (parsedCache as { data: UpcomingEpisode[] }).data;
      }
    } catch {
      try { localStorage.removeItem(cacheKey); } catch { /* quota/bị chặn: bỏ qua */ }
    }
  }

  const tasks = tvSeries.map(series => async () => {
    try {
      const tvId = Number(series.id);
      if (!Number.isFinite(tvId)) return [];
      const episodes = await getTVShowUpcomingEpisodes(tvId);

      let seriesNameVi = series.title_vi;
      if (!seriesNameVi) {
        const viDetails = await getMovieDetailsWithLanguage(tvId, 'tv', 'vi-VN');
        seriesNameVi = viDetails?.name;
      }

      const upcomingForSeries: UpcomingEpisode[] = episodes.map(ep => ({
        seriesId: tvId,
        seriesName: series.title,
        seriesNameVi: seriesNameVi,
        posterPath: series.poster_path,
        episode: ep,
        docId: series.docId
      }));

      return upcomingForSeries;
    } catch (error) {
      console.error(`Failed to fetch episodes for seriesId=${series.id}:`, error);
      return [];
    }
  });

  const results = await withLimit(tasks, 5);
  const allUpcoming: UpcomingEpisode[] = [];
  results.forEach(res => {
    if (res) allUpcoming.push(...res);
  });

  allUpcoming.sort((a, b) => new Date(a.episode.air_date).getTime() - new Date(b.episode.air_date).getTime());

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: allUpcoming,
      version: CACHE_VERSION,
      fingerprint,
      timestamp: Date.now()
    }));
  } catch {
    // QuotaExceededError Safari PWA: bỏ qua cache, vẫn trả dữ liệu.
  }

  return allUpcoming;
};
