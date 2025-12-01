import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import { TMDBMovieResult, TMDBMovieDetail, TMDBVideo, TMDBCredits, PersonMovie, TMDBPerson } from '../types';

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!query || !TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    // Search movies
    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
    );

    // Search TV shows
    const tvResponse = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
    );

    if (!movieResponse.ok || !tvResponse.ok) throw new Error('TMDB API Error');

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    // Add media_type
    const movieResults = (movieData.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
    const tvResults = (tvData.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));

    // Combine results
    let combinedResults = [...movieResults, ...tvResults];

    // Sort by popularity descending
    combinedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // Limit to 20 results per page for consistency
    combinedResults = combinedResults.slice(0, 20);

    // Update Vietnamese titles for Vietnamese movies
    for (let movie of combinedResults) {
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

    // Use max total pages
    const totalPages = Math.max(movieData.total_pages || 1, tvData.total_pages || 1);

    return { results: combinedResults, totalPages };
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
    // Fetch 22 movies (2 extra as backup) but only display 20
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&page=${page}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    let results = (data.results || []).filter((item: TMDBMovieResult) => item.media_type === 'movie' || item.media_type === 'tv');

    // Limit to 22 results (20 to display + 2 backup)
    results = results.slice(0, 22);

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
  rating?: string;
  sortBy?: string;
  type?: 'all' | 'movie' | 'tv';
} = {}): Promise<{ results: TMDBMovieResult[]; totalPages: number }> => {
  if (!TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    const page = params.page || 1;
    const sortBy = params.sortBy || 'popularity.desc';

    let combinedResults: any[] = [];
    let totalPages = 1;

    const fetchMovies = async () => {
      const movieQueryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: page.toString(),
        sort_by: sortBy,
        include_adult: 'false',
        include_video: 'false',
      });

      if (params.genres && params.genres.length > 0) {
        movieQueryParams.append('with_genres', params.genres.join(','));
      }
      if (params.year) movieQueryParams.append('primary_release_year', params.year);
      if (params.country) movieQueryParams.append('with_origin_country', params.country);
      if (params.rating) {
        movieQueryParams.append('vote_average.gte', params.rating);
        movieQueryParams.append('vote_count.gte', '100');
      }

      const movieResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?${movieQueryParams}`);
      if (!movieResponse.ok) throw new Error('TMDB API Error');
      const movieData = await movieResponse.json();
      const movieResults = (movieData.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
      return { results: movieResults, totalPages: movieData.total_pages || 1 };
    };

    const fetchTV = async () => {
      const tvQueryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: page.toString(),
        sort_by: sortBy,
        include_adult: 'false',
        include_video: 'false',
      });

      if (params.genres && params.genres.length > 0) {
        tvQueryParams.append('with_genres', params.genres.join(','));
      }
      if (params.year) tvQueryParams.append('first_air_date_year', params.year);
      if (params.country) tvQueryParams.append('with_origin_country', params.country);
      if (params.rating) {
        tvQueryParams.append('vote_average.gte', params.rating);
        tvQueryParams.append('vote_count.gte', '100');
      }

      const tvResponse = await fetch(`${TMDB_BASE_URL}/discover/tv?${tvQueryParams}`);
      if (!tvResponse.ok) throw new Error('TMDB API Error');
      const tvData = await tvResponse.json();
      const tvResults = (tvData.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));
      return { results: tvResults, totalPages: tvData.total_pages || 1 };
    };

    if (params.type === 'movie') {
      const { results, totalPages: tp } = await fetchMovies();
      combinedResults = results;
      totalPages = tp;
    } else if (params.type === 'tv') {
      const { results, totalPages: tp } = await fetchTV();
      combinedResults = results;
      totalPages = tp;
    } else {
      // 'all' or undefined
      const [movieData, tvData] = await Promise.all([fetchMovies(), fetchTV()]);
      combinedResults = [...movieData.results, ...tvData.results];
      totalPages = Math.max(movieData.totalPages, tvData.totalPages);
    }

    // Apply sorting based on sortBy parameter
    if (sortBy === 'popularity.desc') {
      combinedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'vote_average.desc') {
      combinedResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'primary_release_date.desc') {
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === 'primary_release_date.asc') {
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortBy === 'title.asc') {
      combinedResults.sort((a, b) => {
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === 'title.desc') {
      combinedResults.sort((a, b) => {
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        return titleB.localeCompare(titleA);
      });
    }

    return { results: combinedResults, totalPages };
  } catch (error) {
    console.error("Failed to discover movies:", error);
    return { results: [], totalPages: 0 };
  }
};

export const getMovieCredits = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBCredits | null> => {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    return await response.json();
  } catch (error) {
    console.error("Failed to get movie credits:", error);
    return null;
  }
};

export const getPersonMovieCredits = async (personId: number): Promise<PersonMovie[]> => {
  if (!TMDB_API_KEY) return [];

  try {
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/person/${personId}/tv_credits?api_key=${TMDB_API_KEY}`)
    ]);

    if (!movieResponse.ok || !tvResponse.ok) throw new Error('TMDB API Error');

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    const movies: PersonMovie[] = (movieData.cast || []).map((item: any) => ({
      ...item,
      media_type: 'movie' as const,
    })).concat((movieData.crew || []).map((item: any) => ({
      ...item,
      media_type: 'movie' as const,
    })));

    const tvShows: PersonMovie[] = (tvData.cast || []).map((item: any) => ({
      ...item,
      media_type: 'tv' as const,
    })).concat((tvData.crew || []).map((item: any) => ({
      ...item,
      media_type: 'tv' as const,
    })));

    // Combine and remove duplicates based on id and media_type
    const combined = [...movies, ...tvShows];
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
    );

    // Sort by release date descending
    return unique.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
      const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Failed to get person movie credits:", error);
    return [];
  }
};

