import { useState, useEffect } from 'react';
import { searchMovies, getDiscoverMovies } from '../services/tmdb';
import { TMDBMovieResult } from '@/types';
import type { SearchFormFilters } from './useSearch';

// Tìm kiếm và khám phá phim từ TMDB.
export const useSearchTMDB = (
  submittedQuery: string,
  searchPage: number,
  filters: SearchFormFilters,
  retryNonce: number = 0,
) => {
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [totalSearchPages, setTotalSearchPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const [discoverMovies, setDiscoverMovies] = useState<TMDBMovieResult[]>([]);
  const [totalDiscoverPages, setTotalDiscoverPages] = useState(1);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState(false);

  const isSearchMode = submittedQuery.trim().length > 2;

  useEffect(() => {
    if (!isSearchMode) return;
    let ignore = false;
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setSearchError(false);
      try {
        const { results: data, totalPages } = await searchMovies(
          submittedQuery,
          searchPage,
          filters.year,
          controller.signal,
        );
        if (!ignore) {
          setResults(data);
          setTotalSearchPages(totalPages);
        }
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          console.error('Error searching movies:', error);
          setSearchError(true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [submittedQuery, searchPage, filters.year, isSearchMode, retryNonce]);

  const { year, country, rating, sortBy, type } = filters;

  useEffect(() => {
    if (isSearchMode) return;
    const hasFilters = year || country || rating || sortBy !== 'popularity.desc' || type !== 'all';

    if (!hasFilters) return;
    let ignore = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setDiscoverLoading(true);
      setDiscoverError(false);
      try {
        const { results: data, totalPages } = await getDiscoverMovies(
          {
            page: searchPage,
            year,
            country,
            rating,
            sortBy,
            type,
          },
          controller.signal,
        );
        if (!ignore) {
          setDiscoverMovies(data);
          setTotalDiscoverPages(totalPages);
        }
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          console.error('Error discovering movies:', error);
          setDiscoverError(true);
        }
      } finally {
        if (!ignore) setDiscoverLoading(false);
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [submittedQuery, searchPage, year, country, rating, sortBy, type, isSearchMode, retryNonce]);

  return {
    results,
    totalSearchPages,
    isSearchLoading: loading,
    searchError,
    discoverMovies,
    totalDiscoverPages,
    isDiscoverLoading: discoverLoading,
    discoverError,
    isSearchMode,
  };
};
