import { Movie, MovieStatus } from '@/types';
import { translateCountries } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import { normalizeDate } from '@/shared/utils/date-format';

const isVietnameseOrigin = (country: string): boolean =>
  ['Vietnam', 'Việt Nam', 'VN'].some((c) => country.includes(c));

export const isWatchedMovie = (movie: Movie): boolean => (movie.status || 'history') === 'history';

/**
 * Trạng thái sau khi áp dụng quy tắc lưu: đánh dấu hoàn thành một phim đã bỏ dở
 * thì phim quay lại "Đã xem".
 */
export const resolveMovieStatus = (
  status: MovieStatus,
  isTVSeries: boolean,
  isCompleted: boolean,
): MovieStatus => (status === 'dropped' && isTVSeries && isCompleted ? 'history' : status);

export const getMainTitle = (movie: Movie): string => {
  const isVN = isVietnameseOrigin(movie.country || '');
  return isVN && movie.title_vi ? movie.title_vi : movie.title_vi || movie.title;
};

export const getSubTitle = (movie: Movie): string => {
  const isVN = isVietnameseOrigin(movie.country || '');
  const mainTitle = getMainTitle(movie);

  if (!isVN && movie.title_vi && movie.title_vi !== movie.title) {
    return movie.title;
  }

  if (movie.title_vi && movie.title_vi !== movie.title && mainTitle !== movie.title) {
    return movie.title;
  }

  return '';
};

export const getDisplayTitle = (movie: Movie): string => {
  const main = getMainTitle(movie);
  const sub = getSubTitle(movie);
  return sub ? `${main} (${sub})` : main;
};

export const getTranslatedCountries = (countryStr: string): string => {
  return translateCountries(countryStr);
};

export const getTranslatedGenres = (genreStr: string): string => {
  if (!genreStr) return '';
  return genreStr
    .split(',')
    .map((g) => {
      const trimmed = g.trim();
      return GENRE_TRANSLATIONS[trimmed] || trimmed;
    })
    .join(', ');
};

export const getSeasonWatchedDates = (movie: Movie): Array<{ season: number; date: Date }> => {
  const seasonDates = movie.progress?.season_dates;
  if (!seasonDates) return [];
  return Object.entries(seasonDates)
    .map(([season, iso]) => {
      const [y, m, d] = iso.split('-').map(Number);
      return y && m && d ? { season: Number(season), date: new Date(y, m - 1, d) } : null;
    })
    .filter((s): s is { season: number; date: Date } => s !== null && Number.isFinite(s.season))
    .sort((a, b) => a.season - b.season);
};

export const getLatestWatchedDate = (movie: Movie): Date | null => {
  let latest = normalizeDate(movie.watched_at);
  for (const { date } of getSeasonWatchedDates(movie)) {
    if (!latest || date.getTime() > latest.getTime()) latest = date;
  }
  return latest;
};

// Mọi mốc xem của một phim: lần xem gần nhất cộng từng mốc mùa của series.
export const getWatchedDates = (movie: Movie): Date[] => {
  const dates: Date[] = [];
  const watched = normalizeDate(movie.watched_at);
  if (watched) dates.push(watched);
  getSeasonWatchedDates(movie).forEach(({ date }) => dates.push(date));
  return dates;
};
