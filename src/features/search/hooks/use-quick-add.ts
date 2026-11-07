import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToastStore from '@/shared/stores/toast-store';
import { getMovieDetails } from '../services/tmdb';
import { addMovie } from '@/features/movies/services/movie-service';
import { translateCountries } from '@/constants/countries';
import { MESSAGES } from '@/constants/messages';
import { getMainTitleForTMDB } from '@/shared/utils/tmdb';
import { TMDBMovieResult } from '@/types';

export const resolveTMDBMediaType = (movie: TMDBMovieResult): 'movie' | 'tv' =>
  movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date) ? 'tv' : 'movie';

/**
 * Thêm nhanh 1 kết quả TMDB vào "Sẽ xem" ngay trên card tìm kiếm:
 * lấy đủ thông tin từ TMDB rồi lưu, không mở form.
 */
export function useQuickAddTMDB() {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const addWatchlist = useCallback(
    async (movie: TMDBMovieResult) => {
      if (!user || pendingKey) return;
      const mediaType = resolveTMDBMediaType(movie);
      const key = `${mediaType}-${movie.id}`;
      setPendingKey(key);
      try {
        const details = await getMovieDetails(Number(movie.id), mediaType);
        if (!details) throw new Error('TMDB details unavailable');
        await addMovie({
          uid: user.uid,
          id: Number(movie.id),
          title: details.title || details.name || getMainTitleForTMDB(movie),
          title_vi: '',
          poster_path: details.poster_path || movie.poster_path || '',
          runtime: details.runtime || details.episode_run_time?.[0] || 0,
          seasons: details.number_of_seasons || 0,
          watched_at: new Date(),
          status: 'watchlist',
          rating: 0,
          review: '',
          tagline: details.tagline || '',
          genres: details.genres?.map((g) => g.name).join(', ') || '',
          release_date: details.release_date || details.first_air_date || '',
          country: translateCountries(
            details.production_countries?.map((c) => c.name).join(', ') || '',
          ),
          content: details.overview || '',
          source: 'tmdb',
          media_type: mediaType,
        });
        showToast(MESSAGES.MOVIE.ADD_SUCCESS, 'success');
      } catch {
        showToast(MESSAGES.MOVIE.SAVE_ERROR, 'error');
      } finally {
        setPendingKey(null);
      }
    },
    [user, pendingKey, showToast],
  );

  return { addWatchlist, pendingKey };
}
