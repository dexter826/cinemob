import { useState, useEffect, useMemo } from 'react';
import { getCountries } from '../services/tmdb';
import useMovieStore from '../stores/movieStore';
import useRecommendationsStore from '../stores/recommendationsStore';
import useAddMovieStore from '../stores/addMovieStore';
import { useSearchPeople } from './useSearchPeople';
import { useSearchTMDB } from './useSearchTMDB';
import { TMDBMovieResult } from '../types';

interface SearchFilters {
  query: string;
  type: 'all' | 'movie' | 'tv';
  year: string;
  sortBy: string;
}

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  type: 'all',
  year: '',
  sortBy: 'popularity.desc',
};

/** Hook điều phối chính cho trang Tìm kiếm. */
export const useSearch = (user: any) => {
  const { openAddModal } = useAddMovieStore();
  const { 
    aiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    refreshRecommendations, 
    historyMovies 
  } = useRecommendationsStore();

  const { movies: savedMovies } = useMovieStore();

  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [suggestAnimation, setSuggestAnimation] = useState(null);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetch('/data/loading_suggest.json')
      .then(res => res.json())
      .then(data => setSuggestAnimation(data))
      .catch(err => console.error('Error loading animation:', err));
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (user?.uid && aiRecommendations.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user?.uid, aiRecommendations.length, isAiLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const { 
    results, 
    totalSearchPages, 
    isSearchLoading, 
    discoverMovies, 
    totalDiscoverPages, 
    isDiscoverLoading, 
    isSearchMode 
  } = useSearchTMDB(filters.query, currentPage, filters);

  const displayMovies = isSearchMode ? results : discoverMovies;

  const filteredResults = useMemo(() => {
    return displayMovies.filter(movie => {
      if (isSearchMode && filters.type !== 'all' && movie.media_type !== filters.type) return false;
      return true;
    });
  }, [displayMovies, isSearchMode, filters.type]);

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: (movie.media_type === 'tv' || movie.media_type === 'movie') 
        ? movie.media_type 
        : (filters.type === 'tv' ? 'tv' : 'movie'),
    });
  };

  const getMovieStatus = (movieId: number) => {
    const movie = savedMovies.find(m => m.id === movieId);
    return movie ? (movie.status || 'history') : null;
  };

  return {
    filters,
    updateFilter,
    initialLoading,
    currentPage,
    totalPages: isSearchMode ? totalSearchPages : totalDiscoverPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    refreshRecommendations,
    suggestAnimation,
    filteredResults,
    handleSelectMovie, 
    getMovieStatus,
    handleClear: () => {
      setFilters(INITIAL_FILTERS);
      setCurrentPage(1);
    },
    isLoading: isSearchMode ? isSearchLoading : isDiscoverLoading,
    watchedMoviesCount: historyMovies.filter(m => (m.status || 'history') === 'history').length
  };
};
