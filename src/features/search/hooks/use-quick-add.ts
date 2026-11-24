import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToastStore from '@/shared/stores/toast-store';
import { getMovieDetails, getTVSeasonDetails } from '../services/tmdb';
import { addMovie } from '@/features/movies/services/movie-service';
import { buildTMDBMovieDraft } from '@/features/movies/utils/tmdb-movie-draft';
import { MESSAGES } from '@/constants/messages';
import { getMainTitleForTMDB } from '@/shared/utils/tmdb';
import { TMDBMovieResult } from '@/types';

export const resolveTMDBMediaType = (movie: TMDBMovieResult): 'movie' | 'tv' =>
  movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date) ? 'tv' : 'movie';

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
        let seasonEpisodeCount: number | undefined;
        let seasonPosterPath: string | null = null;
        if (mediaType === 'tv') {
          const season = await getTVSeasonDetails(Number(movie.id), 1);
          seasonEpisodeCount = season?.episode_count || undefined;
          seasonPosterPath = season?.poster_path ?? null;
        }
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
            season: 1,
            seasonEpisodeCount,
            seasonPosterPath,
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
