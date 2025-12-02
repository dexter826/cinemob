import { Movie, TMDBMovieResult } from '../types';

export const getDisplayTitle = (movie: Movie): string => {
  if (movie.title_vi && movie.title_vi !== movie.title) {
    return `${movie.title} (${movie.title_vi})`;
  }
  return movie.title;
};

export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const title = movie.title || movie.name || '';
  const originalTitle = movie.original_title || movie.original_name || '';
  if (title && originalTitle && title !== originalTitle) {
    return `${originalTitle} (${title})`;
  }
  return title;
};