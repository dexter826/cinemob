import { useEffect, useMemo, useRef, useState } from 'react';
import type { PersonMovie, TMDBPerson } from '@/types';
import { getPersonDetails, getPersonMovieCredits } from '../services/tmdb';
import { filterAndSortPersonMovies, getPersonAvailableYears, paginatePersonMovies, type PersonSortBy, type SortOrder } from '../utils/personSelectors';

const ITEMS_PER_PAGE = 20;

export function usePersonDetail(personId?: string) {
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<PersonSortBy>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const requestSequence = useRef(0);

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
    setError(null);
    Promise.all([getPersonDetails(personId, controller.signal), getPersonMovieCredits(Number(personId), controller.signal)])
      .then(([personData, movieCredits]) => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        if (!personData) throw new Error('Failed to fetch person details');
        setPerson(personData);
        setMovies(movieCredits);
      })
      .catch(error => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        console.error('Failed to fetch person data:', error);
        setError('Không thể tải thông tin người này');
        setPerson(null);
      })
      .finally(() => {
        if (!controller.signal.aborted && sequence === requestSequence.current) setLoading(false);
      });

    return () => controller.abort();
  }, [personId]);

  useEffect(() => setCurrentPage(1), [searchQuery, selectedYears, sortBy, sortOrder]);

  const availableYears = useMemo(() => getPersonAvailableYears(movies), [movies]);
  const filteredMovies = useMemo(
    () => filterAndSortPersonMovies(movies, searchQuery, selectedYears, sortBy, sortOrder),
    [movies, searchQuery, selectedYears, sortBy, sortOrder],
  );
  const paginatedMovies = useMemo(
    () => paginatePersonMovies(filteredMovies, currentPage, ITEMS_PER_PAGE),
    [currentPage, filteredMovies],
  );

  return {
    loading, person, movies, error, searchQuery, setSearchQuery,
    selectedYears, setSelectedYears, sortBy, setSortBy, sortOrder, setSortOrder,
    currentPage, setCurrentPage, showFilters, setShowFilters, availableYears,
    filteredMovies, paginatedMovies, totalPages: Math.ceil(filteredMovies.length / ITEMS_PER_PAGE),
  };
}
