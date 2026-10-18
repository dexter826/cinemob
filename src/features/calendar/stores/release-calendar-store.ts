import { create } from 'zustand';
import { Movie, UpcomingEpisode } from '@/types';
import { fetchEpisodesForMonth } from '../services/calendar-service';

interface ReleaseCalendarState {
  movies: Movie[];
  monthEpisodes: UpcomingEpisode[];
  monthKey: string | null;
  userId: string | null;
  loading: boolean;
  loadingEpisodes: boolean;
  episodesError: string | null;
  setMovies: (movies: Movie[]) => void;
  setLoading: (loading: boolean) => void;
  initializeForUser: (userId: string) => void;
  cancelMonthRequest: () => void;
  fetchMonthEpisodes: (userId: string, movies: Movie[], monthKey: string) => Promise<void>;
}

let calendarRequestId = 0;
const useReleaseCalendarStore = create<ReleaseCalendarState>((set, get) => ({
  movies: [],
  monthEpisodes: [],
  monthKey: null,
  userId: null,
  loading: true,
  loadingEpisodes: false,
  episodesError: null,
  setMovies: (movies) => set({ movies }),
  setLoading: (loading) => set({ loading }),
  initializeForUser: (userId) => {
    if (get().userId === userId) return;
    calendarRequestId++;
    set({
      userId,
      monthEpisodes: [],
      monthKey: null,
      loadingEpisodes: false,
      episodesError: null,
    });
  },
  cancelMonthRequest: () => {
    calendarRequestId++;
  },
  fetchMonthEpisodes: async (userId, movies, monthKey) => {
    const requestId = ++calendarRequestId;
    set({
      userId,
      monthKey,
      monthEpisodes:
        get().userId === userId && get().monthKey === monthKey ? get().monthEpisodes : [],
      episodesError: null,
      loadingEpisodes: true,
    });
    try {
      const episodes =
        movies.length === 0 ? [] : await fetchEpisodesForMonth(userId, movies, monthKey);
      if (requestId === calendarRequestId) set({ monthEpisodes: episodes });
    } catch {
      if (requestId === calendarRequestId) {
        set({ episodesError: 'Không thể tải đầy đủ lịch phát sóng. Vui lòng thử lại.' });
      }
    } finally {
      if (requestId === calendarRequestId) set({ loadingEpisodes: false });
    }
  },
}));

export default useReleaseCalendarStore;
