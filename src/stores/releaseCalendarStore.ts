import { create } from 'zustand';
import { Movie, UpcomingEpisode } from '../types';

// Cache duration for upcoming episodes (in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to check if cache is expired
const isExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

interface ReleaseCalendarState {
  movies: Movie[];
  upcomingEpisodes: UpcomingEpisode[];
  loading: boolean;
  loadingEpisodes: boolean;
  hasFetchedInitial: boolean;
  setMovies: (movies: Movie[]) => void;
  setUpcomingEpisodes: (episodes: UpcomingEpisode[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingEpisodes: (loading: boolean) => void;
  setHasFetchedInitial: (fetched: boolean) => void;
  initializeForUser: (userId: string) => void;
  fetchUpcomingEpisodes: (userId: string, movies: Movie[]) => Promise<void>;
}

const useReleaseCalendarStore = create<ReleaseCalendarState>((set, get) => ({
  movies: [],
  upcomingEpisodes: [],
  loading: true,
  loadingEpisodes: false,
  hasFetchedInitial: false,
  setMovies: (movies) => set({ movies }),
  setUpcomingEpisodes: (episodes) => set({ upcomingEpisodes: episodes }),
  setLoading: (loading) => set({ loading }),
  setLoadingEpisodes: (loading) => set({ loadingEpisodes: loading }),
  setHasFetchedInitial: (fetched) => set({ hasFetchedInitial: fetched }),
  initializeForUser: (userId: string) => {
    // Reset state for new user
    set({
      movies: [],
      upcomingEpisodes: [],
      loading: true,
      loadingEpisodes: false,
      hasFetchedInitial: false
    });
  },
  fetchUpcomingEpisodes: async (userId: string, movies: Movie[]) => {
    const state = get();

    // Get TV series from user's collection
    const tvSeries = movies.filter(m =>
      m.media_type === 'tv' &&
      m.source === 'tmdb'
    );

    if (tvSeries.length === 0) {
      set({ upcomingEpisodes: [], loadingEpisodes: false });
      return;
    }

    // Check cache
    const cacheKey = `upcoming_episodes_${userId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        if (parsedCache.timestamp &&
            !isExpired(parsedCache.timestamp, CACHE_DURATION) &&
            parsedCache.data) {
          set({
            upcomingEpisodes: parsedCache.data,
            loadingEpisodes: false
          });
          return;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    set({ loadingEpisodes: true });
    const allUpcoming: UpcomingEpisode[] = [];

    try {
      // Import here to avoid circular dependencies
      const { getTVShowUpcomingEpisodes, getMovieDetailsWithLanguage } = await import('../services/tmdbService');

      for (const series of tvSeries) {
        try {
          const tvId = Number(series.id);
          const episodes = await getTVShowUpcomingEpisodes(tvId);

          // Get Vietnamese name if available
          let seriesNameVi = series.title_vi;
          if (!seriesNameVi) {
            const viDetails = await getMovieDetailsWithLanguage(tvId, 'tv', 'vi-VN');
            seriesNameVi = viDetails?.name;
          }

          for (const ep of episodes) {
            allUpcoming.push({
              seriesId: tvId,
              seriesName: series.title,
              seriesNameVi: seriesNameVi,
              posterPath: series.poster_path,
              episode: ep,
              docId: series.docId
            });
          }
        } catch (error) {
          console.error(`Failed to fetch episodes for ${series.title}:`, error);
        }
      }

      // Sort by air date
      allUpcoming.sort((a, b) => new Date(a.episode.air_date).getTime() - new Date(b.episode.air_date).getTime());

      set({ upcomingEpisodes: allUpcoming, loadingEpisodes: false });

      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: allUpcoming,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to fetch upcoming episodes:', error);
      set({ loadingEpisodes: false });
    }
  },
}));

export default useReleaseCalendarStore;