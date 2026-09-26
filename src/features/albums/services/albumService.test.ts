import { beforeEach, describe, expect, it, vi } from 'vitest';
import { arrayRemove, arrayUnion, writeBatch } from 'firebase/firestore';
import { syncMovieAlbums } from './albumService';

const batch = {
  update: vi.fn(),
  commit: vi.fn(),
};

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  arrayRemove: vi.fn((value) => ({ remove: value })),
  arrayUnion: vi.fn((value) => ({ add: value })),
  collection: vi.fn(() => ({})),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, collectionName, id) => ({ path: `${collectionName}/${id}` })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(() => ({})),
  writeBatch: vi.fn(() => batch),
}));

vi.mock('@/lib/firebase', () => ({ db: {} }));

describe('syncMovieAlbums', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    batch.commit.mockResolvedValue(undefined);
  });

  it('syncs added and removed album ids without requiring album snapshots', async () => {
    await syncMovieAlbums('movie-1', ['old', 'kept'], ['kept', 'new']);

    expect(arrayRemove).toHaveBeenCalledWith('movie-1');
    expect(arrayUnion).toHaveBeenCalledWith('movie-1');
    expect(batch.update).toHaveBeenCalledWith(
      { path: 'albums/old' },
      expect.objectContaining({ movieDocIds: { remove: 'movie-1' } }),
    );
    expect(batch.update).toHaveBeenCalledWith(
      { path: 'albums/new' },
      expect.objectContaining({ movieDocIds: { add: 'movie-1' } }),
    );
    expect(batch.update).toHaveBeenCalledTimes(2);
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(writeBatch).toHaveBeenCalledOnce();
  });
});
