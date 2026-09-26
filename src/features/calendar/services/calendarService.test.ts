import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Movie, TMDBEpisode, UpcomingEpisode } from '@/types';
import {
  getMovieDetailsWithLanguage,
  getTVShowUpcomingEpisodes,
  withLimit,
} from '@/features/search/services/tmdb';
import { fetchUpcomingEpisodesForMovies } from './calendarService';

vi.mock('@/features/search/services/tmdb', () => ({
  getMovieDetailsWithLanguage: vi.fn(),
  getTVShowUpcomingEpisodes: vi.fn(),
  withLimit: vi.fn(async (tasks: Array<() => Promise<unknown>>) =>
    Promise.all(tasks.map((task) => task())),
  ),
}));

const storage = new Map<string, string>();
const localStorageStub: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => Array.from(storage.keys())[index] ?? null,
  removeItem: (key) => {
    storage.delete(key);
  },
  setItem: (key, value) => {
    storage.set(key, String(value));
  },
};

const createMovie = (overrides: Partial<Movie> = {}): Movie => ({
  uid: 'u1',
  id: 10,
  title: 'Series',
  poster_path: '/poster.jpg',
  runtime: 45,
  watched_at: new Date(),
  source: 'tmdb',
  media_type: 'tv',
  status: 'history',
  ...overrides,
});

const createEpisode = (overrides: Partial<TMDBEpisode> = {}): TMDBEpisode => ({
  id: 1,
  name: 'Episode',
  overview: '',
  air_date: '2026-09-30',
  episode_number: 1,
  season_number: 1,
  still_path: null,
  vote_average: 0,
  ...overrides,
});

describe('calendarService', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', localStorageStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bỏ qua remote lookup khi danh sách không có TV series từ TMDB', async () => {
    const movies = [
      createMovie({ media_type: 'movie' }),
      createMovie({ id: 11, source: 'manual' }),
    ];

    await expect(fetchUpcomingEpisodesForMovies('u1', movies)).resolves.toEqual([]);

    expect(withLimit).not.toHaveBeenCalled();
    expect(getTVShowUpcomingEpisodes).not.toHaveBeenCalled();
  });

  it('dùng cache còn hạn và không gọi lại TMDB', async () => {
    const cached: UpcomingEpisode[] = [{
      seriesId: 10,
      seriesName: 'Series',
      seriesNameVi: 'Phim bộ',
      posterPath: '/poster.jpg',
      episode: createEpisode(),
      docId: 'doc-1',
    }];
    storage.set('upcoming_episodes_v2_u1', JSON.stringify({
      data: cached,
      timestamp: Date.now(),
    }));

    await expect(fetchUpcomingEpisodesForMovies('u1', [createMovie()])).resolves.toEqual(cached);

    expect(withLimit).not.toHaveBeenCalled();
    expect(getTVShowUpcomingEpisodes).not.toHaveBeenCalled();
  });

  it('refresh cache hết hạn, bổ sung tên tiếng Việt và sắp xếp tập theo ngày chiếu', async () => {
    storage.set('upcoming_episodes_v2_u1', JSON.stringify({
      data: [],
      timestamp: Date.now() - (25 * 60 * 60 * 1000),
    }));
    vi.mocked(getTVShowUpcomingEpisodes).mockResolvedValueOnce([
      createEpisode({ id: 1, air_date: '2026-10-02' }),
      createEpisode({ id: 2, air_date: '2026-09-28' }),
    ]);
    vi.mocked(getMovieDetailsWithLanguage).mockResolvedValueOnce({
      id: 10,
      name: 'Tên tiếng Việt',
      poster_path: '/poster.jpg',
    });

    const result = await fetchUpcomingEpisodesForMovies('u1', [
      createMovie({ docId: 'doc-1', title_vi: '' }),
    ]);

    expect(result.map((item) => item.episode.id)).toEqual([2, 1]);
    expect(result.every((item) => item.seriesNameVi === 'Tên tiếng Việt')).toBe(true);
    expect(getMovieDetailsWithLanguage).toHaveBeenCalledWith(10, 'tv', 'vi-VN');

    const refreshed = storage.get('upcoming_episodes_v2_u1');
    expect(refreshed).toBeTruthy();
    expect(JSON.parse(refreshed as string).data).toHaveLength(2);
  });
});
