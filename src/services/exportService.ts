import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Movie } from '../types';
import { Timestamp } from 'firebase/firestore';

export interface ExportFilters {
  rating?: number | null;
  year?: number | null;
  country?: string;
  contentType?: 'all' | 'movie' | 'tv';
  status?: 'all' | 'history' | 'watchlist';
}

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


export const exportToExcel = async (movies: Movie[], filters: ExportFilters): Promise<void> => {
  try {
    const filteredMovies = filterMoviesForExport(movies, filters);

    if (filteredMovies.length === 0) {
      throw new Error('Không có dữ liệu để xuất');
    }

    // Prepare data for Excel
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
        'Quốc gia': movie.country || '',
        'Loại': isTV ? 'TV Series' : 'Phim',
        'Trạng thái': movie.status === 'watchlist' ? 'Sẽ xem' : 'Đã xem',
        'Đánh giá chi tiết': movie.review || '',
        'Tagline': movie.tagline || '',
        'Nội dung': movie.content || ''
      };
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phim');

    // Auto-size columns
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

    // Save file
    const fileName = `cinemetrics_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
