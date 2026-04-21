import { useState, useEffect, useMemo } from 'react';
import { getCountries } from '../services/tmdb';
import useMovieStore from '../stores/movieStore';
import useRecommendationsStore from '../stores/recommendationsStore';
import useAddMovieStore from '../stores/addMovieStore';
import { useSearchPeople } from './useSearchPeople';
import { useSearchTMDB } from './useSearchTMDB';
import { TMDBMovieResult } from '../types';

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

  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'movies' | 'people'>('movies');
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [suggestAnimation, setSuggestAnimation] = useState(null);
  const [countries, setCountries] = useState<{ iso_3166_1: string, english_name: string, native_name: string }[]>([]);

  // Filters state
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  const filters = useMemo(() => ({
    year: filterYear,
    country: filterCountry,
    rating: filterRating,
    sortBy,
    type: filterType
  }), [filterYear, filterCountry, filterRating, sortBy, filterType]);

  useEffect(() => {
    fetch('/data/loading_suggest.json')
      .then(res => res.json())
      .then(data => setSuggestAnimation(data))
      .catch(err => console.error('Error loading animation:', err));

    getCountries().then(data => {
      setCountries(data);
      setInitialLoading(false);
    }).catch(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (user && aiRecommendations.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user, aiRecommendations.length, isAiLoading, refreshRecommendations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterType, filterYear, filterCountry, filterRating, sortBy]);

  // Sub-hooks
  const { results, totalSearchPages, isSearchLoading, discoverMovies, totalDiscoverPages, isDiscoverLoading, isSearchMode } = useSearchTMDB(query, currentPage, filters);

  const { peopleResults, totalPeoplePages, isPeopleLoading } = useSearchPeople(query, currentPage);

  const displayMovies = isSearchMode ? results : discoverMovies;

  /** Lọc kết quả cục bộ nếu cần. */
  const filteredResults = useMemo(() => {
    return displayMovies.filter(movie => {
      if (isSearchMode) {
        if (filterType !== 'all' && movie.media_type !== filterType) return false;
        if (filterCountry && movie.origin_country && !movie.origin_country.includes(filterCountry)) return false;
        if (filterRating && (movie.vote_average || 0) < Number(filterRating)) return false;
      }
      return true;
    });
  }, [displayMovies, isSearchMode, filterType, filterCountry, filterRating]);

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: (movie.media_type === 'tv' || movie.media_type === 'movie') 
        ? movie.media_type 
        : (filterType === 'tv' ? 'tv' : 'movie'),
    });
  };

  const getMovieStatus = (movieId: number) => {
    const movie = savedMovies.find(m => m.id === movieId);
    return movie ? movie.status || null : null;
  };

  const handleClear = () => {
    setQuery('');
    setFilterType('all');
    setFilterYear('');
    setFilterCountry('');
    setFilterRating('');
    setSortBy('popularity.desc');
    setCurrentPage(1);
  };

  return {
    query, setQuery,
    searchTab, setSearchTab,
    peopleResults,
    initialLoading,
    currentPage,
    totalPages: searchTab === 'movies' 
      ? (isSearchMode ? totalSearchPages : totalDiscoverPages)
      : totalPeoplePages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations,
    suggestAnimation, countries,
    filterType, setFilterType,
    filterYear, setFilterYear,
    filterCountry, setFilterCountry,
    filterRating, setFilterRating,
    sortBy, setSortBy,
    filteredResults,
    handleSelectMovie, getMovieStatus,
    handleClear,
    handleSearch: () => {}, // Handled by effects
    isLoading: searchTab === 'movies' ? (isSearchMode ? isSearchLoading : isDiscoverLoading) : isPeopleLoading,
    watchedMoviesCount: historyMovies.filter(m => (m.status || 'history') === 'history').length
  };
};
