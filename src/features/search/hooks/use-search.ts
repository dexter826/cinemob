import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useMovieStore from '@/features/movies/stores/movie-store';
import useTrendingStore from '@/features/movies/stores/trending-store';
import useRandomSuggestionsStore from '@/features/movies/stores/random-suggestions-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import { useSearchTMDB } from './use-search-tmdb';
import { searchMovies } from '../services/tmdb';
import { TMDBMovieResult } from '@/types';
import { readPageParam, setOrDeleteParam, writePageParam } from '@/shared/utils/search-params';

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

const SEARCH_SORT_VALUES: SearchSortBy[] = [
  'popularity.desc',
  'vote_average.desc',
  'primary_release_date.desc',
  'primary_release_date.asc',
  'title.asc',
  'title.desc',
];

export const useSearch = () => {
  const { openAddModal } = useAddMovieStore();
  const { trendingMovies, isTrendingLoading, trendingError, fetchTrending } = useTrendingStore();

  const { movies: savedMovies } = useMovieStore();

  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo từ URL để deep-link được query, bộ lọc và trang đang xem.
  const [filters, setFilters] = useState<SearchFormFilters>(() => {
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') as SearchSortBy | null;
    return {
      query: searchParams.get('q') ?? '',
      type: type === 'movie' || type === 'tv' ? type : 'all',
      year: searchParams.get('year') ?? '',
      country: searchParams.get('country') ?? '',
      sortBy: sortBy && SEARCH_SORT_VALUES.includes(sortBy) ? sortBy : 'popularity.desc',
    };
  });
  const [submittedQuery, setSubmittedQuery] = useState(() => (searchParams.get('q') ?? '').trim());
  const [suggestions, setSuggestions] = useState<TMDBMovieResult[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => readPageParam(searchParams));
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const sortParam = searchParams.get('sortBy') as SearchSortBy | null;
    const nextFilters: SearchFormFilters = {
      query: searchParams.get('q') ?? '',
      type: typeParam === 'movie' || typeParam === 'tv' ? typeParam : 'all',
      year: searchParams.get('year') ?? '',
      country: searchParams.get('country') ?? '',
      sortBy: sortParam && SEARCH_SORT_VALUES.includes(sortParam) ? sortParam : 'popularity.desc',
    };
    setFilters((prev) =>
      prev.query === nextFilters.query &&
      prev.type === nextFilters.type &&
      prev.year === nextFilters.year &&
      prev.country === nextFilters.country &&
      prev.sortBy === nextFilters.sortBy
        ? prev
        : nextFilters,
    );
    setSubmittedQuery((prev) => {
      const next = nextFilters.query.trim();
      return prev === next ? prev : next;
    });
    const page = readPageParam(searchParams);
    setCurrentPage((prev) => (prev === page ? prev : page));
  }, [searchParams]);

  const syncParams = useCallback(
    (next: SearchFormFilters, page: number, options?: { replace?: boolean }) => {
      const effective: SearchFormFilters =
        next.query.trim().length > 2 ? { ...next, country: '', sortBy: 'popularity.desc' } : next;
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        setOrDeleteParam(params, 'q', effective.query.trim());
        setOrDeleteParam(params, 'type', effective.type !== 'all' ? effective.type : '');
        setOrDeleteParam(params, 'year', effective.year);
        setOrDeleteParam(params, 'country', effective.country);
        setOrDeleteParam(
          params,
          'sortBy',
          effective.sortBy !== 'popularity.desc' ? effective.sortBy : '',
        );
        writePageParam(params, page);
        return params;
      }, options);
      return effective;
    },
    [setSearchParams],
  );

  const updateFilter = <K extends keyof SearchFormFilters>(key: K, value: SearchFormFilters[K]) => {
    const next = { ...filters, [key]: value };
    if (key === 'query' && (value as string).trim() === '') {
      setFilters(next);
      setSubmittedQuery('');
      setSuggestions([]);
      syncParams(next, 1, { replace: true });
      return;
    }
    if (key !== 'query') {
      setCurrentPage(1);
      setFilters(syncParams({ ...next, query: submittedQuery }, 1));
      return;
    }
    setFilters(next);
  };

  const handleSearch = useCallback(() => {
    const effective = syncParams(filters, 1);
    setFilters(effective);
    setSubmittedQuery(filters.query);
    setShowSuggestions(false);
    setCurrentPage(1);
  }, [filters, syncParams]);

  useEffect(() => {
    const query = filters.query.trim();
    if (query.length > 2 && query !== submittedQuery) {
      let ignore = false;
      const timer = setTimeout(async () => {
        setIsSuggesting(true);
        try {
          const { results: data } = await searchMovies(query, 1);
          if (!ignore) {
            setSuggestions(data.slice(0, 6));
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          if (!ignore) setIsSuggesting(false);
        }
      }, 300);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSuggesting(false);
  }, [filters.query, submittedQuery]);

  useEffect(() => {
    if (trendingMovies.length === 0 && !isTrendingLoading) {
      void fetchTrending();
    }
  }, [trendingMovies.length, isTrendingLoading, fetchTrending]);

  const {
    results,
    totalSearchPages,
    isSearchLoading,
    searchError,
    discoverMovies,
    totalDiscoverPages,
    isDiscoverLoading,
    discoverError,
    isSearchMode,
    mode,
  } = useSearchTMDB(submittedQuery, currentPage, filters, retryNonce);

  const {
    movies: randomSuggestions,
    isLoading: isSuggestionsLoading,
    hasLoaded: suggestionsHasLoaded,
    error: suggestionsError,
    fetchRandomMovies,
  } = useRandomSuggestionsStore();

  useEffect(() => {
    if (mode === 'home' && !suggestionsHasLoaded) {
      void fetchRandomMovies();
    }
  }, [mode, suggestionsHasLoaded, fetchRandomMovies]);

  const displayMovies = isSearchMode ? results : discoverMovies;
  const filteredResults = displayMovies;

  const navigate = useNavigate();

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    if (getMovieStatus(movie.id)) {
      const isTV = movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);
      navigate(`/movie/${movie.id}${isTV ? '?type=tv' : ''}`);
      return;
    }
    openAddModal({
      movie: movie,
      mediaType:
        movie.media_type === 'tv' || movie.media_type === 'movie'
          ? movie.media_type
          : filters.type === 'tv'
            ? 'tv'
            : 'movie',
    });
    setShowSuggestions(false);
  };

  const getMovieStatus = (movieId: number) => {
    const movie = savedMovies.find((m) => m.id === movieId);
    return movie ? movie.status || 'history' : null;
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    syncParams({ ...filters, query: submittedQuery }, page);
  };

  return {
    filters,
    updateFilter,
    mode,
    currentPage,
    totalPages: isSearchMode ? totalSearchPages : totalDiscoverPages,
    setCurrentPage: goToPage,
    discoverMovies,
    trendingMovies,
    isTrendingLoading,
    trendingError,
    refreshTrending: (force?: boolean) => fetchTrending(force ?? true),
    randomSuggestions,
    isSuggestionsLoading,
    suggestionsHasLoaded,
    suggestionsError,
    refreshSuggestions: () => void fetchRandomMovies(true),
    filteredResults,
    handleSelectMovie,
    getMovieStatus,
    handleClear: () => {
      setFilters(INITIAL_FILTERS);
      setSubmittedQuery('');
      setSuggestions([]);
      setCurrentPage(1);
      syncParams(INITIAL_FILTERS, 1, { replace: true });
    },
    isLoading: isSearchMode ? isSearchLoading : isDiscoverLoading,
    resultsError: isSearchMode ? searchError : discoverError,
    retrySearch: () => setRetryNonce((n) => n + 1),
    submittedQuery,
    suggestions,
    isSuggesting,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
  };
};
