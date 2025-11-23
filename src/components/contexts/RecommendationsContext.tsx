import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import { getAIRecommendations } from '../../services/aiService';
import { searchMovies, getTrendingMovies } from '../../services/tmdbService';
import { TMDBMovieResult, Movie } from '../../types';

interface RecommendationsContextType {
  aiRecommendations: TMDBMovieResult[];
  trendingMovies: TMDBMovieResult[];
  isAiLoading: boolean;
  refreshRecommendations: (forceRefresh?: boolean) => Promise<void>;
}

const RecommendationsContext = createContext<RecommendationsContextType | undefined>(undefined);

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
};

export const RecommendationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState<TMDBMovieResult[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovieResult[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);
  const [lastAiHistoryLength, setLastAiHistoryLength] = useState(0);
  const [previouslyRecommendedTitles, setPreviouslyRecommendedTitles] = useState<Set<string>>(() => {
    if (!user) return new Set();
    const stored = sessionStorage.getItem(`previously_recommended_${user.uid}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Subscribe to user's movies
  useEffect(() => {
    if (!user) {
      setAiRecommendations([]);
      setTrendingMovies([]);
      setHistoryMovies([]);
      setLastAiHistoryLength(0);
      setPreviouslyRecommendedTitles(new Set());
      return;
    }

    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setHistoryMovies(data);
    });

    // Load previously recommended titles for this user
    const stored = sessionStorage.getItem(`previously_recommended_${user.uid}`);
    setPreviouslyRecommendedTitles(stored ? new Set(JSON.parse(stored)) : new Set());

    return () => unsubscribe();
  }, [user]);

  // Fetch recommendations when user logs in (not on history changes)
  useEffect(() => {
    if (user && historyMovies.length >= 0) { // Allow even with 0 movies for trending
      refreshRecommendations();
    }
  }, [user]); // Removed historyMovies.length dependency to prevent auto-refresh

  const refreshRecommendations = async (forceRefresh = false) => {
    if (!user) return;

    const watchedHistory = historyMovies.filter(m => (m.status || 'history') === 'history');

    // If user has watched at least 3 movies, try AI recommendations
    if (watchedHistory.length >= 3) {
      const cacheKey = `ai_recs_${user.uid}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      // Use cache if available and history length matches, unless force refresh
      if (cachedData && !forceRefresh) {
        const parsedCache = JSON.parse(cachedData);
        if (parsedCache.historyLength === watchedHistory.length && parsedCache.data) {
          setAiRecommendations(parsedCache.data);
          setLastAiHistoryLength(watchedHistory.length);
          return;
        }
      }

      setIsAiLoading(true);
      try {
        const aiRecs = await getAIRecommendations(watchedHistory, historyMovies, Array.from(previouslyRecommendedTitles));
        const tmdbPromises = aiRecs.map(async (rec) => {
          const searchRes = await searchMovies(rec.title);
          return searchRes.results.length > 0 ? searchRes.results[0] : null;
        });

        const tmdbResults = (await Promise.all(tmdbPromises)).filter(m => m !== null) as TMDBMovieResult[];
        setAiRecommendations(tmdbResults);
        setLastAiHistoryLength(watchedHistory.length);

        // Add new recommendations to previously recommended list
        const newTitles = aiRecs.map(rec => rec.title);
        const updatedPreviouslyRecommended = new Set([...previouslyRecommendedTitles, ...newTitles]);
        setPreviouslyRecommendedTitles(updatedPreviouslyRecommended);

        // Save to sessionStorage
        if (user) {
          sessionStorage.setItem(`previously_recommended_${user.uid}`, JSON.stringify([...updatedPreviouslyRecommended]));
        }

        sessionStorage.setItem(cacheKey, JSON.stringify({
          historyLength: watchedHistory.length,
          data: tmdbResults
        }));
      } catch (e) {
        console.error('AI recommendations failed, falling back to trending:', e);
        // Fallback to trending movies
        const trendingData = await getTrendingMovies();
        setTrendingMovies(trendingData.results);
      } finally {
        setIsAiLoading(false);
      }
    } else {
      // Not enough history, show trending movies
      const trendingData = await getTrendingMovies();
      setTrendingMovies(trendingData.results);
    }
  };

  return (
    <RecommendationsContext.Provider
      value={{
        aiRecommendations,
        trendingMovies,
        isAiLoading,
        refreshRecommendations,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
};