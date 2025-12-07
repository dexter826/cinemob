import { Movie, TMDBMovieResult } from '../types';

export const getDisplayTitle = (movie: Movie): string => {
  // For Vietnamese productions, show only Vietnamese title if available
  if (movie.country && (movie.country.includes('Vietnam') || movie.country.includes('VN')) && movie.title_vi) {
    return movie.title_vi;
  }
  // For other movies, show original title (Vietnamese title) if different
  if (movie.title_vi && movie.title_vi !== movie.title) {
    return `${movie.title_vi} (${movie.title})`;
  }
  return movie.title;
};

export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const title = movie.title || movie.name || '';
  const englishTitle = movie.english_title || '';
  // Check if title contains Vietnamese diacritics
  const hasVietnameseDiacritics = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(title);
  if (title && englishTitle && title !== englishTitle && hasVietnameseDiacritics) {
    return `${title} (${englishTitle})`;
  }
  // If no Vietnamese title or title is not Vietnamese, show English title
  return englishTitle || title;
};