// Get TV season details including episode count
export const getTVSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ episode_count: number } | null> => {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    return {
      episode_count: data.episodes?.length || 0
    };
  } catch (error) {
    console.error("Failed to get TV season details:", error);
    return null;
  }
};

// Get all seasons details for a TV show and calculate total episodes
export const getTVShowEpisodeInfo = async (tvId: number, numberOfSeasons: number): Promise<{
  total_episodes: number;
  episodes_per_season: { [season: number]: number };
}> => {
  if (!TMDB_API_KEY) return { total_episodes: 0, episodes_per_season: {} };

  try {
    const seasonPromises = [];
    for (let i = 1; i <= numberOfSeasons; i++) {
      seasonPromises.push(getTVSeasonDetails(tvId, i));
    }

    const seasons = await Promise.all(seasonPromises);

    let totalEpisodes = 0;
    const episodesPerSeason: { [season: number]: number } = {};

    seasons.forEach((season, index) => {
      if (season) {
        const seasonNumber = index + 1;
        const episodeCount = season.episode_count;
        episodesPerSeason[seasonNumber] = episodeCount;
        totalEpisodes += episodeCount;
      }
    });

    return {
      total_episodes: totalEpisodes,
      episodes_per_season: episodesPerSeason
    };
  } catch (error) {
    console.error("Failed to get TV show episode info:", error);
    return { total_episodes: 0, episodes_per_season: {} };
  }
};

// Search for people (actors, directors, etc.)
export const searchPeople = async (query: string, page: number = 1): Promise<{ results: TMDBPerson[]; totalPages: number }> => {
  if (!query || !TMDB_API_KEY) return { results: [], totalPages: 0 };

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
    );

    if (!response.ok) throw new Error('TMDB API Error');

    const data = await response.json();
    return { results: data.results || [], totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error("Failed to search people:", error);
    return { results: [], totalPages: 0 };
  }
};
