import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDocs } from 'firebase/firestore';
import { checkMovieExists, mapDocToMovie } from './movieService';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({})),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(() => ({})),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('movieService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('map Firestore data hợp lệ sang Movie và giữ các enum được hỗ trợ', () => {
    const watchedAt = new Date('2026-09-01T00:00:00Z');

    const movie = mapDocToMovie('doc-1', {
      uid: 'u1',
      id: 42,
      title: 'Movie',
      title_vi: 'Phim',
      runtime: 120,
      watched_at: watchedAt,
      source: 'manual',
      media_type: 'tv',
      status: 'watchlist',
      rating: 9,
      is_review: true,
    });

    expect(movie).toMatchObject({
      docId: 'doc-1',
      uid: 'u1',
      id: 42,
      title: 'Movie',
      title_vi: 'Phim',
      runtime: 120,
      watched_at: watchedAt,
      source: 'manual',
      media_type: 'tv',
      status: 'watchlist',
      rating: 9,
      is_review: true,
    });
  });

  it('chuẩn hóa field sai kiểu về fallback an toàn', () => {
    const movie = mapDocToMovie('doc-2', {
      uid: 123,
      id: null,
      title: 99,
      runtime: '120',
      source: 'unknown',
      media_type: 'unknown',
      status: 'unknown',
      rating: '9',
      is_review: 'yes',
    });

    expect(movie).toMatchObject({
      docId: 'doc-2',
      uid: '',
      id: '',
      title: '',
      runtime: 0,
      source: 'tmdb',
      media_type: 'movie',
      status: 'history',
      rating: 0,
      is_review: false,
    });
  });

  it('phân biệt movie tồn tại và không tồn tại từ Firestore snapshot', async () => {
    vi.mocked(getDocs)
      .mockResolvedValueOnce({ empty: false } as never)
      .mockResolvedValueOnce({ empty: true } as never);

    await expect(checkMovieExists('u1', 42)).resolves.toBe(true);
    await expect(checkMovieExists('u1', 43)).resolves.toBe(false);
  });

  it('không nuốt lỗi khi kiểm tra movie tồn tại', async () => {
    const error = new Error('permission denied');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(getDocs).mockRejectedValueOnce(error);

    await expect(checkMovieExists('u1', 42)).rejects.toBe(error);

    errorSpy.mockRestore();
  });
});
