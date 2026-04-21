import { useState, useMemo, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { normalizeMovieDate } from '../utils/movieUtils';

export type SortOption = 'date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'history' | 'watchlist';

export const useDashboardFilters = (movies: Movie[], activeTab: ActiveTab) => {
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
    setCurrentPage(1);
  }, [searchQuery, filterRating, filterYear, filterCountry, filterContentType, filterWatchStatus, sortBy, sortOrder, activeTab]);

  const currentTabMovies = useMemo(() => {
    return movies.filter(m => {
      const status = m.status || 'history';
      return status === activeTab;
    });
  }, [movies, activeTab]);

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
  }, [processedMovies, currentPage]);

  const clearFilters = () => {
    setFilterRating(null);
    setFilterYear(null);
    setFilterCountry('');
    setFilterContentType('all');
    setFilterWatchStatus('all');
    setSearchQuery('');
  };

  return {
    showFilters,
    setShowFilters,
    filterRef,
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
    currentPage,
    setCurrentPage,
    totalPages,
    processedMovies: paginatedMovies,
    allProcessedMoviesCount: processedMovies.length,
    clearFilters,
    currentTabMovies,
    toggleSortOrder: () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'),
  };
};
