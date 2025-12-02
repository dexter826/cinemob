import { Movie, TMDBMovieResult } from '../types';

export const getDisplayTitle = (movie: Movie): string => {
  // For Vietnamese productions, show only Vietnamese title if available
  if (movie.country && (movie.country.includes('Vietnam') || movie.country.includes('VN')) && movie.title_vi) {
    return movie.title_vi;
  }
  // For other movies, show original title (Vietnamese title) if different
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