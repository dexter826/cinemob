import { tmdbFetch, API_KEY } from './tmdbClient';
import { TMDBMovieResult, TMDBPerson } from '../../types';

// Tìm kiếm phim và TV show.
export const searchMovies = async (query: string, page: number = 1, year?: string): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!query || !API_KEY) return { results: [], totalPages: 0 };

  try {
    const params: Record<string, string> = {
      query,
      include_adult: 'false',
      page: page.toString(),
      language: 'vi-VN'
    };
    if (year) params.primary_release_year = year;

    const [movieData, tvData] = await Promise.all([
      tmdbFetch<{ results: any[]; total_pages: number }>(`search/movie`, params),
      tmdbFetch<{ results: any[]; total_pages: number }>(`search/tv`, { ...params, first_air_date_year: year || '' })
    ]);

    const movieResults = (movieData?.results || []).map((item: any) => ({ ...item, media_type: 'movie' as const }));
    const tvResults = (tvData?.results || []).map((item: any) => ({ ...item, media_type: 'tv' as const }));

    const combinedResults = [...movieResults, ...tvResults]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20);

    return { 
      results: combinedResults, 
      totalPages: Math.max(movieData?.total_pages || 1, tvData?.total_pages || 1) 
    };
  } catch (error) {
    console.error("Failed to search movies:", error);
    return { results: [], totalPages: 0 };
  }
};

// Tìm kiếm người nổi tiếng.
export const searchPeople = async (query: string, page: number = 1): Promise<{ results: TMDBPerson[]; totalPages: number }> => {
  const data = await tmdbFetch<{ results: TMDBPerson[]; total_pages: number }>(`search/person`, {
    query,
    include_adult: 'false',
    page: page.toString()
  });
  return { results: data?.results || [], totalPages: data?.total_pages || 1 };
};
