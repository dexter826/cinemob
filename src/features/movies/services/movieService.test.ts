import { beforeEach, describe, expect, it, vi } from 'vitest';
import { arrayRemove, getDocs, writeBatch } from 'firebase/firestore';
import { checkMovieExists, deleteMovie, mapDocToMovie } from './movieService';

const batch = {
  update: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn(),
};

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  arrayRemove: vi.fn((value) => ({ arrayRemove: value })),
  collection: vi.fn(() => ({})),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, collectionName, id) => ({ path: `${collectionName}/${id}` })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(() => ({})),
  writeBatch: vi.fn(() => batch),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('movieService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    batch.commit.mockResolvedValue(undefined);
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

  it('removes the movie id from owned albums and deletes the movie in one batch', async () => {
    const albumRef = { path: 'albums/album-1' };
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ ref: albumRef }],
    } as never);

    await deleteMovie('user-a', 'movie-1');

    expect(arrayRemove).toHaveBeenCalledWith('movie-1');
    expect(batch.update).toHaveBeenCalledWith(albumRef, {
      movieDocIds: { arrayRemove: 'movie-1' },
    });
    expect(batch.delete).toHaveBeenCalledWith({ path: 'movies/movie-1' });
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(writeBatch).toHaveBeenCalledOnce();
  });
});
