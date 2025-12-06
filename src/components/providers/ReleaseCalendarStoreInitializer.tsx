import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import useReleaseCalendarStore from '../../stores/releaseCalendarStore';
import { checkAndNotifyTodayEpisodes } from '../../services/ntfyService';

const ReleaseCalendarStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const {
    setMovies,
    setLoading,
    setHasFetchedInitial,
    fetchUpcomingEpisodes,
    hasFetchedInitial,
    movies,
    upcomingEpisodes
  } = useReleaseCalendarStore();

  // Subscribe to user's movies
  useEffect(() => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      setHasFetchedInitial(false);
      return;
    }

    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setMovies(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setMovies, setLoading, setHasFetchedInitial]);

  // Fetch upcoming episodes when user logs in and movies are loaded (only initial fetch)
  useEffect(() => {
    if (user && !hasFetchedInitial && movies.length > 0) {
      fetchUpcomingEpisodes(user.uid, movies);
      setHasFetchedInitial(true);
    }
  }, [user, hasFetchedInitial, movies.length, fetchUpcomingEpisodes, setHasFetchedInitial]);

  // Check and send notifications for today's episodes
  useEffect(() => {
    if (upcomingEpisodes.length > 0) {
      checkAndNotifyTodayEpisodes(upcomingEpisodes);
    }
  }, [upcomingEpisodes]);

  return null; // This component doesn't render anything
};

export default ReleaseCalendarStoreInitializer;