import { useState, useEffect, useMemo, useCallback } from 'react';
import useMovieStore from '../stores/movieStore';
import useRecommendationsStore from '../stores/recommendationsStore';
import useAddMovieStore from '../stores/addMovieStore';
import { useSearchPeople } from './useSearchPeople';
import { useSearchTMDB } from './useSearchTMDB';
import { searchMovies } from '../services/tmdb';
import { TMDBMovieResult } from '../types';

interface SearchFilters {
  query: string;
  type: 'all' | 'movie' | 'tv';
  year: string;
  country: string;
  sortBy: string;
}

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  type: 'all',
  year: '',
  country: '',
  sortBy: 'popularity.desc',
};

// Hook điều phối chính cho trang Tìm kiếm.
export const useSearch = (user: any) => {
  const { openAddModal } = useAddMovieStore();
  const { 
    aiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    refreshRecommendations,
    removeRecommendation,
    historyMovies
  } = useRecommendationsStore();

  const { movies: savedMovies } = useMovieStore();

  const filteredAiRecommendations = useMemo(() => {
    const savedIds = new Set(savedMovies.map(m => m.id.toString()));
    return aiRecommendations.filter(m => !savedIds.has(m.id.toString()));
  }, [aiRecommendations, savedMovies]);

  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBMovieResult[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [suggestAnimation, setSuggestAnimation] = useState(null);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
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
    return displayMovies.filter(movie => {
      if (filters.type !== 'all' && movie.media_type !== filters.type) return false;
      
      if (isSearchMode && filters.country) {
        if (!movie.origin_country || !movie.origin_country.includes(filters.country)) return false;
      }
      
      return true;
    });
  }, [displayMovies, filters.type, filters.country, isSearchMode]);

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
    refreshRecommendations,
    removeRecommendation,
    suggestAnimation,
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
