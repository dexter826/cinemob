export interface TMDBMovieResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  english_title?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv' | 'person';
  genre_ids?: number[];
  origin_country?: string[];
  vote_average?: number;
  popularity?: number;
}

export interface TMDBMovieDetail {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  overview?: string;
  genres?: { id: number; name: string }[];
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  tagline?: string;
  status?: string;
  production_countries?: { iso_3166_1: string; name: string }[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  published_at: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  birthday?: string;
  deathday?: string;
  gender?: number;
  place_of_birth?: string;
  biography?: string;
  homepage?: string;
  known_for?: TMDBMovieResult[]; // For search results
}

export interface TMDBCast extends TMDBPerson {
  character: string;
  order: number;
}

export interface TMDBCrew extends TMDBPerson {
  job: string;
  department: string;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface PersonMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  character?: string;
  job?: string;
  department?: string;
}

// Release Calendar types
export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  runtime?: number;
}

export interface UpcomingEpisode {
  seriesId: number;
  seriesName: string;
  seriesNameVi?: string;
  posterPath: string | null;
  episode: TMDBEpisode;
  docId?: string;
}
