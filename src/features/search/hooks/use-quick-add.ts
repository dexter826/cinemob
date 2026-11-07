import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToastStore from '@/shared/stores/toast-store';
import { getMovieDetails } from '../services/tmdb';
import { addMovie } from '@/features/movies/services/movie-service';
import { buildTMDBMovieDraft } from '@/features/movies/utils/tmdb-movie-draft';
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
        await addMovie(
          buildTMDBMovieDraft({
            uid: user.uid,
            id: movie.id,
            mediaType,
            details,
            fallbackTitle: getMainTitleForTMDB(movie),
            fallbackPoster: movie.poster_path || '',
            status: 'watchlist',
            rating: 0,
            watchedAt: new Date(),
          }),
        );
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
