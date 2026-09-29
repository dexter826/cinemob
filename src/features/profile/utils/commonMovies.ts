import type { Movie, ProfileMovie } from '@/types';

// Khớp TMDB id + loại; phim manual không khớp giữa hai tài khoản.
export const getCommonMovieKey = (id: string | number, mediaType?: 'movie' | 'tv'): string =>
  `${String(id)}|${mediaType ?? 'movie'}`;

/** Giao phim đã xem của mình với danh sách phim của đối phương. */
export const getCommonMovies = (
  myMovies: Movie[],
  profileMovies: ProfileMovie[],
): ProfileMovie[] => {
  const watchedKeys = new Set(
    myMovies
      .filter((m) => (m.status || 'history') === 'history')
      .map((m) => getCommonMovieKey(m.id, m.media_type)),
  );
  return profileMovies.filter((m) => watchedKeys.has(getCommonMovieKey(m.id, m.media_type)));
};
