import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import useReleaseCalendarStore from '../../stores/releaseCalendarStore';
import useMovieStore from '../../stores/movieStore';

const ReleaseCalendarStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const {
    setMovies,
    setLoading,
    setHasFetchedInitial,
    fetchUpcomingEpisodes,
    hasFetchedInitial,
  } = useReleaseCalendarStore();

  const { movies, loading: moviesLoading } = useMovieStore();

  useEffect(() => {
    setMovies(movies);
    setLoading(moviesLoading);
  }, [movies, moviesLoading, setMovies, setLoading]);

  useEffect(() => {
    if (user && !hasFetchedInitial && movies.length > 0) {
      fetchUpcomingEpisodes(user.uid, movies);
      setHasFetchedInitial(true);
    }
  }, [user, hasFetchedInitial, movies.length, fetchUpcomingEpisodes, setHasFetchedInitial]);

  return null; // This component doesn't render anything
};

export default ReleaseCalendarStoreInitializer;