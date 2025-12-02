import React, { useState, useMemo, useEffect } from 'react';
import { X, Download, FileSpreadsheet, Loader2, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../../types';
import { exportToExcel, ExportFilters } from '../../services/exportService';
import useToastStore from '../../stores/toastStore';
import { Timestamp } from 'firebase/firestore';
import CustomDropdown from '../ui/CustomDropdown';
import { usePreventScroll } from '../../hooks/usePreventScroll';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, movies }) => {
  const { showToast } = useToastStore();

  // Prevent body scroll when modal is open
  usePreventScroll(isOpen);

  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<ExportFilters>({
    rating: null,
    year: null,
    country: '',
    contentType: 'all',
    status: 'all'
  });

  // Get unique years and countries for filter options
  const filterOptions = useMemo(() => {
    const years = Array.from(new Set(
      movies.map(m => {
        const d = m.watched_at instanceof Timestamp ? m.watched_at.toDate() : (m.watched_at as Date);
        return d ? d.getFullYear() : null;
      }).filter(Boolean)
    )).sort((a, b) => (b as number) - (a as number));

    const countries = Array.from(new Set(
      movies
        .filter(m => m.country && m.country.trim().length > 0)
        .flatMap(m => m.country!.split(',').map(c => c.trim()))
        .filter(c => c.length > 0)
    )).sort();

    return { years, countries };
  }, [movies]);

  const handleExport = async () => {
    if (movies.length === 0) {
      showToast('Không có dữ liệu để xuất', 'error');
      return;
    }

    setIsExporting(true);
    try {
      await exportToExcel(movies, filters);
      showToast('Đã xuất file Excel thành công', 'success');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      showToast(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất dữ liệu', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = useMemo(() => {
    // Simple count based on filters (similar to filterMoviesForExport logic)
    let count = movies.length;

    if (filters.rating !== null && filters.rating !== undefined) {
      count = movies.filter(movie => (movie.rating || 0) >= filters.rating!).length;
    }

    if (filters.year !== null && filters.year !== undefined) {
      count = movies.filter(movie => {
        const date = movie.watched_at instanceof Timestamp ? movie.watched_at.toDate() : (movie.watched_at as Date);
        return date && date.getFullYear() === filters.year;
      }).length;
    }

    if (filters.country) {
      count = movies.filter(movie => movie.country && movie.country.toLowerCase().includes(filters.country!.toLowerCase())).length;
    }

    if (filters.contentType && filters.contentType !== 'all') {
      count = movies.filter(movie => {
        const mediaType = movie.media_type || 'movie';
        return mediaType === filters.contentType;
      }).length;
    }

    if (filters.status && filters.status !== 'all') {
      count = movies.filter(movie => (movie.status || 'history') === filters.status).length;
    }

    return count;
  }, [movies, filters]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 bg-surface/95 backdrop-blur">
          <h2 className="text-xl font-bold text-text-main">Xuất dữ liệu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            disabled={isExporting}
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-text-muted" />
              <label className="text-sm font-medium text-text-muted">Bộ lọc dữ liệu</label>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Trạng thái</label>
              <CustomDropdown
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'history', label: 'Đã xem' },
                  { value: 'watchlist', label: 'Sẽ xem' },
                ]}
                value={filters.status || 'all'}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value as 'all' | 'history' | 'watchlist' }))}
                placeholder="Chọn trạng thái"
              />
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Loại nội dung</label>
              <CustomDropdown
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'movie', label: 'Phim' },
                  { value: 'tv', label: 'TV Series' },
                ]}
                value={filters.contentType || 'all'}
                onChange={(value) => setFilters(prev => ({ ...prev, contentType: value as 'all' | 'movie' | 'tv' }))}
                placeholder="Chọn loại"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Đánh giá tối thiểu</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFilters(prev => ({ ...prev, rating: prev.rating === star ? null : star }))}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${(filters.rating || 0) >= star ? 'text-yellow-500 bg-yellow-500/10' : 'text-text-muted bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                  >
                    <Star size={16} fill={(filters.rating || 0) >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Năm xem</label>
              <CustomDropdown
                options={[
                  { value: '', label: 'Tất cả các năm' },
                  ...filterOptions.years.map(year => ({ value: year as number, label: year.toString() })),
                ]}
                value={filters.year || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, year: value === '' ? null : Number(value) }))}
                placeholder="Chọn năm"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Quốc gia</label>
              <CustomDropdown
                options={[
                  { value: '', label: 'Tất cả quốc gia' },
                  ...filterOptions.countries.map(country => ({ value: country, label: country })),
                ]}
                value={filters.country || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, country: value as string }))}
                placeholder="Chọn quốc gia"
                searchable={true}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
            <div className="text-sm text-text-muted">
              Sẽ xuất <span className="font-medium text-primary">{filteredCount}</span> phim
              {filteredCount !== movies.length && (
                <span> (từ tổng số {movies.length})</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              disabled={isExporting}
            >
              Hủy
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || filteredCount === 0}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Xuất Excel
                </>
              )}
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;