import { Timestamp } from 'firebase/firestore';

export interface Movie {
  docId?: string;
  uid: string;
  id: string | number;
  title: string;
  title_vi?: string;
  poster_path: string;
  runtime: number;
  seasons?: number;
  total_episodes?: number;
  watched_at: Timestamp | Date;
  source: 'tmdb' | 'manual';
  media_type?: 'movie' | 'tv';
  status?: 'history' | 'watchlist';
  rating?: number;
  review?: string;
  tagline?: string;
  genres?: string;
  release_date?: string;
  country?: string;
  content?: string;
  progress?: {
    current_season: number;
    current_episode: number;
    watched_episodes: number;
    is_completed: boolean;
  };
  is_review?: boolean;
}

export interface Album {
  docId?: string;
  uid: string;
  name: string;
  movieDocIds: string[];
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface UserData {
  previouslyRecommendedTitles: string[];
}

export interface Stats {
  totalMovies: number;
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
}
