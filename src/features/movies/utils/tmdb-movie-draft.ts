import { translateCountries } from '@/constants/countries';
import { Movie, TMDBMovieDetail } from '@/types';

interface TMDBMovieDraftInput {
  uid: string;
  id: number | string;
  mediaType: 'movie' | 'tv';
  details: TMDBMovieDetail;
  /** Dữ liệu dự phòng khi TMDB thiếu trường tương ứng. */
  fallbackTitle?: string;
  fallbackPoster?: string;
  fallbackReleaseDate?: string;
  status: 'history' | 'watchlist';
  rating: number;
  watchedAt: Date;
}

/** Payload thêm phim TMDB vào thư viện — dùng chung cho hộp "Đánh dấu đã xem" và quick-add. */
export const buildTMDBMovieDraft = ({
  uid,
  id,
  mediaType,
  details,
  fallbackTitle,
  fallbackPoster,
  fallbackReleaseDate,
  status,
  rating,
  watchedAt,
}: TMDBMovieDraftInput): Omit<Movie, 'docId'> => ({
  uid,
  id: Number(id),
  title: details.title || details.name || fallbackTitle || '',
  title_vi: '',
  poster_path: details.poster_path || fallbackPoster || '',
  runtime: details.runtime || details.episode_run_time?.[0] || 0,
  seasons: details.number_of_seasons || 0,
  watched_at: watchedAt,
  status,
  rating,
  review: '',
  tagline: details.tagline || '',
  genres: details.genres?.map((g) => g.name).join(', ') || '',
  release_date: details.release_date || details.first_air_date || fallbackReleaseDate || '',
  country: translateCountries(details.production_countries?.map((c) => c.name).join(', ') || ''),
  content: details.overview || '',
  source: 'tmdb',
  media_type: mediaType,
});
