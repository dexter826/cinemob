import { useState, useMemo, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { normalizeMovieDate, getTranslatedCountries } from '../utils/movieUtils';

export type SortOption = 'date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'history' | 'watchlist';

interface FilterState {
  sortBy: SortOption;
  sortOrder: SortOrder;
  searchQuery: string;
  ratingRange: [number, number] | null;
  year: number | null;
  country: string;
  contentType: 'all' | 'movie' | 'tv';
  watchStatus: 'all' | 'watching' | 'completed';
}

const INITIAL_FILTER_STATE: FilterState = {
  sortBy: 'date',
  sortOrder: 'desc',
  searchQuery: '',
  ratingRange: null,
  year: null,
  country: '',
  contentType: 'all',
  watchStatus: 'all',
};

export const useDashboardFilters = (movies: Movie[], activeTab: ActiveTab) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 20;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
  }, [filters, activeTab]);

  const currentTabMovies = useMemo(() => 
    movies.filter(m => (m.status || 'history') === activeTab),
  [movies, activeTab]);

  const processedMovies = useMemo(() => {
    let result = [...currentTabMovies];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.title_vi && m.title_vi.toLowerCase().includes(q))
      );
    }

    if (filters.ratingRange !== null) {
      const [min, max] = filters.ratingRange;
      result = result.filter(m => (m.rating || 0) >= min && (m.rating || 0) <= max);
    }
    
    if (filters.year !== null) {
      result = result.filter(m => normalizeMovieDate(m.watched_at)?.getFullYear() === filters.year);
    }

    if (filters.country) {
      const q = filters.country.toLowerCase();
      result = result.filter(m => {
        const translatedCountry = getTranslatedCountries(m.country || '').toLowerCase();
        return translatedCountry.includes(q);
      });
    }

    if (filters.contentType !== 'all') {
      result = result.filter(m => (m.media_type || 'movie') === filters.contentType);
    }

    if (activeTab === 'history' && filters.watchStatus !== 'all') {
      result = result.filter(m => {
        if (filters.watchStatus === 'watching') return m.media_type === 'tv' && m.progress && !m.progress.is_completed;
        if (filters.watchStatus === 'completed') return m.media_type === 'movie' || !m.media_type || (m.progress && m.progress.is_completed);
        return true;
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

  const totalPages = Math.ceil(processedMovies.length / moviesPerPage);
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * moviesPerPage;
    return processedMovies.slice(start, start + moviesPerPage);
  }, [processedMovies, currentPage]);

  return {
    showFilters,
    setShowFilters,
    filterRef,
    filters,
    updateFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    processedMovies: paginatedMovies,
    allProcessedMoviesCount: processedMovies.length,
    clearFilters: () => setFilters(prev => ({ ...INITIAL_FILTER_STATE, sortBy: prev.sortBy, sortOrder: prev.sortOrder })),
    currentTabMovies,
    toggleSortOrder: () => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc'),
  };
};
