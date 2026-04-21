import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import useRecommendationsStore from '../../stores/recommendationsStore';
import useMovieStore from '../../stores/movieStore';

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

  const { movies, loading: moviesLoading } = useMovieStore();

  useEffect(() => {
    if (!user) {
      setAiRecommendations([]);
      setTrendingMovies([]);
      setHistoryMovies([]);
      setHasFetchedInitial(false);
      return;
    }

    const init = async () => {
      await initializeForUser(user.uid);
    };
    init();

    setHistoryMovies(movies);
  }, [user, movies, setAiRecommendations, setTrendingMovies, setHistoryMovies, setHasFetchedInitial, initializeForUser]);

  useEffect(() => {
    if (user && !hasFetchedInitial && historyMovies.length >= 0) {
      refreshRecommendations(user.uid);
      setHasFetchedInitial(true);
    }
  }, [user, hasFetchedInitial, historyMovies.length, refreshRecommendations, setHasFetchedInitial]);

  return null; // This component doesn't render anything
};

export default RecommendationsStoreInitializer;