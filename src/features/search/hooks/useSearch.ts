import { useState, useEffect, useMemo, useCallback } from 'react';
import useMovieStore from '@/features/movies/stores/movieStore';
import useRecommendationsStore from '@/features/movies/stores/recommendationsStore';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';
import { useSearchTMDB } from './useSearchTMDB';
import { searchMovies } from '../services/tmdb';
import { TMDBMovieResult } from '@/types';
import type { User } from 'firebase/auth';

export type SearchSortBy =
  | 'popularity.desc'
  | 'vote_average.desc'
  | 'primary_release_date.desc'
  | 'primary_release_date.asc'
  | 'title.asc'
  | 'title.desc';

export interface SearchFormFilters {
  query: string;
  type: 'all' | 'movie' | 'tv';
  year: string;
  country: string;
  rating?: string;
  sortBy: SearchSortBy;
}

const INITIAL_FILTERS: SearchFormFilters = {
  query: '',
  type: 'all',
  year: '',
  country: '',
  sortBy: 'popularity.desc',
};

// Hook điều phối chính cho trang Tìm kiếm.
export const useSearch = (user: User | null) => {
  const { openAddModal } = useAddMovieStore();
  const { 
    aiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    isTrendingLoading,
    refreshRecommendations,
    removeRecommendation,
    historyMovies
  } = useRecommendationsStore();

  const { movies: savedMovies } = useMovieStore();

  const filteredAiRecommendations = useMemo(() => {
    const savedIds = new Set(savedMovies.map(m => m.id.toString()));
    return aiRecommendations.filter(m => !savedIds.has(m.id.toString()));
  }, [aiRecommendations, savedMovies]);

  const [filters, setFilters] = useState<SearchFormFilters>(INITIAL_FILTERS);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBMovieResult[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);

  const updateFilter = <K extends keyof SearchFormFilters>(key: K, value: SearchFormFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'query' && (value as string).trim() === '') {
      setSubmittedQuery('');
      setSuggestions([]);
    }
  };

  const handleSearch = useCallback(() => {
    setSubmittedQuery(filters.query);
    setShowSuggestions(false);
    setCurrentPage(1);
  }, [filters.query]);

  useEffect(() => {
    const query = filters.query.trim();
    if (query.length > 2 && query !== submittedQuery) {
      const timer = setTimeout(async () => {
        setIsSuggesting(true);
        try {
          const { results: data } = await searchMovies(query, 1);
          setSuggestions(data.slice(0, 6));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsSuggesting(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.query, submittedQuery]);

  useEffect(() => {
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (user?.uid && aiRecommendations.length === 0 && trendingMovies.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user?.uid, aiRecommendations.length, trendingMovies.length, isAiLoading, refreshRecommendations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.type, filters.year, filters.country, filters.sortBy]);

  const { 
    results, 
    totalSearchPages, 
    isSearchLoading, 
    discoverMovies, 
    totalDiscoverPages, 
    isDiscoverLoading, 
    isSearchMode 
  } = useSearchTMDB(submittedQuery, currentPage, filters);

  const displayMovies = isSearchMode ? results : discoverMovies;

  const filteredResults = useMemo(() => {
    let result = displayMovies.filter(movie => {
      if (filters.type !== 'all' && movie.media_type !== filters.type) return false;
      
      if (isSearchMode && filters.country) {
        if (!movie.origin_country || !movie.origin_country.includes(filters.country)) return false;
      }
      
      return true;
    });

    if (isSearchMode) {
      result = [...result].sort((a, b) => {
        switch (filters.sortBy) {
          case 'popularity.desc':
            return (b.popularity || 0) - (a.popularity || 0);
          case 'vote_average.desc':
            return (b.vote_average || 0) - (a.vote_average || 0);
          case 'primary_release_date.desc': {
            const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
            const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
            return dateB - dateA;
          }
          case 'primary_release_date.asc': {
            const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
            const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
            return dateA - dateB;
          }
          case 'title.asc': {
            const titleA = a.title || a.name || '';
            const titleB = b.title || b.name || '';
            return titleA.localeCompare(titleB, 'vi');
          }
          case 'title.desc': {
            const titleA = a.title || a.name || '';
            const titleB = b.title || b.name || '';
            return titleB.localeCompare(titleA, 'vi');
          }
          default: {
            // Exhaustiveness: thêm SearchSortBy mới mà chưa xử lý sẽ lỗi biên dịch ở đây.
            const unreachable: never = filters.sortBy;
            console.warn('Unknown sort option:', unreachable);
            return 0;
          }
        }
      });
    }

    return result;
  }, [displayMovies, filters.type, filters.country, isSearchMode, filters.sortBy]);

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: (movie.media_type === 'tv' || movie.media_type === 'movie') 
        ? movie.media_type 
        : (filters.type === 'tv' ? 'tv' : 'movie'),
    });
    setShowSuggestions(false);
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
    aiRecommendations: filteredAiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    isTrendingLoading,
    refreshRecommendations,
    removeRecommendation,
    filteredResults,
    handleSelectMovie, 
    getMovieStatus,
    handleClear: () => {
      setFilters(INITIAL_FILTERS);
      setSubmittedQuery('');
      setSuggestions([]);
      setCurrentPage(1);
    },
    isLoading: isSearchMode ? isSearchLoading : isDiscoverLoading,
    watchedMoviesCount: historyMovies.filter(m => (m.status || 'history') === 'history').length,
    // Search states
    submittedQuery,
    suggestions,
    isSuggesting,
    showSuggestions,
    setShowSuggestions,
    handleSearch
  };
};
