import { useState, useEffect } from 'react';
import { searchMovies, getDiscoverMovies } from '../services/tmdb';
import { TMDBMovieResult } from '@/types';
import type { SearchFormFilters } from './use-search';

export type SearchMode = 'home' | 'search' | 'discover';
export function getSearchMode(query: string, filters: SearchFormFilters): SearchMode {
  if (query.trim().length > 2) return 'search';
  return filters.year ||
    filters.country ||
    filters.rating ||
    filters.sortBy !== 'popularity.desc' ||
    filters.type !== 'all'
    ? 'discover'
    : 'home';
}

export const useSearchTMDB = (
  submittedQuery: string,
  searchPage: number,
  filters: SearchFormFilters,
  retryNonce = 0,
) => {
  const mode = getSearchMode(submittedQuery, filters);
  const { year, country, rating, sortBy, type } = filters;
  const key = JSON.stringify([
    mode,
    submittedQuery.trim(),
    searchPage,
    year,
    country,
    rating,
    sortBy,
    type,
    retryNonce,
  ]);
  const [result, setResult] = useState<{
    key: string;
    data: TMDBMovieResult[];
    pages: number;
    error: boolean;
    pending: boolean;
  }>({ key: '', data: [], pages: 1, error: false, pending: false });
  useEffect(() => {
    if (mode === 'home') {
      setResult({ key, data: [], pages: 1, error: false, pending: false });
      return;
    }
    const controller = new AbortController();
    setResult({ key, data: [], pages: 1, error: false, pending: true });
    const fetchData = async () => {
      try {
        const response =
          mode === 'search'
            ? await searchMovies(submittedQuery, searchPage, year, controller.signal, type)
            : await getDiscoverMovies(
                { page: searchPage, year, country, rating, sortBy, type },
                controller.signal,
              );
        if (!controller.signal.aborted)
          setResult({
            key,
            data: response.results,
            pages: response.totalPages,
            error: false,
            pending: false,
          });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('TMDB request failed:', error);
          setResult({ key, data: [], pages: 1, error: true, pending: false });
        }
      }
    };
    const timer = mode === 'discover' ? setTimeout(() => void fetchData(), 300) : undefined;
    if (mode === 'search') void fetchData();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [key, mode, submittedQuery, searchPage, year, country, rating, sortBy, type]);
  const current = result.key === key;
  const data = current ? result.data : [];
  const loading = mode !== 'home' && (!current || result.pending);
  const error = current && result.error;
  return {
    mode,
    isSearchMode: mode === 'search',
    results: mode === 'search' ? data : [],
    discoverMovies: mode === 'discover' ? data : [],
    totalSearchPages: current ? result.pages : 1,
    totalDiscoverPages: current ? result.pages : 1,
    isSearchLoading: mode === 'search' && loading,
    isDiscoverLoading: mode === 'discover' && loading,
    searchError: mode === 'search' && error,
    discoverError: mode === 'discover' && error,
  };
};
