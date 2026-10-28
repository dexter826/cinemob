import { tmdbFetch, API_KEY, withLimit } from './client';
import { TMDBMovieResult, TMDBPerson, TMDBMovieDetail } from '@/types';
import { decodeMovieDetail, decodeMovieResultPage, decodePersonPage } from './decoders';

export const searchMovies = async (
  query: string,
  page: number = 1,
  year?: string,
  signal?: AbortSignal,
  type: 'all' | 'movie' | 'tv' = 'all',
): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!query) return { results: [], totalPages: 0 };
  if (!API_KEY) throw new Error('TMDB API key is unavailable');

  try {
    const params: Record<string, string> = {
      query,
      include_adult: 'false',
      page: page.toString(),
      language: 'vi-VN',
    };
    if (year) params.primary_release_year = year;

    const emptyPage = { results: [], total_pages: 0 };
    const [movieData, tvData] = await Promise.all([
      type === 'tv'
        ? Promise.resolve(emptyPage)
        : tmdbFetch(`search/movie`, params, decodeMovieResultPage, signal),
      type === 'movie'
        ? Promise.resolve(emptyPage)
        : tmdbFetch(
            `search/tv`,
            { ...params, first_air_date_year: year || '' },
            decodeMovieResultPage,
            signal,
          ),
    ]);

    if (!movieData || !tvData) throw new Error('Incomplete TMDB search response');
    const rawMovies = (movieData?.results || []).map((item) => ({
      ...item,
      media_type: 'movie' as const,
    }));
    const rawTv = (tvData?.results || []).map((item) => ({ ...item, media_type: 'tv' as const }));

    const moviesWithDetails = await withLimit(
      rawMovies.map((movie) => async () => {
        try {
          const details = await tmdbFetch<TMDBMovieDetail>(
            `movie/${movie.id}`,
            { language: 'vi-VN' },
            decodeMovieDetail,
            signal,
          );
          return {
            ...movie,
            origin_country: details?.production_countries?.map((c) => c.iso_3166_1) || [],
          };
        } catch {
          return movie;
        }
      }),
      5,
    );

    const combinedResults = [
      ...moviesWithDetails.filter((m): m is (typeof rawMovies)[number] => m !== null),
      ...rawTv,
    ]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20);

    return {
      results: combinedResults,
      totalPages: Math.max(movieData?.total_pages || 1, tvData?.total_pages || 1),
    };
  } catch (error) {
    console.error('Failed to search movies:', error);
    throw error;
  }
};

export const searchPeople = async (
  query: string,
  page: number = 1,
  signal?: AbortSignal,
): Promise<{ results: TMDBPerson[]; totalPages: number }> => {
  const data = await tmdbFetch(
    `search/person`,
    {
      query,
      include_adult: 'false',
      page: page.toString(),
    },
    decodePersonPage,
    signal,
  );
  return { results: data?.results || [], totalPages: data?.total_pages || 1 };
};
