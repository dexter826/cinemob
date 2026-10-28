import type { Movie } from '@/types';

export interface MovieFormData {
  title: string;
  title_vi: string;
  runtime: string;
  seasons: string;
  poster: string;
  date: string;
  time: string;
  rating: number;
  review: string;
  tagline: string;
  genres: string;
  releaseDate: string;
  country: string;
  content: string;
  is_review: boolean;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const formatDateInput = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatTimeInput = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const buildEmptyMovieForm = (now: Date): MovieFormData => ({
  title: '',
  title_vi: '',
  runtime: '',
  seasons: '',
  poster: '',
  date: formatDateInput(now),
  time: formatTimeInput(now),
  rating: 0,
  review: '',
  tagline: '',
  genres: '',
  releaseDate: '',
  country: '',
  content: '',
  is_review: false,
});

export const buildMovieFormFrom = (movie: Movie, watchedAt: Date): MovieFormData => ({
  title: movie.title,
  title_vi: movie.title_vi || '',
  runtime: movie.runtime?.toString() || '',
  seasons: movie.seasons?.toString() || '',
  poster: movie.poster_path,
  date: formatDateInput(watchedAt),
  time: formatTimeInput(watchedAt),
  rating: movie.rating || 0,
  review: movie.review || '',
  tagline: movie.tagline || '',
  genres: movie.genres || '',
  releaseDate: movie.release_date || '',
  country: movie.country || '',
  content: movie.content || '',
  is_review: movie.is_review || false,
});

export const toDateTimeInput = (date: Date): { date: string; time: string } => ({
  date: formatDateInput(date),
  time: formatTimeInput(date),
});
