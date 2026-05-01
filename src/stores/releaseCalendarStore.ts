import { create } from 'zustand';
import { Movie, UpcomingEpisode } from '../types';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

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

// Quản lý lịch phát sóng tập phim mới.
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

    const tvSeries = movies.filter(m =>
      m.media_type === 'tv' &&
      m.source === 'tmdb'
    );

    if (tvSeries.length === 0) {
      set({ upcomingEpisodes: [], loadingEpisodes: false });
      return;
    }

    const cacheKey = `upcoming_episodes_v2_${userId}`;
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
      const { getTVShowUpcomingEpisodes, getMovieDetailsWithLanguage, withLimit } = await import('../services/tmdb');

      const tasks = tvSeries.map(series => async () => {
        try {
          const tvId = Number(series.id);
          const episodes = await getTVShowUpcomingEpisodes(tvId);

          let seriesNameVi = series.title_vi;
          if (!seriesNameVi) {
            const viDetails = await getMovieDetailsWithLanguage(tvId, 'tv', 'vi-VN');
            seriesNameVi = viDetails?.name;
          }

          const upcomingForSeries: UpcomingEpisode[] = episodes.map(ep => ({
            seriesId: tvId,
            seriesName: series.title,
            seriesNameVi: seriesNameVi,
            posterPath: series.poster_path,
            episode: ep,
            docId: series.docId
          }));

          return upcomingForSeries;
        } catch (error) {
          console.error(`Failed to fetch episodes for ${series.title}:`, error);
          return [];
        }
      });

      const results = await withLimit(tasks, 5);
      results.forEach(res => {
        if (res) allUpcoming.push(...res);
      });

      allUpcoming.sort((a, b) => new Date(a.episode.air_date).getTime() - new Date(b.episode.air_date).getTime());

      set({ upcomingEpisodes: allUpcoming, loadingEpisodes: false });

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