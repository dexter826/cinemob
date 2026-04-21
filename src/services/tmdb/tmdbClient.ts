import { TMDB_API_KEY, TMDB_BASE_URL } from '../../constants';

/** Giới hạn số lượng request đồng thời để tránh flood network. */
export const withLimit = <T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> => {
  return new Promise((resolve) => {
    const results: T[] = [];
    let completed = 0;
    let running = 0;
    let index = 0;

    const runNext = async () => {
      if (index >= tasks.length) {
        if (running === 0) resolve(results);
        return;
      }

      const currentIndex = index++;
      running++;
      try {
        results[currentIndex] = await tasks[currentIndex]();
      } catch (error) {
        results[currentIndex] = null as any;
      } finally {
        running--;
        completed++;
        runNext();
      }
    };

    for (let i = 0; i < Math.min(limit, tasks.length); i++) {
      runNext();
    }
  });
};

export const BASE_URL = TMDB_BASE_URL;
export const API_KEY = TMDB_API_KEY;

/** Helper để fetch dữ liệu từ TMDB. */
export const tmdbFetch = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> => {
  if (!API_KEY) return null;

  try {
    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      ...params
    });

    const response = await fetch(`${BASE_URL}/${endpoint}?${queryParams.toString()}`);
    if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB [${endpoint}]:`, error);
    return null;
  }
};
