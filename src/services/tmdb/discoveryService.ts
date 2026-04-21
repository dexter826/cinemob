import { tmdbFetch, API_KEY } from './tmdbClient';
import { TMDBMovieResult } from '../../types';

/** Lấy danh sách phim đang xu hướng. */
export const getTrendingMovies = async (page: number = 1): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  const data = await tmdbFetch<{ results: TMDBMovieResult[]; total_pages: number }>(`trending/all/week`, {
    page: page.toString(),
    language: 'vi-VN'
  });
  
  let results = (data?.results || []).filter((item: TMDBMovieResult) => item.media_type === 'movie' || item.media_type === 'tv');
  results = results.slice(0, 22);

  return { results, totalPages: data?.total_pages || 1 };
};

/** Khám phá phim với các bộ lọc nâng cao. */
export const getDiscoverMovies = async (params: {
  page?: number;
  genres?: string[];
  year?: string;
  country?: string;
  rating?: string;
  sortBy?: string;
  type?: 'all' | 'movie' | 'tv';
} = {}): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!API_KEY) return { results: [], totalPages: 0 };

  const page = params.page || 1;
  const sortBy = params.sortBy || 'popularity.desc';

  const buildParams = (type: 'movie' | 'tv') => {
    const p: Record<string, string> = {
      page: page.toString(),
      sort_by: sortBy,
      include_adult: 'false',
      include_video: 'false',
      language: 'vi-VN',
    };
    if (params.genres?.length) p.with_genres = params.genres.join(',');
    if (params.year) p[type === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = params.year;
    if (params.country) p.with_origin_country = params.country;
    if (params.rating) {
      p['vote_average.gte'] = params.rating;
      p['vote_count.gte'] = '100';
    }
    return p;
  };

  try {
    let combinedResults: any[] = [];
    let totalPages = 1;

    if (params.type === 'movie') {
      const data = await tmdbFetch<{ results: any[]; total_pages: number }>(`discover/movie`, buildParams('movie'));
      combinedResults = (data?.results || []).map(i => ({ ...i, media_type: 'movie' }));
      totalPages = data?.total_pages || 1;
    } else if (params.type === 'tv') {
      const data = await tmdbFetch<{ results: any[]; total_pages: number }>(`discover/tv`, buildParams('tv'));
      combinedResults = (data?.results || []).map(i => ({ ...i, media_type: 'tv' }));
      totalPages = data?.total_pages || 1;
    } else {
      const [movieData, tvData] = await Promise.all([
        tmdbFetch<{ results: any[]; total_pages: number }>(`discover/movie`, buildParams('movie')),
        tmdbFetch<{ results: any[]; total_pages: number }>(`discover/tv`, buildParams('tv'))
      ]);
      combinedResults = [
        ...(movieData?.results || []).map(i => ({ ...i, media_type: 'movie' })),
        ...(tvData?.results || []).map(i => ({ ...i, media_type: 'tv' }))
      ];
      totalPages = Math.max(movieData?.total_pages || 1, tvData?.total_pages || 1);
    }

    // Sorting logic (same as before)
    if (sortBy === 'popularity.desc') {
      combinedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'vote_average.desc') {
      combinedResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy.startsWith('primary_release_date')) {
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01').getTime();
        const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01').getTime();
        return sortBy.endsWith('desc') ? dateB - dateA : dateA - dateB;
      });
    } else if (sortBy.startsWith('title')) {
      combinedResults.sort((a, b) => {
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        return sortBy.endsWith('asc') ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      });
    }

    return { results: combinedResults, totalPages };
  } catch (error) {
    console.error("Failed to discover movies:", error);
    return { results: [], totalPages: 0 };
  }
};
