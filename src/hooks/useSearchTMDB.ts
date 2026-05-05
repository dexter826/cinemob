import { useState, useEffect } from 'react';
import { searchMovies, getDiscoverMovies } from '../services/tmdb';
import { TMDBMovieResult } from '../types';

// Tìm kiếm và khám phá phim từ TMDB.
export const useSearchTMDB = (submittedQuery: string, searchPage: number, filters: any) => {
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [totalSearchPages, setTotalSearchPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [discoverMovies, setDiscoverMovies] = useState<TMDBMovieResult[]>([]);
  const [totalDiscoverPages, setTotalDiscoverPages] = useState(1);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  const isSearchMode = submittedQuery.trim().length > 2;

  useEffect(() => {
    if (isSearchMode) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const { results: data, totalPages } = await searchMovies(submittedQuery, searchPage, filters.year);
          setResults(data);
          setTotalSearchPages(totalPages);
        } catch (error) {
          console.error("Error searching movies:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (results.length > 0) {
      setResults([]);
      setTotalSearchPages(1);
    }
  }, [submittedQuery, searchPage, filters.year, filters.country, isSearchMode]);

  useEffect(() => {
    if (!isSearchMode) {
      const { year, country, rating, sortBy, type } = filters;
      const hasFilters = year || country || rating || sortBy !== 'popularity.desc' || type !== 'all';
      
      if (hasFilters) {
        const timer = setTimeout(async () => {
          setDiscoverLoading(true);
          try {
            const { results: data, totalPages } = await getDiscoverMovies({
              page: searchPage,
              year,
              country,
              rating,
              sortBy,
              type,
            });
            setDiscoverMovies(data);
            setTotalDiscoverPages(totalPages);
          } catch (error) {
            console.error("Error discovering movies:", error);
          } finally {
            setDiscoverLoading(false);
          }
        }, 300);
        return () => clearTimeout(timer);
      } else if (discoverMovies.length > 0) {
        setDiscoverMovies([]);
        setTotalDiscoverPages(1);
      }
    }
  }, [submittedQuery, searchPage, filters.year, filters.country, filters.rating, filters.sortBy, filters.type, isSearchMode]);

  return {
    results,
    totalSearchPages,
    isSearchLoading: loading,
    discoverMovies,
    totalDiscoverPages,
    isDiscoverLoading: discoverLoading,
    isSearchMode
  };
};
