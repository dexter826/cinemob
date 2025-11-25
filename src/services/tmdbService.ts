import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import { TMDBMovieResult, TMDBMovieDetail, TMDBVideo } from '../types';

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

export const getMovieVideos = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBVideo[]> => {
  if (!TMDB_API_KEY) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    return (data.results || []).filter((video: TMDBVideo) => video.type === 'Trailer' && video.site === 'YouTube');
  } catch (error) {
    console.error("Failed to get movie videos:", error);
    return [];
  }
};

export const getGenres = async (): Promise<{ id: number; name: string }[]> => {
  if (!TMDB_API_KEY) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
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
      `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&page=${page}`
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

export const getDiscoverMovies = async (params: {
  page?: number;
  genres?: string[];
  year?: string;
  country?: string;
} = {}): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    const page = params.page || 1;

    // Discover movies
    const movieQueryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
    });

    // Support multiple genres - TMDB uses comma-separated for AND, pipe for OR
    // Using comma (AND) means movies must have ALL selected genres
    // Using pipe (OR) means movies must have AT LEAST ONE selected genre
    if (params.genres && params.genres.length > 0) {
      movieQueryParams.append('with_genres', params.genres.join(','));
    }
    if (params.year) movieQueryParams.append('primary_release_year', params.year);
    if (params.country) movieQueryParams.append('with_origin_country', params.country);

    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${movieQueryParams}`
    );

    // Discover TV shows
    const tvQueryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
    });

    if (params.genres && params.genres.length > 0) {
      tvQueryParams.append('with_genres', params.genres.join(','));
    }
    if (params.year) tvQueryParams.append('first_air_date_year', params.year);
    if (params.country) tvQueryParams.append('with_origin_country', params.country);

    const tvResponse = await fetch(
      `${TMDB_BASE_URL}/discover/tv?${tvQueryParams}`
    );

    if (!movieResponse.ok || !tvResponse.ok) throw new Error('TMDB API Error');

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    // Combine results and add media_type
    const movieResults = (movieData.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
    const tvResults = (tvData.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));

    // Combine and sort by popularity (assuming popularity is a number)
    const combinedResults = [...movieResults, ...tvResults].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // For pagination, since we're combining, we need to handle total pages differently
    // For simplicity, use the max of the two total pages
    const totalPages = Math.max(movieData.total_pages || 1, tvData.total_pages || 1);

    return { results: combinedResults, totalPages };
  } catch (error) {
    console.error("Failed to discover movies:", error);
    return { results: [], totalPages: 0 };
  }
};
