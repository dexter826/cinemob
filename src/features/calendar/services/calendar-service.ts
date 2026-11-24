import { Movie, TMDBEpisode, UpcomingEpisode } from '@/types';
import {
  getTVSeasonEpisodes,
  getMovieDetailsWithLanguage,
  withLimit,
} from '@/features/search/services/tmdb';

const CACHE_KEY_PREFIX = 'calendar_seasons_v1_';
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const FETCH_CONCURRENCY = 8;

interface SeasonCacheEntry {
  fetchedAt: number;
  /** Mùa đã phát hết mọi tập: ngày phát không đổi nữa, cache không còn hạn. */
  sealed: boolean;
  /** Tên tiếng Việt tra từ TMDB khi doc thiếu title_vi, tránh gọi lại mỗi lần mở lịch. */
  nameVi?: string;
}

/** TMDBEpisode bỏ overview — calendar không dùng và overview là phần lớn nhất. */
type CachedEpisode = Omit<TMDBEpisode, 'overview'>;

interface SeasonCacheWithEpisodes extends SeasonCacheEntry {
  episodes: CachedEpisode[];
}

type SeasonCache = Record<string, SeasonCacheWithEpisodes>;

/** Series tham gia lịch phát sóng: bỏ hủy theo dõi (dropped) và tắt thông báo. */
export const isCalendarSeries = (movie: Movie): movie is Extract<Movie, { media_type: 'tv' }> =>
  movie.media_type === 'tv' &&
  movie.source === 'tmdb' &&
  movie.status !== 'dropped' &&
  !movie.notifications_muted;

const localISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const readSeasonCache = (userId: string): SeasonCache => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CACHE_KEY_PREFIX + userId) ?? 'null');
    return parsed && typeof parsed === 'object' ? (parsed as SeasonCache) : {};
  } catch {
    return {};
  }
};

const writeSeasonCache = (userId: string, cache: SeasonCache) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + userId, JSON.stringify(cache));
  } catch {
    // Storage bị chặn hoặc hết dung lượng: lịch vẫn chạy chỉ là không cache.
  }
};

/** Mọi tập của mùa đã có ngày phát trong quá khứ thì mùa bất biến. */
const computeSealed = (episodes: { air_date: string }[], today: string): boolean => {
  const maxAirDate = episodes
    .map((episode) => episode.air_date)
    .filter(Boolean)
    .reduce<string | null>((max, date) => (max === null || date > max ? date : max), null);
  return maxAirDate !== null && maxAirDate < today;
};

export interface CalendarFetchResult {
  episodes: UpcomingEpisode[];
  /** Số series không tải được lần này (phần đã có cache cũ vẫn được dùng). */
  failedCount: number;
}

export const fetchEpisodesForMonth = async (
  userId: string,
  movies: Movie[],
  monthKey: string,
): Promise<CalendarFetchResult> => {
  const activeSeries = movies.filter(isCalendarSeries);
  if (activeSeries.length === 0) return { episodes: [], failedCount: 0 };

  const cache = readSeasonCache(userId);
  const today = localISODate(new Date());
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = `${monthKey}-01`;
  const endDate = `${monthKey}-${new Date(year, month, 0).getDate()}`;

  // Key cache là tvId + mùa: cùng một series có thể track nhiều mùa cùng lúc.
  const cacheKeyOf = (series: Extract<Movie, { media_type: 'tv' }>): string =>
    `${series.id}:${series.season}`;

  const needFetch = new Map<string, Extract<Movie, { media_type: 'tv' }>>();
  for (const series of activeSeries) {
    const entry = cache[cacheKeyOf(series)];
    if (!entry || (!entry.sealed && Date.now() - entry.fetchedAt > CACHE_DURATION)) {
      needFetch.set(cacheKeyOf(series), series);
    }
  }

  const failedIds = new Set(needFetch.keys());
  if (needFetch.size > 0) {
    const fetchIds = Array.from(needFetch.keys());
    const results = await withLimit(
      Array.from(needFetch.values()).map((series) => async () => {
        const tvId = Number(series.id);
        const episodes = await getTVSeasonEpisodes(tvId, series.season);
        let nameVi = series.title_vi ?? cache[cacheKeyOf(series)]?.nameVi;
        if (!nameVi) {
          try {
            nameVi = (await getMovieDetailsWithLanguage(tvId, 'tv', 'vi-VN'))?.name;
          } catch {
            // Tên dịch không ảnh hưởng đến dữ liệu lịch phát sóng.
          }
        }
        return {
          fetchedAt: Date.now(),
          sealed: computeSealed(episodes, today),
          nameVi,
          episodes: episodes.map(({ overview: _overview, ...episode }) => episode),
        };
      }),
      FETCH_CONCURRENCY,
    );
    results.forEach((result, index) => {
      if (result) {
        const seriesId = fetchIds[index];
        cache[seriesId] = result;
        failedIds.delete(seriesId);
      }
    });
    // Chỉ giữ cache của series đang tham gia lịch để storage không phình vì doc đã xoá.
    const pruned: SeasonCache = {};
    for (const series of activeSeries) {
      const entry = cache[cacheKeyOf(series)];
      if (entry) pruned[cacheKeyOf(series)] = entry;
    }
    writeSeasonCache(userId, pruned);
  }

  const episodes: UpcomingEpisode[] = [];
  let failedCount = 0;
  for (const series of activeSeries) {
    const entry = cache[cacheKeyOf(series)];
    if (!entry || failedIds.has(cacheKeyOf(series))) {
      failedCount++;
      continue;
    }
    for (const episode of entry.episodes) {
      if (episode.air_date >= startDate && episode.air_date <= endDate) {
        episodes.push({
          seriesId: Number(series.id),
          seriesName: series.title,
          seriesNameVi: entry.nameVi ?? series.title_vi,
          posterPath: series.poster_path,
          episode: { ...episode, overview: '' },
          docId: series.docId,
        });
      }
    }
  }
  episodes.sort((a, b) => a.episode.air_date.localeCompare(b.episode.air_date));

  return { episodes, failedCount };
};
