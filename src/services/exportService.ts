import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Movie } from '../types';
import { Timestamp } from 'firebase/firestore';
import { getTranslatedCountries } from '../utils/movieUtils';

export interface ExportFilters {
  rating?: number | null;
  year?: number | null;
  country?: string;
  contentType?: 'all' | 'movie' | 'tv';
  status?: 'all' | 'history' | 'watchlist';
}

/** Lọc danh sách phim dựa trên các tiêu chí xuất dữ liệu. */
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


/** Xuất danh sách phim ra file Excel (.xlsx) kèm bộ lọc. */
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
        'Số phần': isTV ? (movie.seasons || '') : '',
        'Thể loại': movie.genres || '',
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
      { wch: 30 }, // Tên phim
      { wch: 10 }, // Năm xem
      { wch: 12 }, // Ngày xem
      { wch: 10 }, // Đánh giá
      { wch: 15 }, // Thời lượng (phút)
      { wch: 10 }, // Số phần
      { wch: 20 }, // Thể loại
      { wch: 15 }, // Quốc gia
      { wch: 12 }, // Loại
      { wch: 10 }, // Trạng thái
      { wch: 30 }, // Đánh giá chi tiết
      { wch: 25 }, // Tagline
      { wch: 40 }  // Nội dung
    ];
    ws['!cols'] = colWidths;

    const fileName = `cinemob_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
