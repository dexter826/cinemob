// Helpers TMDB dùng chung toàn app (tách từ features/movies/utils/movieUtils).
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '@/constants';
import type { TMDBMovieResult } from '@/types';

// Lấy tiêu đề chính cho TMDB.
export const getMainTitleForTMDB = (movie: TMDBMovieResult): string => {
  return movie.title || movie.name || movie.original_title || movie.original_name || '';
};

// Lấy tiêu đề phụ cho TMDB.
export const getSubTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const original = movie.original_title || movie.original_name || '';
  return original && original !== main ? original : '';
};

// Lấy tiêu đề hiển thị chuẩn cho TMDB.
export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const sub = getSubTitleForTMDB(movie);
  const hasVietnamese =
    /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(main);

  if (sub && hasVietnamese) return `${main} (${sub})`;
  return main || sub;
};

// Lấy URL ảnh đầy đủ từ TMDB.
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${TMDB_IMAGE_BASE_URL.replace('w500', size)}${path}`;
};
