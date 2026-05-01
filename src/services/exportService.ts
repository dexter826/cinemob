import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Movie } from '../types';
import { Timestamp } from 'firebase/firestore';
import { getTranslatedCountries, getTranslatedGenres } from '../utils/movieUtils';

export interface ExportFilters {
  rating?: number | null;
  year?: number | null;
  country?: string;
  contentType?: 'all' | 'movie' | 'tv';
  status?: 'all' | 'history' | 'watchlist';
}

// Lọc phim theo tiêu chí xuất dữ liệu.
export const filterMoviesForExport = (movies: Movie[], filters: ExportFilters): Movie[] => {
  let result = [...movies];

  if (filters.rating !== null && filters.rating !== undefined) {
    result = result.filter(movie => (movie.rating || 0) >= filters.rating!);
  }

  if (filters.year !== null && filters.year !== undefined) {
    result = result.filter(movie => {
      const date = movie.watched_at instanceof Timestamp ? movie.watched_at.toDate() : (movie.watched_at as Date);
      return date && date.getFullYear() === filters.year;
    });
  }

  if (filters.country) {
    result = result.filter(movie => movie.country && movie.country.toLowerCase().includes(filters.country!.toLowerCase()));
  }

  if (filters.contentType && filters.contentType !== 'all') {
    result = result.filter(movie => {
      const mediaType = movie.media_type || 'movie';
      return mediaType === filters.contentType;
    });
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter(movie => (movie.status || 'history') === filters.status);
  }

  return result;
};


// Xuất danh sách phim ra Excel.
export const exportToExcel = async (movies: Movie[], filters: ExportFilters): Promise<void> => {
  try {
    const filteredMovies = filterMoviesForExport(movies, filters);

    if (filteredMovies.length === 0) {
      throw new Error('Không có dữ liệu để xuất');
    }

    const excelData = filteredMovies.map(movie => {
      const watchedDate = movie.watched_at instanceof Timestamp ? movie.watched_at.toDate() : (movie.watched_at as Date);
      const isTV = movie.media_type === 'tv';
      return {
        'Tên phim': movie.title,
        'Năm xem': watchedDate ? watchedDate.getFullYear() : '',
        'Ngày xem': watchedDate ? watchedDate.toLocaleDateString('vi-VN') : '',
        'Đánh giá': movie.rating || '',
        'Thời lượng (phút)': isTV ? '' : (movie.runtime || ''),
        'Số mùa': isTV ? (movie.seasons || '') : '',
        'Thể loại': getTranslatedGenres(movie.genres || ''),
        'Quốc gia': getTranslatedCountries(movie.country || ''),
        'Loại': isTV ? 'TV Series' : 'Phim',
        'Trạng thái': movie.status === 'watchlist' ? 'Sẽ xem' : 'Đã xem',
        'Đánh giá chi tiết': movie.review || '',
        'Tagline': movie.tagline || '',
        'Nội dung': movie.content || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phim');

    const colWidths = [
      { wch: 30 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 30 },
      { wch: 25 },
      { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    const fileName = `cinemob_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
