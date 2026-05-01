import { Movie, TMDBMovieResult } from '../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';
import { translateCountries } from '../constants/countries';
import { GENRE_TRANSLATIONS } from '../constants/genres';

// Ưu tiên tiêu đề Tiếng Việt.
export const getMainTitle = (movie: Movie): string => {
  const country = movie.country || '';
  const isVN = ['Vietnam', 'Việt Nam', 'VN'].some(c => country.includes(c));
  return isVN && movie.title_vi ? movie.title_vi : (movie.title_vi || movie.title);
};

// Lấy tên gốc của phim.
export const getSubTitle = (movie: Movie): string => {
  const country = movie.country || '';
  const isVN = ['Vietnam', 'Việt Nam', 'VN'].some(c => country.includes(c));
  const mainTitle = getMainTitle(movie);
  
  if (!isVN && movie.title_vi && movie.title_vi !== movie.title) {
    return movie.title;
  }
  
  if (movie.title_vi && movie.title_vi !== movie.title && mainTitle !== movie.title) {
    return movie.title;
  }
  
  return '';
};

// Tiêu đề kết hợp (Chính + Phụ).
export const getDisplayTitle = (movie: Movie): string => {
  const main = getMainTitle(movie);
  const sub = getSubTitle(movie);
  return sub ? `${main} (${sub})` : main;
};

// Lấy tiêu đề chính cho TMDB.
export const getMainTitleForTMDB = (movie: TMDBMovieResult): string => {
  return movie.title || movie.name || movie.original_title || movie.original_name || '';
};

// Lấy tiêu đề phụ cho TMDB.
export const getSubTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const original = movie.original_title || movie.original_name || '';
  return (original && original !== main) ? original : '';
};

// Lấy tiêu đề hiển thị chuẩn cho TMDB.
export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const sub = getSubTitleForTMDB(movie);
  const hasVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(main);
  
  if (sub && hasVietnamese) return `${main} (${sub})`;
  return main || sub;
};

// Chuẩn hóa sang đối tượng Date.
export const normalizeMovieDate = (date: any): Date | null => {
  if (!date) return null;
  if (typeof date.toDate === 'function') return date.toDate();
  if (date instanceof Date) return date;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};

// Định dạng dd/mm/yyyy.
export const formatMovieDate = (date: any): string => {
  const normalized = normalizeMovieDate(date);
  if (!normalized) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(normalized);
};

// Lấy URL ảnh đầy đủ từ TMDB.
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${TMDB_IMAGE_BASE_URL.replace('w500', size)}${path}`;
};

// Dịch tên quốc gia sang Tiếng Việt.
export const getTranslatedCountries = (countryStr: string): string => {
  return translateCountries(countryStr);
};

// Dịch danh sách thể loại sang Tiếng Việt.
export const getTranslatedGenres = (genreStr: string): string => {
  if (!genreStr) return '';
  return genreStr
    .split(',')
    .map(g => {
      const trimmed = g.trim();
      return GENRE_TRANSLATIONS[trimmed] || trimmed;
    })
    .join(', ');
};
