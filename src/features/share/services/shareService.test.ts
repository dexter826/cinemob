import { beforeEach, describe, expect, it, vi } from 'vitest';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Movie } from '@/types';
import {
  buildShareMovies,
  getPublicShare,
  setShareEnabled,
  upsertPublicShare,
} from './shareService';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ path: 'public_shares/u1' })),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  setDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

const createMovie = (overrides: Partial<Movie> = {}): Movie => ({
  uid: 'u1',
  id: 1,
  title: 'Movie',
  poster_path: '',
  runtime: 90,
  watched_at: new Date(),
  source: 'tmdb',
  status: 'history',
  ...overrides,
});

describe('shareService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trả null khi public share không tồn tại hoặc thiếu isEnabled hợp lệ', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => false } as never)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ displayName: 'CineMOB' }),
      } as never);

    await expect(getPublicShare('u1')).resolves.toBeNull();
    await expect(getPublicShare('u1')).resolves.toBeNull();
  });

  it('lọc movie không hợp lệ và chuẩn hóa field tùy chọn khi đọc public share', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        displayName: 123,
        photoURL: 456,
        isEnabled: true,
        movies: [
          { id: 1, title: 'Valid movie', rating: 8 },
          { id: null, title: 'Missing id' },
          { id: 2, title: 99 },
        ],
      }),
    } as never);

    const result = await getPublicShare('u1');

    expect(result).toMatchObject({
      displayName: '',
      photoURL: undefined,
      isEnabled: true,
      totalCount: 1,
      movies: [{ id: 1, title: 'Valid movie', rating: 8 }],
    });
  });

  it('chỉ đưa history vào public share và giới hạn tối đa 500 phim', () => {
    const historyMovies = Array.from({ length: 501 }, (_, index) =>
      createMovie({
        id: index + 1,
        title: `Movie ${index + 1}`,
      }),
    );
    const watchlistMovie = createMovie({
      id: 9999,
      title: 'Watchlist',
      status: 'watchlist',
    });

    const result = buildShareMovies([...historyMovies, watchlistMovie]);

    expect(result).toHaveLength(500);
    expect(result[0]).toMatchObject({
      id: 1,
      title: 'Movie 1',
      title_vi: '',
      poster_path: '',
      media_type: 'movie',
      release_date: '',
      rating: 0,
    });
    expect(result.some((movie) => movie.id === 9999)).toBe(false);
  });

  it('ghi public share bằng merge và server timestamp', async () => {
    await upsertPublicShare('u1', {
      displayName: 'User',
      isEnabled: true,
      totalCount: 0,
      movies: [],
    });
    await setShareEnabled('u1', false);

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'public_shares', 'u1');
    expect(serverTimestamp).toHaveBeenCalledTimes(2);
    expect(setDoc).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({
        displayName: 'User',
        isEnabled: true,
        updatedAt: 'SERVER_TIMESTAMP',
      }),
      { merge: true },
    );
    expect(setDoc).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { isEnabled: false, updatedAt: 'SERVER_TIMESTAMP' },
      { merge: true },
    );
  });
});
