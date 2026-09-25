import { TMDB_API_KEY, TMDB_BASE_URL } from '@/constants';

// Giới hạn request đồng thời. Trả về null cho task lỗi để caller phân biệt partial-failure.
export const withLimit = <T>(tasks: (() => Promise<T>)[], limit: number): Promise<Array<T | null>> => {
  if (tasks.length === 0) return Promise.resolve([]);
  return new Promise((resolve) => {
    const results: Array<T | null> = [];
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
        console.error('withLimit task failed:', error);
        results[currentIndex] = null;
      } finally {
        running--;
        void runNext();
      }
    };

    for (let i = 0; i < Math.min(limit, tasks.length); i++) {
      void runNext();
    }
  });
};

export const BASE_URL = TMDB_BASE_URL;
export const API_KEY = TMDB_API_KEY;

// Gọi API từ TMDB.
export const tmdbFetch = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> => {
  if (!API_KEY) return null;

  try {
    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      ...params
    });

    const response = await fetch(`${BASE_URL}/${endpoint}?${queryParams.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`, { cause: { endpoint } });
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch from TMDB [${endpoint}]:`, error);
    return null;
  }
};
