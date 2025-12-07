import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface Movie {
  docId?: string; // Firestore Document ID
  uid: string;    // Owner ID
  id: string | number; // TMDB ID or Manual ID
  title: string;
  title_vi?: string; // Vietnamese title
  poster_path: string;
  runtime: number; // Minutes
  seasons?: number; // Number of seasons for TV shows
  total_episodes?: number; // Total episodes for TV shows
  watched_at: Timestamp | Date;
  source: 'tmdb' | 'manual';
  media_type?: 'movie' | 'tv';
  status?: 'history' | 'watchlist';
  rating?: number; // 1-5
  review?: string;
  tagline?: string;
  genres?: string;
  release_date?: string;
  country?: string; // Production country
  content?: string; // Movie content/overview

  // Progress tracking for series
  progress?: {
    current_season: number;      // Current season watching
    current_episode: number;     // Current episode watching
    watched_episodes: number;    // Total episodes watched
    is_completed: boolean;       // Finished watching or not
  };
}

export interface Album {
  docId?: string;
  uid: string;
  name: string;
  movieDocIds: string[];
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface TMDBMovieResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  english_title?: string; // English title for consistency
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

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

export interface Stats {
  totalMovies: number;
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
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
  docId?: string; // Reference to user's saved movie
}