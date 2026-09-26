import { useState, useEffect } from 'react';
import { searchPeople } from '../services/tmdb';
import { TMDBPerson } from '@/types';

// Tìm kiếm diễn viên và đạo diễn.
export const useSearchPeople = (query: string, searchPage: number) => {
  const [peopleResults, setPeopleResults] = useState<TMDBPerson[]>([]);
  const [totalPeoplePages, setTotalPeoplePages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 2) {
      let ignore = false;
      const controller = new AbortController();
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const { results, totalPages } = await searchPeople(query, searchPage, controller.signal);
          if (!ignore) {
            setPeopleResults(results);
            setTotalPeoplePages(totalPages);
          }
        } catch (error) {
          if (!ignore) console.error("Error searching people:", error);
        } finally {
          if (!ignore) setLoading(false);
        }
      }, 500);
      return () => {
        ignore = true;
        clearTimeout(timer);
        controller.abort();
      };
    } else {
      setPeopleResults([]);
      setLoading(false);
    }
  }, [query, searchPage]);

  return { peopleResults, totalPeoplePages, isPeopleLoading: loading };
};
