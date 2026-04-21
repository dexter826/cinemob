import { Movie, TMDBMovieResult } from '../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';

/** Lấy tiêu đề hiển thị kết hợp tên Việt hóa và tên gốc. */
export const getDisplayTitle = (movie: Movie): string => {
  if (movie.country && (movie.country.includes('Vietnam') || movie.country.includes('VN')) && movie.title_vi) {
    return movie.title_vi;
  }
  if (movie.title_vi && movie.title_vi !== movie.title) {
    return `${movie.title_vi} (${movie.title})`;
  }
  return movie.title;
};

/** Lấy tiêu đề hiển thị chuẩn cho dữ liệu từ TMDB. */
export const getDisplayTitleForTMDB = (movie: TMDBMovieResult): string => {
  const title = movie.title || movie.name || '';
  const originalTitle = movie.original_title || movie.original_name || '';
  const hasVietnameseDiacritics = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(title);
  if (title && originalTitle && title !== originalTitle && hasVietnameseDiacritics) {
    return `${title} (${originalTitle})`;
  }
  return title || originalTitle;
};

/** Chuyển đổi mọi định dạng ngày tháng về Date object chuẩn. */
export const normalizeMovieDate = (date: any): Date | null => {
  if (!date) return null;
  if (date.toDate && typeof date.toDate === 'function') return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (date.seconds !== undefined) return new Date(date.seconds * 1000);
  return null;
};

/** Định dạng ngày tháng theo chuẩn vi-VN. */
export const formatMovieDate = (date: any): string => {
  const normalized = normalizeMovieDate(date);
  if (!normalized) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(normalized);
};

/** Lấy URL ảnh đầy đủ từ TMDB. */
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE_URL.replace('w500', size)}${path}`;
};
