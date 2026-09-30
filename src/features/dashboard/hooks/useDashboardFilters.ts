import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Movie } from '@/types';
import { normalizeMovieDate, getTranslatedCountries } from '@/features/movies/utils/movieUtils';

export type SortOption = 'date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'history' | 'watchlist';
export type SourceType = 'all' | 'normal' | 'review';

export interface FilterState {
  sortBy: SortOption;
  sortOrder: SortOrder;
  searchQuery: string;
  ratingRange: [number, number] | null;
  year: number | null;
  country: string;
  contentType: 'all' | 'movie' | 'tv';
  watchStatus: 'all' | 'watching' | 'completed';
  sourceType: SourceType;
}

export type FilterUpdateFn = <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;

const INITIAL_FILTER_STATE: FilterState = {
  sortBy: 'date',
  sortOrder: 'desc',
  searchQuery: '',
  ratingRange: null,
  year: null,
  country: '',
  contentType: 'all',
  watchStatus: 'all',
  sourceType: 'all',
};

const MOVIES_PER_PAGE = 20;

// Xử lý lọc và sắp xếp danh sách phim.
export const useDashboardFilters = (movies: Movie[], activeTab: ActiveTab) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo bộ lọc và trang từ URL để deep-link được trạng thái thư viện.
  const [filters, setFilters] = useState<FilterState>(() => {
    const sortBy = searchParams.get('sort');
    const order = searchParams.get('order');
    const contentType = searchParams.get('type');
    const watchStatus = searchParams.get('status');
    const sourceType = searchParams.get('source');
    const rating = searchParams.get('rating')?.split('-').map(Number) ?? [];
    const ratingRange =
      rating.length === 2 && rating.every((value) => Number.isFinite(value))
        ? ([rating[0], rating[1]] as [number, number])
        : null;
    return {
      sortBy: sortBy === 'title' ? 'title' : 'date',
      sortOrder: order === 'asc' ? 'asc' : 'desc',
      searchQuery: searchParams.get('q') ?? '',
      ratingRange,
      year: Number(searchParams.get('year')) || null,
      country: searchParams.get('country') ?? '',
      contentType: contentType === 'movie' || contentType === 'tv' ? contentType : 'all',
      watchStatus: watchStatus === 'watching' || watchStatus === 'completed' ? watchStatus : 'all',
      sourceType: sourceType === 'normal' || sourceType === 'review' ? sourceType : 'all',
    };
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page'));
    return Number.isInteger(page) && page > 1 ? page : 1;
  });

  // Chép bộ lọc vào query string, bỏ qua giá trị mặc định.
  const syncParams = useCallback(
    (next: FilterState, page: number, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        const setOrDelete = (key: string, value: string) => {
          if (value) params.set(key, value);
          else params.delete(key);
        };
        setOrDelete('q', next.searchQuery.trim());
        setOrDelete('sort', next.sortBy !== 'date' ? next.sortBy : '');
        setOrDelete('order', next.sortOrder !== 'desc' ? next.sortOrder : '');
        setOrDelete(
          'rating',
          next.ratingRange ? `${next.ratingRange[0]}-${next.ratingRange[1]}` : '',
        );
        setOrDelete('year', next.year !== null ? String(next.year) : '');
        setOrDelete('country', next.country);
        setOrDelete('type', next.contentType !== 'all' ? next.contentType : '');
        setOrDelete('status', next.watchStatus !== 'all' ? next.watchStatus : '');
        setOrDelete('source', next.sourceType !== 'all' ? next.sourceType : '');
        setOrDelete('page', page > 1 ? String(page) : '');
        return params;
      }, options);
    },
    [setSearchParams],
  );

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setCurrentPage(1);
    syncParams(next, 1, { replace: key === 'searchQuery' });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    syncParams(filters, page);
  };

  const clearFilters = () => {
    const next = { ...INITIAL_FILTER_STATE, sortBy: filters.sortBy, sortOrder: filters.sortOrder };
    setFilters(next);
    setCurrentPage(1);
    syncParams(next, 1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const currentTabMovies = useMemo(
    () => movies.filter((m) => (m.status || 'history') === activeTab),
    [movies, activeTab],
  );

  const processedMovies = useMemo(() => {
    let result = [...currentTabMovies];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) || (m.title_vi && m.title_vi.toLowerCase().includes(q)),
      );
    }

    if (filters.ratingRange !== null) {
      const [min, max] = filters.ratingRange;
      result = result.filter((m) => (m.rating || 0) >= min && (m.rating || 0) <= max);
    }

    if (filters.year !== null) {
      result = result.filter(
        (m) => normalizeMovieDate(m.watched_at)?.getFullYear() === filters.year,
      );
    }

    if (filters.country) {
      const q = filters.country.toLowerCase();
      result = result.filter((m) => {
        const translatedCountry = getTranslatedCountries(m.country || '').toLowerCase();
        return translatedCountry.includes(q);
      });
    }

    if (filters.contentType !== 'all') {
      result = result.filter((m) => (m.media_type || 'movie') === filters.contentType);
    }

    if (activeTab === 'history' && filters.watchStatus !== 'all') {
      result = result.filter((m) => {
        if (filters.watchStatus === 'watching')
          return m.media_type === 'tv' && m.progress && !m.progress.is_completed;
        if (filters.watchStatus === 'completed')
          return (
            m.media_type === 'movie' || !m.media_type || (m.progress && m.progress.is_completed)
          );
        return true;
      });
    }

    if (filters.sourceType !== 'all') {
      result = result.filter((m) => {
        if (filters.sourceType === 'review') return m.is_review === true;
        return !m.is_review;
      });
    }

    result.sort((a, b) => {
      let comp = 0;
      if (filters.sortBy === 'title') comp = a.title.localeCompare(b.title);
      else {
        const da = normalizeMovieDate(a.watched_at)?.getTime() || 0;
        const db = normalizeMovieDate(b.watched_at)?.getTime() || 0;
        comp = da - db;
      }
      return filters.sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [currentTabMovies, filters, activeTab]);

  const totalPages = Math.ceil(processedMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    return processedMovies.slice(start, start + MOVIES_PER_PAGE);
  }, [processedMovies, currentPage]);

  return {
    showFilters,
    setShowFilters,
    filterRef,
    filters,
    updateFilter,
    currentPage,
    setCurrentPage: goToPage,
    totalPages,
    processedMovies: paginatedMovies,
    allProcessedMoviesCount: processedMovies.length,
    clearFilters,
    currentTabMovies,
    toggleSortOrder: () => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc'),
  };
};
