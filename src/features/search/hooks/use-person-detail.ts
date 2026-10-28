import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PersonMovie, TMDBPerson } from '@/types';
import { getPersonDetails, getPersonMovieCredits } from '../services/tmdb';
import {
  filterAndSortPersonMovies,
  getPersonAvailableYears,
  paginatePersonMovies,
  type PersonSortBy,
  type SortOrder,
} from '../utils/person-selectors';

export const PERSON_MOVIES_PER_PAGE = 36;

export function usePersonDetail(personId?: string) {
  const [retryNonce, setRetryNonce] = useState(0);
  const [loadedId, setLoadedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo bộ lọc phim của nghệ sĩ từ URL để chia sẻ được kết quả lọc.
  const [searchQuery, setSearchQueryState] = useState(() => searchParams.get('q') ?? '');
  const [selectedYears, setSelectedYearsState] = useState<string[]>(() =>
    (searchParams.get('years') ?? '').split(',').filter(Boolean),
  );
  const [sortBy, setSortByState] = useState<PersonSortBy>(() =>
    searchParams.get('sort') === 'title' ? 'title' : 'year',
  );
  const [sortOrder, setSortOrderState] = useState<SortOrder>(() =>
    searchParams.get('order') === 'asc' ? 'asc' : 'desc',
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page'));
    return Number.isInteger(page) && page > 1 ? page : 1;
  });
  const [showFilters, setShowFilters] = useState(false);
  const requestSequence = useRef(0);

  const syncParams = useCallback(
    (
      next: {
        searchQuery: string;
        selectedYears: string[];
        sortBy: PersonSortBy;
        sortOrder: SortOrder;
      },
      page: number,
      options?: { replace?: boolean },
    ) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        const setOrDelete = (key: string, value: string) => {
          if (value) params.set(key, value);
          else params.delete(key);
        };
        setOrDelete('q', next.searchQuery.trim());
        setOrDelete('years', next.selectedYears.join(','));
        setOrDelete('sort', next.sortBy !== 'year' ? next.sortBy : '');
        setOrDelete('order', next.sortOrder !== 'desc' ? next.sortOrder : '');
        setOrDelete('page', page > 1 ? String(page) : '');
        return params;
      }, options);
    },
    [setSearchParams],
  );

  const applyFilterChange = useCallback(
    (
      changes: Partial<{
        searchQuery: string;
        selectedYears: string[];
        sortBy: PersonSortBy;
        sortOrder: SortOrder;
      }>,
      options?: { replace?: boolean },
    ) => {
      const next = {
        searchQuery: changes.searchQuery ?? searchQuery,
        selectedYears: changes.selectedYears ?? selectedYears,
        sortBy: changes.sortBy ?? sortBy,
        sortOrder: changes.sortOrder ?? sortOrder,
      };
      setSearchQueryState(next.searchQuery);
      setSelectedYearsState(next.selectedYears);
      setSortByState(next.sortBy);
      setSortOrderState(next.sortOrder);
      setCurrentPage(1);
      syncParams(next, 1, options);
    },
    [searchQuery, selectedYears, sortBy, sortOrder, syncParams],
  );

  const setSearchQuery = (value: string) =>
    applyFilterChange({ searchQuery: value }, { replace: true });
  const setSelectedYears = (years: string[]) => applyFilterChange({ selectedYears: years });
  const setSortBy = (value: PersonSortBy) => applyFilterChange({ sortBy: value });
  const setSortOrder = (value: SortOrder) => applyFilterChange({ sortOrder: value });

  const goToPage = (page: number) => {
    setCurrentPage(page);
    syncParams({ searchQuery, selectedYears, sortBy, sortOrder }, page);
  };

  useEffect(() => {
    const sequence = ++requestSequence.current;
    const controller = new AbortController();
    if (!personId) {
      setLoading(false);
      setPerson(null);
      setMovies([]);
      return () => controller.abort();
    }

    setLoading(true);
    setLoadedId(undefined);
    setPerson(null);
    setMovies([]);
    setError(null);
    getPersonDetails(personId, controller.signal)
      .then(async (personData) => {
        const movieCredits = personData
          ? await getPersonMovieCredits(Number(personId), controller.signal)
          : [];
        return { personData, movieCredits };
      })
      .then(({ personData, movieCredits }) => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        setPerson(personData);
        setMovies(movieCredits);
      })
      .catch((error) => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        console.error('Failed to fetch person data:', error);
        setError('Không thể tải thông tin người này');
        setPerson(null);
      })
      .finally(() => {
        if (!controller.signal.aborted && sequence === requestSequence.current) {
          setLoading(false);
          setLoadedId(personId);
        }
      });

    return () => controller.abort();
  }, [personId, retryNonce]);

  const availableYears = useMemo(() => getPersonAvailableYears(movies), [movies]);
  const filteredMovies = useMemo(
    () => filterAndSortPersonMovies(movies, searchQuery, selectedYears, sortBy, sortOrder),
    [movies, searchQuery, selectedYears, sortBy, sortOrder],
  );
  const paginatedMovies = useMemo(
    () => paginatePersonMovies(filteredMovies, currentPage, PERSON_MOVIES_PER_PAGE),
    [currentPage, filteredMovies],
  );

  return {
    loading: loading || loadedId !== personId,
    retry: () => setRetryNonce((n) => n + 1),
    person: loadedId === personId ? person : null,
    movies,
    error,
    searchQuery,
    setSearchQuery,
    selectedYears,
    setSelectedYears,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage: goToPage,
    showFilters,
    setShowFilters,
    availableYears,
    filteredMovies,
    paginatedMovies,
    totalPages: Math.ceil(filteredMovies.length / PERSON_MOVIES_PER_PAGE),
  };
}
