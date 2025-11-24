import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import useRecommendationsStore from '../../stores/recommendationsStore';

const RecommendationsStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const {
    setAiRecommendations,
    setTrendingMovies,
    setHistoryMovies,
    setHasFetchedInitial,
    initializeForUser,
    refreshRecommendations,
    hasFetchedInitial,
    historyMovies
  } = useRecommendationsStore();

  // Subscribe to user's movies
  useEffect(() => {
    if (!user) {
      setAiRecommendations([]);
      setTrendingMovies([]);
      setHistoryMovies([]);
      setHasFetchedInitial(false);
      return;
    }

    initializeForUser(user.uid);

    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setHistoryMovies(data);
    });

    return () => unsubscribe();
  }, [user, setAiRecommendations, setTrendingMovies, setHistoryMovies, setHasFetchedInitial, initializeForUser]);

  // Fetch recommendations when user logs in and history is loaded (only initial fetch)
  useEffect(() => {
    if (user && !hasFetchedInitial && historyMovies.length >= 0) {
      refreshRecommendations(user.uid);
      setHasFetchedInitial(true);
    }
  }, [user, hasFetchedInitial, historyMovies.length, refreshRecommendations, setHasFetchedInitial]);

  return null; // This component doesn't render anything
};

export default RecommendationsStoreInitializer;