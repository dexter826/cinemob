import { create } from 'zustand';
import { Movie, UpcomingEpisode } from '../types';
import { fetchUpcomingEpisodesForMovies } from '../services/calendarService';

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

// Quản lý trạng thái lịch phát sóng tập phim mới.
const useReleaseCalendarStore = create<ReleaseCalendarState>((set) => ({
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
  initializeForUser: (_userId: string) => {
    set({
      movies: [],
      upcomingEpisodes: [],
      loading: true,
      loadingEpisodes: false,
      hasFetchedInitial: false
    });
  },
  fetchUpcomingEpisodes: async (userId: string, movies: Movie[]) => {
    set({ loadingEpisodes: true });
    try {
      const episodes = await fetchUpcomingEpisodesForMovies(userId, movies);
      set({ upcomingEpisodes: episodes, loadingEpisodes: false });
    } catch (error) {
      console.error('Failed to fetch upcoming episodes:', error);
      set({ loadingEpisodes: false });
    }
  },
}));

export default useReleaseCalendarStore;