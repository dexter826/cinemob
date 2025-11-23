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
    let results = (data.results || []).filter((item: TMDBMovieResult) => item.media_type === 'movie' || item.media_type === 'tv');

    // Cập nhật tiêu đề tiếng Việt cho phim từ Việt Nam
    for (let movie of results) {
      const detail = await getMovieDetails(movie.id, movie.media_type as 'movie' | 'tv');
      if (detail && detail.production_countries?.some(country => country.iso_3166_1 === 'VN')) {
        const viDetail = await getMovieDetailsWithLanguage(movie.id, movie.media_type as 'movie' | 'tv', 'vi-VN');
        if (viDetail) {
          if (movie.media_type === 'movie') {
            movie.title = viDetail.title || movie.title;
          } else {
            movie.name = viDetail.name || movie.name;
          }
        }
      }
    }

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

export const getMovieDetailsWithLanguage = async (id: number, mediaType: 'movie' | 'tv' = 'movie', language: string = 'vi-VN'): Promise<TMDBMovieDetail | null> => {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=${language}`
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

export const getCountries = async (): Promise<{ iso_3166_1: string; english_name: string; native_name: string }[]> => {
  if (!TMDB_API_KEY) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/configuration/countries?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Failed to get countries:", error);
    return [];
  }
};
