import { afterEach, describe, expect, it, vi } from 'vitest';
import { tmdbFetch, withLimit } from './tmdbClient';
import { decodeMovieResultPage } from './tmdbDecoders';

vi.mock('@/constants', () => ({
  TMDB_API_KEY: 'test-key',
  TMDB_BASE_URL: 'https://tmdb.example',
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('withLimit', () => {
  it('giữ thứ tự kết quả và đánh dấu task lỗi thành null', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const tasks = [
      async () => 1,
      async () => {
        throw new Error('boom');
      },
      async () => 3,
    ];

    await expect(withLimit(tasks, 2)).resolves.toEqual([1, null, 3]);

  });

  it('trả mảng rỗng khi không có task', async () => {
    await expect(withLimit([], 3)).resolves.toEqual([]);
  });

  it('rejects a non-positive concurrency limit instead of hanging', async () => {
    await expect(withLimit([async () => 1], 0)).rejects.toThrow(RangeError);
  });
});

describe('tmdbFetch boundary decoding', () => {
  it('returns decoded data for a valid response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 1, title: 'Movie', poster_path: null }],
        total_pages: 2,
      }),
    }));

    await expect(tmdbFetch('search/movie', {}, decodeMovieResultPage)).resolves.toEqual({
      results: [{ id: 1, title: 'Movie', poster_path: null }],
      total_pages: 2,
    });

  });

  it('returns null when the response does not satisfy the decoder', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: 'invalid' }),
    }));

    await expect(tmdbFetch('search/movie', {}, decodeMovieResultPage)).resolves.toBeNull();

  });

  it('passes caller cancellation to fetch and returns null after abort', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    })));

    const request = tmdbFetch('search/movie', {}, decodeMovieResultPage, controller.signal);
    controller.abort();

    await expect(request).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to fetch from TMDB [search/movie]:',
      expect.anything(),
    );
  });

  it('combines a ten-second timeout signal with the request', async () => {
    const timeoutSignal = AbortSignal.abort(new DOMException('Timed out', 'TimeoutError'));
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchSpy = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.signal?.aborted).toBe(true);
      return Promise.reject(init?.signal?.reason);
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(tmdbFetch('search/movie', {}, decodeMovieResultPage)).resolves.toBeNull();

    expect(timeoutSpy).toHaveBeenCalledWith(10000);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalled();
  });
});
