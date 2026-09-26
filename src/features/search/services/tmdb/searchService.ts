import { tmdbFetch, API_KEY, withLimit } from './tmdbClient';
import { TMDBMovieResult, TMDBPerson, TMDBMovieDetail } from '@/types';
import { decodeMovieDetail, decodeMovieResultPage, decodePersonPage } from './tmdbDecoders';

// Tìm kiếm phim và TV show.
export const searchMovies = async (query: string, page: number = 1, year?: string, signal?: AbortSignal): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
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
      tmdbFetch(`search/movie`, params, decodeMovieResultPage, signal),
      tmdbFetch(`search/tv`, { ...params, first_air_date_year: year || '' }, decodeMovieResultPage, signal)
    ]);

    const rawMovies = (movieData?.results || []).map((item) => ({ ...item, media_type: 'movie' as const }));
    const rawTv = (tvData?.results || []).map((item) => ({ ...item, media_type: 'tv' as const }));

    const moviesWithDetails = await withLimit(
      rawMovies.map(movie => async () => {
        try {
          const details = await tmdbFetch<TMDBMovieDetail>(`movie/${movie.id}`, { language: 'vi-VN' }, decodeMovieDetail, signal);
          return {
            ...movie,
            origin_country: details?.production_countries?.map((c) => c.iso_3166_1) || []
          };
        } catch {
          return movie;
        }
      }),
      5
    );

    const combinedResults = [...moviesWithDetails.filter((m): m is typeof rawMovies[number] => m !== null), ...rawTv]
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
export const searchPeople = async (query: string, page: number = 1, signal?: AbortSignal): Promise<{ results: TMDBPerson[]; totalPages: number }> => {
  const data = await tmdbFetch(`search/person`, {
    query,
    include_adult: 'false',
    page: page.toString()
  }, decodePersonPage, signal);
  return { results: data?.results || [], totalPages: data?.total_pages || 1 };
};
