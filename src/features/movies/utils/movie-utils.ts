import { Movie, MovieStatus } from '@/types';
import { translateCountries } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';

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
  id: number | string,
  mediaType?: 'movie' | 'tv',
  season?: number,
): string =>
  `/movie/${id}${mediaType === 'tv' ? `?type=tv${typeof season === 'number' ? `&season=${season}` : ''}` : ''}`;

export interface SeriesInfo {
  trackedSeasons: number[];
  totalSeasons: number;
  nextMissingSeason: number | null;
  badge: string | null;
}

/** Gom các doc season của một series để suy ra badge và season thiếu đầu tiên. */
export const getSeriesInfo = (
  movies: Movie[],
  id: string | number,
  mediaType: 'movie' | 'tv' = 'tv',
): SeriesInfo | null => {
  const docs = movies.filter(
    (m) => String(m.id) === String(id) && (m.media_type ?? 'movie') === mediaType,
  );
  if (docs.length === 0) return null;
  const trackedSeasons = [...new Set(docs.map((m) => getSeasonParam(m)).filter((s): s is number => typeof s === 'number'))].sort(
    (a, b) => a - b,
  );
  const totalSeasons = docs.reduce((max, m) => Math.max(max, m.seasons ?? 0), 0);
  const nextMissingSeason =
    totalSeasons > 0
      ? Array.from({ length: totalSeasons }, (_, i) => i + 1).find((n) => !trackedSeasons.includes(n)) ??
        null
      : null;
  const allTracked = totalSeasons > 0 && trackedSeasons.length >= totalSeasons;
  const allCompleted =
    allTracked && docs.every((m) => (m.status || 'history') === 'history' && !!m.progress?.is_completed);
  const anyInProgress = docs.some(
    (m) => (m.status || 'history') === 'history' && !!m.progress && !m.progress.is_completed,
  );
  const badge = allCompleted
    ? 'Đã xem'
    : anyInProgress
      ? 'Đang xem'
      : totalSeasons > 0
        ? `Đã có ${trackedSeasons.length}/${totalSeasons} mùa`
        : null;
  return { trackedSeasons, totalSeasons, nextMissingSeason, badge };
};

interface SeasonLabeled {
  media_type?: 'movie' | 'tv';
  seasons?: number;
  season?: number;
}

export const getSeasonLabel = (movie: SeasonLabeled): string | null =>
  movie.media_type === 'tv' && (movie.seasons ?? 0) >= 2 && movie.season
    ? `Mùa ${movie.season}`
    : null;

export const getSeasonParam = (movie: Movie | undefined): number | undefined =>
  movie?.media_type === 'tv' ? movie.season : undefined;

export const resolveSeasonRuntime = (
  perEpisodeRuntime: number,
  seasonEpisodeCount: number | undefined,
): number => (seasonEpisodeCount ? seasonEpisodeCount * perEpisodeRuntime : perEpisodeRuntime);
