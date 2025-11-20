import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface Movie {
  docId?: string; // Firestore Document ID
  uid: string;    // Owner ID
  id: string | number; // TMDB ID or Manual ID
  title: string;
  poster_path: string;
  runtime: number; // Minutes
  seasons?: number; // Number of seasons for TV shows
  watched_at: Timestamp | Date;
  source: 'tmdb' | 'manual';
  media_type?: 'movie' | 'tv';
  rating?: number; // 1-5
  review?: string;
}

export interface TMDBMovieResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv' | 'person';
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
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface Stats {
  totalMovies: number;
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}