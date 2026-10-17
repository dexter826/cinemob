import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useMovieStore from '@/features/movies/stores/movie-store';
import useTrendingStore from '@/features/movies/stores/trending-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import { useSearchTMDB } from './use-search-tmdb';
import { searchMovies } from '../services/tmdb';
import { TMDBMovieResult } from '@/types';

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

// Hook điều phối chính cho trang Tìm kiếm.
export const useSearch = () => {
  const { openAddModal } = useAddMovieStore();
  const {
    trendingMovies,
    isTrendingLoading,
    trendingError,
    fetchTrending,
  } = useTrendingStore();

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

  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page'));
    return Number.isInteger(page) && page > 1 ? page : 1;
  });
  // Tăng nonce để nạp lại kết quả TMDB khi bấm Thử lại.
  const [retryNonce, setRetryNonce] = useState(0);

  // Chép trạng thái tìm kiếm vào query string, bỏ qua giá trị mặc định.
  const syncParams = useCallback(
    (next: SearchFormFilters, page: number, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        const setOrDelete = (key: string, value: string) => {
          if (value) params.set(key, value);
          else params.delete(key);
        };
        setOrDelete('q', next.query.trim());
        setOrDelete('type', next.type !== 'all' ? next.type : '');
        setOrDelete('year', next.year);
        setOrDelete('country', next.country);
        setOrDelete('sortBy', next.sortBy !== 'popularity.desc' ? next.sortBy : '');
        setOrDelete('page', page > 1 ? String(page) : '');
        return params;
      }, options);
    },
    [setSearchParams],
  );

  const updateFilter = <K extends keyof SearchFormFilters>(key: K, value: SearchFormFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === 'query' && (value as string).trim() === '') {
      setSubmittedQuery('');
      setSuggestions([]);
      syncParams(next, 1, { replace: true });
      return;
    }
    if (key !== 'query') {
      setCurrentPage(1);
      // Giữ nguyên q đã submit trong URL, không ghi draft đang gõ dở.
      syncParams({ ...next, query: submittedQuery }, 1);
    }
  };

  const handleSearch = useCallback(() => {
    setSubmittedQuery(filters.query);
    setShowSuggestions(false);
    setCurrentPage(1);
    syncParams(filters, 1);
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

  const displayMovies = isSearchMode ? results : discoverMovies;

  const filteredResults = useMemo(() => {
    let result = displayMovies.filter((movie) => {
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

  const navigate = useNavigate();

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    // Phim đã trong bộ sưu tập → trang chi tiết; chưa có → mở form thêm nhanh.
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
    syncParams(filters, page);
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
    // Search states
    submittedQuery,
    suggestions,
    isSuggesting,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
  };
};
