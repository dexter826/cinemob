import { Movie, MovieStatus } from '@/types';
import { translateCountries } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import { normalizeDate } from '@/shared/utils/date-format';

const isVietnameseOrigin = (country: string): boolean =>
  ['Vietnam', 'Việt Nam', 'VN'].some((c) => country.includes(c));

export const isWatchedMovie = (movie: Movie): boolean => (movie.status || 'history') === 'history';

export const isSeriesInProgress = (movie: Movie): boolean =>
  movie.media_type === 'tv' && !!movie.progress && !movie.progress.is_completed;

export const findLibraryEntry = (
  movies: Movie[],
  id: string | number,
  mediaType?: 'movie' | 'tv',
): Movie | undefined =>
  movies.find(
    (m) => String(m.id) === String(id) && (!mediaType || (m.media_type ?? 'movie') === mediaType),
  );

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

export const buildMoviePath = (
  id: number | string | undefined,
  mediaType?: 'movie' | 'tv',
  season?: number,
): string => `/movie/${id}${mediaType === 'tv' ? `?type=tv&season=${season ?? 1}` : ''}`;

export const getSeasonLabel = (movie: Movie): string | null =>
  movie.media_type === 'tv' && (movie.seasons ?? 0) >= 2 && movie.season
    ? `Mùa ${movie.season}`
    : null;

export const getLatestWatchedDate = (movie: Movie): Date | null => normalizeDate(movie.watched_at);

export const getWatchedDates = (movie: Movie): Date[] => {
  const watched = normalizeDate(movie.watched_at);
  return watched ? [watched] : [];
};
