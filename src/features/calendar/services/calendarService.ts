import { Movie, UpcomingEpisode } from '@/types';
import { getTVShowUpcomingEpisodes, getMovieDetailsWithLanguage, withLimit } from '@/services/tmdb';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

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

  const cacheKey = `upcoming_episodes_v2_${userId}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      const parsedCache = JSON.parse(cachedData);
      if (
        parsedCache.timestamp &&
        !isExpired(parsedCache.timestamp, CACHE_DURATION) &&
        parsedCache.data
      ) {
        return parsedCache.data;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const tasks = tvSeries.map(series => async () => {
    try {
      const tvId = Number(series.id);
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
      console.error(`Failed to fetch episodes for ${series.title}:`, error);
      return [];
    }
  });

  const results = await withLimit(tasks, 5);
  const allUpcoming: UpcomingEpisode[] = [];
  results.forEach(res => {
    if (res) allUpcoming.push(...res);
  });

  allUpcoming.sort((a, b) => new Date(a.episode.air_date).getTime() - new Date(b.episode.air_date).getTime());

  localStorage.setItem(cacheKey, JSON.stringify({
    data: allUpcoming,
    timestamp: Date.now()
  }));

  return allUpcoming;
};
