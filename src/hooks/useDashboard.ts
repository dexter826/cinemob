import { useState, useEffect, useMemo, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Movie, Stats } from '../types';
import { deleteMovie } from '../services/movieService';
import { normalizeMovieDate } from '../utils/movieUtils';
import useMovieStore from '../stores/movieStore';
import useToastStore from '../stores/toastStore';
import useAlertStore from '../stores/alertStore';
import useAddMovieStore from '../stores/addMovieStore';
import useMovieDetailStore from '../stores/movieDetailStore';
import useExportStore from '../stores/exportStore';
import useInitialLoadStore from '../stores/initialLoadStore';

export type SortOption = 'date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'history' | 'watchlist';

/** Logic và dữ liệu cho Dashboard. */
export const useDashboard = (user: any) => {
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const { openAddModal } = useAddMovieStore();
  const { openDetailModal } = useMovieDetailStore();
  const { setMovies: setExportMovies } = useExportStore();
  const { markInitialLoadComplete } = useInitialLoadStore();
  
  const { movies, loading } = useMovieStore();

  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterContentType, setFilterContentType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterWatchStatus, setFilterWatchStatus] = useState<'all' | 'watching' | 'completed'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 18;
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    setExportMovies(movies);
  }, [movies, setExportMovies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRating, filterYear, filterCountry, filterContentType, filterWatchStatus, sortBy, sortOrder, activeTab]);

  const historyMovies = useMemo(() => movies.filter(m => (m.status || 'history') === 'history'), [movies]);
  const watchlistMovies = useMemo(() => movies.filter(m => m.status === 'watchlist'), [movies]);
  const currentTabMovies = activeTab === 'history' ? historyMovies : watchlistMovies;

  const stats: Stats = useMemo(() => {
    const totalMovies = currentTabMovies.length;
    const totalMinutes = currentTabMovies.reduce((acc, curr) => acc + (curr.runtime || 0), 0);

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    return { totalMovies, totalMinutes, days, hours, minutes };
  }, [currentTabMovies]);

  const contentTypeStats = useMemo(() => {
    const moviesCount = currentTabMovies.filter(m => m.media_type === 'movie' || !m.media_type).length;
    const tvCount = currentTabMovies.filter(m => m.media_type === 'tv').length;
    return { moviesCount, tvCount };
  }, [currentTabMovies]);

  const processedMovies = useMemo(() => {
    let result = [...currentTabMovies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(q) || 
        (movie.title_vi && movie.title_vi.toLowerCase().includes(q))
      );
    }

    if (filterRating !== null) {
      result = result.filter(movie => (movie.rating || 0) >= filterRating);
    }

    if (filterYear !== null) {
      result = result.filter(movie => {
        const date = normalizeMovieDate(movie.watched_at);
        return date && date.getFullYear() === filterYear;
      });
    }

    if (filterCountry) {
      const q = filterCountry.toLowerCase();
      result = result.filter(movie => movie.country && movie.country.toLowerCase().includes(q));
    }

    if (filterContentType !== 'all') {
      result = result.filter(movie => (movie.media_type || 'movie') === filterContentType);
    }

    if (activeTab === 'history' && filterWatchStatus !== 'all') {
      result = result.filter(movie => {
        if (filterWatchStatus === 'watching') {
          return movie.media_type === 'tv' && movie.progress && !movie.progress.is_completed;
        } else if (filterWatchStatus === 'completed') {
          return movie.media_type === 'movie' || !movie.media_type || (movie.progress && movie.progress.is_completed);
        }
        return true;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        const dateA = normalizeMovieDate(a.watched_at)?.getTime() || 0;
        const dateB = normalizeMovieDate(b.watched_at)?.getTime() || 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [currentTabMovies, searchQuery, filterRating, filterYear, filterCountry, filterContentType, filterWatchStatus, sortBy, sortOrder, activeTab]);

  const totalPages = Math.ceil(processedMovies.length / moviesPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * moviesPerPage;
    return processedMovies.slice(startIndex, startIndex + moviesPerPage);
  }, [processedMovies, currentPage, moviesPerPage]);

/** Xóa phim. */
  const handleDelete = async (docId: string) => {
    showAlert({
      title: "Xóa phim",
      message: "Bạn có chắc chắn muốn xóa phim này khỏi lịch sử của mình không? Hành động này không thể hoàn tác.",
      type: "danger",
      confirmText: "Xóa",
      onConfirm: async () => {
        try {
          await deleteMovie(docId);
          showToast("Đã xóa phim", "success");
        } catch (e) {
          showToast("Xóa phim thất bại", "error");
        }
      }
    });
  };

/** Mở modal sửa phim. */
  const handleEdit = (movie: Movie) => {
    openAddModal({ movieToEdit: movie });
  };

/** Đánh dấu đã xem. */
  const handleMarkAsWatched = (movie: Movie) => {
    const now = new Date();
    const existingDate = movie.watched_at instanceof Timestamp
      ? movie.watched_at.toDate()
      : (movie.watched_at as Date | undefined);

    openAddModal({
      movieToEdit: {
        ...movie,
        status: 'history',
        watched_at: existingDate || now,
      },
    });
  };

/** Reset bộ lọc. */
  const clearFilters = () => {
    setFilterRating(null);
    setFilterYear(null);
    setFilterCountry('');
    setFilterContentType('all');
    setFilterWatchStatus('all');
  };

  return {
    movies,
    loading,
    stats,
    contentTypeStats,
    processedMovies: paginatedMovies,
    allProcessedMoviesCount: processedMovies.length,
    totalPages,
    currentPage,
    setCurrentPage,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    filterRating,
    setFilterRating,
    filterYear,
    setFilterYear,
    filterCountry,
    setFilterCountry,
    filterContentType,
    setFilterContentType,
    filterWatchStatus,
    setFilterWatchStatus,
    showFilters,
    setShowFilters,
    filterRef,
    handleDelete,
    handleEdit,
    handleMarkAsWatched,
    handleMovieClick: openDetailModal,
    toggleSortOrder: () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'),
    clearFilters
  };
};
