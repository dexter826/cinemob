import { Timestamp } from 'firebase/firestore';

export type MovieStatus = 'history' | 'watchlist' | 'dropped';

interface MovieBase {
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
  status?: MovieStatus;
  rating?: number;
  review?: string;
  tagline?: string;
  genres?: string;
  release_date?: string;
  country?: string;
  content?: string;
  progress?: {
    current_episode: number;
    watched_episodes: number;
    is_completed: boolean;
  };
  is_review?: boolean;
  notifications_muted?: boolean;
}

export type Movie =
  (MovieBase & { media_type?: 'movie' }) | (MovieBase & { media_type: 'tv'; season: number });

export interface Album {
  docId?: string;
  uid: string;
  name: string;
  movieDocIds: string[];
  /** Tối đa 3 docId người dùng chọn làm bìa; rỗng/quá khứ thì rơi về bìa tự động. */
  coverMovieDocIds?: string[];
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Stats {
  totalMovies: number;
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
}

export interface ProfileMovie {
  id: string | number;
  title: string;
  title_vi?: string;
  poster_path?: string;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  rating?: number;
  watched_at?: Timestamp | Date;
  is_review?: boolean;
  season?: number;
  seasons?: number;
}

export type MemberGender = 'male' | 'female' | 'other';

export interface MemberProfile {
  displayName: string;
  photoURL?: string;
  bio?: string;
  gender?: MemberGender;
  dob?: string;
  isMovieListHidden: boolean;
  updatedAt: Timestamp | Date;
  totalCount: number;
  movies: ProfileMovie[];
}
