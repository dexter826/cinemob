import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Movie, MovieStatus } from '@/types';
import {
  getTranslatedCountries,
  getWatchedDates,
  getLatestWatchedDate,
  getMainTitle,
} from '@/features/movies/utils/movie-utils';
import { COUNTRY_TRANSLATIONS } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import { readPageParam, setOrDeleteParam, writePageParam } from '@/shared/utils/search-params';

export type SortOption = 'date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = MovieStatus;
export type SourceType = 'all' | 'normal' | 'review';

export interface FilterState {
  sortBy: SortOption;
  sortOrder: SortOrder;
  searchQuery: string;
  ratingRange: [number, number] | null;
  year: number | null;
  country: string;
  genre: string;
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
  genre: '',
  contentType: 'all',
  watchStatus: 'all',
  sourceType: 'all',
};

export const MOVIES_PER_PAGE = 24;

const parseFiltersFromParams = (params: URLSearchParams): FilterState => {
  const sortBy = params.get('sort');
  const order = params.get('order');
  const contentType = params.get('type');
  const watchStatus = params.get('status');
  const sourceType = params.get('source');
  const rating = params.get('rating')?.split('-').map(Number) ?? [];
  const ratingRange =
    rating.length === 2 && rating.every((value) => Number.isFinite(value))
      ? ([rating[0], rating[1]] as [number, number])
      : null;
  return {
    sortBy: sortBy === 'title' ? 'title' : 'date',
    sortOrder: order === 'asc' ? 'asc' : 'desc',
    searchQuery: params.get('q') ?? '',
    ratingRange,
    year: Number(params.get('year')) || null,
    country: params.get('country') ?? '',
    genre: params.get('genre') ?? '',
    contentType: contentType === 'movie' || contentType === 'tv' ? contentType : 'all',
    watchStatus: watchStatus === 'watching' || watchStatus === 'completed' ? watchStatus : 'all',
    sourceType: sourceType === 'normal' || sourceType === 'review' ? sourceType : 'all',
  };
};

const isSameFilters = (a: FilterState, b: FilterState): boolean =>
  a.sortBy === b.sortBy &&
  a.sortOrder === b.sortOrder &&
  a.searchQuery === b.searchQuery &&
  a.ratingRange?.[0] === b.ratingRange?.[0] &&
  a.ratingRange?.[1] === b.ratingRange?.[1] &&
  a.year === b.year &&
  a.country === b.country &&
  a.genre === b.genre &&
  a.contentType === b.contentType &&
  a.watchStatus === b.watchStatus &&
  a.sourceType === b.sourceType;

export const useDashboardFilters = (movies: Movie[], activeTab: ActiveTab) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams));
  const [currentPage, setCurrentPage] = useState(() => readPageParam(searchParams));
  useEffect(() => {
    const next = parseFiltersFromParams(searchParams);
    setFilters((prev) => (isSameFilters(prev, next) ? prev : next));
    const targetPage = readPageParam(searchParams);
    setCurrentPage((prev) => (prev !== targetPage ? targetPage : prev));
  }, [searchParams]);

  const syncParams = useCallback(
    (next: FilterState, page: number, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        setOrDeleteParam(params, 'q', next.searchQuery.trim());
        setOrDeleteParam(params, 'sort', next.sortBy !== 'date' ? next.sortBy : '');
        setOrDeleteParam(params, 'order', next.sortOrder !== 'desc' ? next.sortOrder : '');
        setOrDeleteParam(
          params,
          'rating',
          next.ratingRange ? `${next.ratingRange[0]}-${next.ratingRange[1]}` : '',
        );
        setOrDeleteParam(params, 'year', next.year !== null ? String(next.year) : '');
        setOrDeleteParam(params, 'country', next.country);
        setOrDeleteParam(params, 'genre', next.genre);
        setOrDeleteParam(params, 'type', next.contentType !== 'all' ? next.contentType : '');
        setOrDeleteParam(params, 'status', next.watchStatus !== 'all' ? next.watchStatus : '');
        setOrDeleteParam(params, 'source', next.sourceType !== 'all' ? next.sourceType : '');
        writePageParam(params, page);
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
      const target = event.target as Node;
      const insideToggle = toggleRef.current?.contains(target) ?? false;
      if (filterRef.current && !filterRef.current.contains(target) && !insideToggle) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Đổi tab thì về trang 1, nhưng không đụng trang lấy từ deep-link lúc mount.
  const isFirstTabRunRef = useRef(true);
  useEffect(() => {
    if (isFirstTabRunRef.current) {
      isFirstTabRunRef.current = false;
      return;
    }
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
      result = result.filter((m) =>
        getWatchedDates(m).some((date) => date.getFullYear() === filters.year),
      );
    }

    if (filters.country) {
      const q = filters.country.toLowerCase();
      result = result.filter((m) => {
        const rawCountry = (m.country || '').toLowerCase();
        const translatedCountry = getTranslatedCountries(m.country || '').toLowerCase();
        return rawCountry.includes(q) || translatedCountry.includes(q);
      });
    }

    if (filters.genre) {
      result = result.filter((m) =>
        (m.genres || '')
          .split(',')
          .map((g) => g.trim())
          .includes(filters.genre),
      );
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
      if (filters.sortBy === 'title') comp = getMainTitle(a).localeCompare(getMainTitle(b), 'vi');
      else {
        const da = getLatestWatchedDate(a)?.getTime() || 0;
        const db = getLatestWatchedDate(b)?.getTime() || 0;
        comp = da - db;
      }
      return filters.sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [currentTabMovies, filters, activeTab]);

  const totalPages = Math.ceil(processedMovies.length / MOVIES_PER_PAGE);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      syncParams(filters, totalPages);
    }
  }, [totalPages, currentPage, syncParams, filters]);

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    return processedMovies.slice(start, start + MOVIES_PER_PAGE);
  }, [processedMovies, currentPage]);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(movies.flatMap((m) => getWatchedDates(m).map((date) => date.getFullYear()))),
    )
      .sort((a, b) => b - a)
      .map((year) => ({
        value: year,
        label: year.toString(),
      }));
  }, [movies]);

  const availableCountries = useMemo(() => {
    return Array.from(
      new Set(
        movies
          .filter((m) => m.country && m.country.trim().length > 0)
          .flatMap((m) => (m.country ?? '').split(',').map((c) => c.trim()))
          .filter((c) => c.length > 0),
      ),
    )
      .sort()
      .map((country) => ({
        value: country,
        label: COUNTRY_TRANSLATIONS[country] || country,
      }));
  }, [movies]);

  const availableGenres = useMemo(() => {
    return Array.from(
      new Set(
        movies
          .filter((m) => m.genres && m.genres.trim().length > 0)
          .flatMap((m) => (m.genres ?? '').split(',').map((g) => g.trim()))
          .filter((g) => g.length > 0),
      ),
    )
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((genre) => ({
        value: genre,
        label: GENRE_TRANSLATIONS[genre] || genre,
      }));
  }, [movies]);

  return {
    showFilters,
    setShowFilters,
    filterRef,
    toggleRef,
    filters,
    updateFilter,
    currentPage,
    setCurrentPage: goToPage,
    totalPages,
    processedMovies: paginatedMovies,
    paginatedMovies,
    allProcessedMoviesCount: processedMovies.length,
    clearFilters,
    currentTabMovies,
    availableYears,
    availableCountries,
    availableGenres,
    toggleSortOrder: () => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc'),
  };
};
