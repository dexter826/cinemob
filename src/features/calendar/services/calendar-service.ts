import { Movie, UpcomingEpisode } from '@/types';
import {
  getTVShowEpisodesInRange,
  getMovieDetailsWithLanguage,
  withLimit,
} from '@/features/search/services/tmdb';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

export const createCalendarFingerprint = (movies: Movie[]): string =>
  JSON.stringify(
    movies
      .filter((movie) => movie.media_type === 'tv' && movie.source === 'tmdb')
      .map((movie) => ({
        id: String(movie.id),
        docId: movie.docId ?? '',
        title: movie.title,
        titleVi: movie.title_vi ?? '',
        posterPath: movie.poster_path,
      }))
      .sort((a, b) => a.id.localeCompare(b.id) || a.docId.localeCompare(b.docId)),
  );

export const fetchEpisodesForMonth = async (
  userId: string,
  movies: Movie[],
  monthKey: string,
  fingerprint: string,
): Promise<UpcomingEpisode[]> => {
  const tvSeries = movies.filter((movie) => movie.media_type === 'tv' && movie.source === 'tmdb');
  if (tvSeries.length === 0) return [];

  const cacheKey = `calendar_month_v1_${userId}_${monthKey}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null') as {
      fingerprint?: string;
      timestamp?: number;
      data?: UpcomingEpisode[];
    } | null;
    if (
      cached?.fingerprint === fingerprint &&
      typeof cached.timestamp === 'number' &&
      !isExpired(cached.timestamp, CACHE_DURATION) &&
      Array.isArray(cached.data)
    ) {
      return cached.data;
    }
  } catch {
    // Cache lỗi hoặc storage bị chặn: tiếp tục tải từ TMDB.
  }

  const [year, month] = monthKey.split('-').map(Number);
  const startDate = `${monthKey}-01`;
  const endDate = `${monthKey}-${new Date(year, month, 0).getDate()}`;
  const results = await withLimit(
    tvSeries.map((series) => async () => {
      const tvId = Number(series.id);
      if (!Number.isFinite(tvId)) throw new Error('Series không có TMDB ID hợp lệ');
      const episodes = await getTVShowEpisodesInRange(tvId, startDate, endDate);
      let seriesNameVi = series.title_vi;
      if (!seriesNameVi) {
        try {
          seriesNameVi = (await getMovieDetailsWithLanguage(tvId, 'tv', 'vi-VN'))?.name;
        } catch {
          // Tên dịch không ảnh hưởng đến dữ liệu lịch phát sóng.
        }
      }
      return episodes.map((episode) => ({
        seriesId: tvId,
        seriesName: series.title,
        seriesNameVi,
        posterPath: series.poster_path,
        episode,
        docId: series.docId,
      }));
    }),
    2,
  );
  if (results.some((result) => result === null)) {
    throw new Error('Không tải được đủ lịch phát sóng. Thử lại.');
  }
  const episodes = results
    .flatMap((result) => result ?? [])
    .sort((a, b) => a.episode.air_date.localeCompare(b.episode.air_date));
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ fingerprint, timestamp: Date.now(), data: episodes }),
    );
  } catch {
    // Storage bị chặn hoặc hết dung lượng: vẫn trả dữ liệu đã tải.
  }
  return episodes;
};
