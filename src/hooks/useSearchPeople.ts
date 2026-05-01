import { useState, useEffect } from 'react';
import { searchPeople } from '../services/tmdb';
import { TMDBPerson } from '../types';

// Tìm kiếm diễn viên và đạo diễn.
export const useSearchPeople = (query: string, searchPage: number) => {
  const [peopleResults, setPeopleResults] = useState<TMDBPerson[]>([]);
  const [totalPeoplePages, setTotalPeoplePages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 2) {
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const { results, totalPages } = await searchPeople(query, searchPage);
          setPeopleResults(results);
          setTotalPeoplePages(totalPages);
        } catch (error) {
          console.error("Error searching people:", error);
        } finally {
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPeopleResults([]);
    }
  }, [query, searchPage]);

  return { peopleResults, totalPeoplePages, isPeopleLoading: loading };
};
