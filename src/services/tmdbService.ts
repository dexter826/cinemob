import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import { TMDBMovieResult, TMDBMovieDetail } from '../types';

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!query || !TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    const results = (data.results || []).filter((item: TMDBMovieResult) => item.media_type === 'movie' || item.media_type === 'tv');
    return { results, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error("Failed to search movies:", error);
    return { results: [], totalPages: 0 };
  }
};

export const getMovieDetails = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBMovieDetail | null> => {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    return await response.json();
  } catch (error) {
    console.error("Failed to get movie details:", error);
    return null;
  }
};

export const getGenres = async (): Promise<{ id: number; name: string }[]> => {
  if (!TMDB_API_KEY) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=vi-VN`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Failed to get genres:", error);
    return [];
  }
};

export const getTrendingMovies = async (page: number = 1): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=vi-VN&page=${page}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    const results = (data.results || []).filter((item: TMDBMovieResult) => item.media_type === 'movie' || item.media_type === 'tv');
    return { results, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error("Failed to get trending movies:", error);
    return { results: [], totalPages: 0 };
  }
};
