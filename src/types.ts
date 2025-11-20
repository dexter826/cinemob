import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface Movie {
  docId?: string; // Firestore Document ID
  uid: string;    // Owner ID
  id: string | number; // TMDB ID or Manual ID
  title: string;
  poster_path: string;
  runtime: number; // Minutes
  watched_at: Timestamp | Date;
  source: 'tmdb' | 'manual';
  rating?: number; // 1-5
  review?: string;
}

export interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  runtime: number;
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