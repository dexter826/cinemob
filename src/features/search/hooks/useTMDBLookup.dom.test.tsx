// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { checkMovieExists } from '@/features/movies/services/movieService';
import { getMovieDetails, getMovieDetailsWithLanguage } from '../services/tmdb';
import { useTMDBLookup } from './useTMDBLookup';

vi.mock('@/features/movies/services/movieService', () => ({ checkMovieExists: vi.fn() }));
vi.mock('../services/tmdb', () => ({
  getMovieDetails: vi.fn(async (id: number) => ({ id, title: `Movie ${id}`, poster_path: null })),
  getMovieDetailsWithLanguage: vi.fn().mockResolvedValue(null),
  getTVShowEpisodeInfo: vi.fn(),
}));
vi.mock('@/shared/stores/toastStore', () => ({
  default: () => ({ showToast: vi.fn() }),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
};

describe('useTMDBLookup', () => {
  it('does not let an older movie lookup overwrite the latest existence state', async () => {
    const olderExists = deferred<boolean>();
    vi.mocked(checkMovieExists)
      .mockReturnValueOnce(olderExists.promise)
      .mockResolvedValueOnce(false);
    const { result } = renderHook(() => useTMDBLookup());
    const user = { uid: 'user-a' } as never;

    let older!: Promise<unknown>;
    let newer!: Promise<unknown>;
    act(() => {
      older = result.current.fetchDetails(1, 'movie', user);
      newer = result.current.fetchDetails(2, 'movie', user);
    });
    await act(async () => { await newer; });
    expect(result.current.movieExists).toBe(false);

    olderExists.resolve(true);
    await act(async () => { await older; });

    expect(result.current.movieExists).toBe(false);
    expect(getMovieDetails).toHaveBeenCalledWith(2, 'movie', expect.any(AbortSignal));
    expect(getMovieDetailsWithLanguage).toHaveBeenCalledWith(2, 'movie', 'vi-VN', expect.any(AbortSignal));
  });
});
