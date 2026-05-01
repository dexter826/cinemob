import { Movie, TMDBMovieResult } from '../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';
import { translateCountries } from '../constants/countries';

/** Lấy tiêu đề chính ưu tiên Tiếng Việt. */
export const getMainTitle = (movie: Movie): string => {
  const country = movie.country || '';
  const isVN = ['Vietnam', 'Việt Nam', 'VN'].some(c => country.includes(c));
  return isVN && movie.title_vi ? movie.title_vi : (movie.title_vi || movie.title);
};

/** Lấy tiêu đề phụ (tên gốc). */
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

/** Lấy tiêu đề hiển thị kết hợp (Dùng cho các nơi cần 1 chuỗi duy nhất). */
export const getDisplayTitle = (movie: Movie): string => {
  const main = getMainTitle(movie);
  const sub = getSubTitle(movie);
  return sub ? `${main} (${sub})` : main;
};

/** Lấy tiêu đề chính cho TMDB (Ưu tiên tên đã dịch). */
export const getMainTitleForTMDB = (movie: TMDBMovieResult): string => {
  return movie.title || movie.name || movie.original_title || movie.original_name || '';
};

/** Lấy tiêu đề phụ cho TMDB (Tên gốc nếu khác tên chính). */
export const getSubTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const original = movie.original_title || movie.original_name || '';
  return (original && original !== main) ? original : '';
};

/** Lấy tiêu đề hiển thị chuẩn cho dữ liệu từ TMDB. */
export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const main = getMainTitleForTMDB(movie);
  const sub = getSubTitleForTMDB(movie);
  const hasVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(main);
  
  if (sub && hasVietnamese) return `${main} (${sub})`;
  return main || sub;
};

/** Chuyển đổi định dạng ngày tháng về Date object chuẩn. */
export const normalizeMovieDate = (date: any): Date | null => {
  if (!date) return null;
  if (typeof date.toDate === 'function') return date.toDate();
  if (date instanceof Date) return date;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};

/** Định dạng ngày chuẩn Việt Nam. */
export const formatMovieDate = (date: any): string => {
  const normalized = normalizeMovieDate(date);
  if (!normalized) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(normalized);
};

/** Lấy URL ảnh đầy đủ từ TMDB. */
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${TMDB_IMAGE_BASE_URL.replace('w500', size)}${path}`;
};

/** Dịch tên quốc gia sang Tiếng Việt. */
export const getTranslatedCountries = (countryStr: string): string => {
  return translateCountries(countryStr);
};
