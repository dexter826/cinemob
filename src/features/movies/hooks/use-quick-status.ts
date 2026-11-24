import { useCallback, useState } from 'react';
import { deleteField } from 'firebase/firestore';
import { updateMovie } from '../services/movie-service';
import useToastStore from '@/shared/stores/toast-store';
import { getMainTitle } from '../utils/movie-utils';
import { MESSAGES } from '@/constants/messages';
import { Movie } from '@/types';

const UNDO_QUICK_MS = 7000;

export function useQuickStatus() {
  const { showToast } = useToastStore();
  const [isPending, setIsPending] = useState(false);

  const startWatching = useCallback(
    async (movie: Movie) => {
      const docId = movie.docId;
      const previousWatchedAt = movie.watched_at;
      if (!docId || isPending) return;
      setIsPending(true);
      try {
        await updateMovie(docId, {
          status: 'history',
          watched_at: new Date(),
          progress: {
            current_episode: 1,
            watched_episodes: 1,
            is_completed: false,
          },
        });
      } catch {
        showToast(MESSAGES.MOVIE.QUICK_STATUS_ERROR, 'error');
        return;
      } finally {
        setIsPending(false);
      }
      showToast(
        MESSAGES.MOVIE.START_WATCHING_SUCCESS(getMainTitle(movie)),
        'success',
        UNDO_QUICK_MS,
        {
          label: MESSAGES.MOVIE.UNDO,
          onAction: () => {
            void updateMovie(docId, {
              status: 'watchlist',
              watched_at: previousWatchedAt,
              progress: (movie.progress ?? deleteField()) as Movie['progress'],
            }).catch(() => {
              showToast(MESSAGES.MOVIE.QUICK_STATUS_ERROR, 'error');
            });
          },
        },
      );
    },
    [showToast, isPending],
  );

  const logEpisode = useCallback(
    async (movie: Movie) => {
      const docId = movie.docId;
      const progress = movie.progress;
      if (!docId || !progress || progress.is_completed || isPending) return;
      setIsPending(true);
      const previousProgress = progress;
      const previousWatchedAt = movie.watched_at;

      const totalEpisodes = movie.total_episodes || 0;
      if (totalEpisodes > 0 && progress.watched_episodes >= totalEpisodes) return;
      const rawNext = progress.current_episode + 1;
      const nextEpisode =
        totalEpisodes > 0 ? Math.min(rawNext, totalEpisodes) : rawNext;
      const watchedEpisodes = progress.watched_episodes + 1;
      const isCompleted = totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;

      try {
        await updateMovie(docId, {
          watched_at: new Date(),
          progress: {
            current_episode: nextEpisode,
            watched_episodes: watchedEpisodes,
            is_completed: isCompleted,
          },
        });
      } catch {
        showToast(MESSAGES.MOVIE.LOG_EPISODE_ERROR, 'error');
        return;
      } finally {
        setIsPending(false);
      }
      showToast(
        isCompleted
          ? MESSAGES.MOVIE.LOG_EPISODE_COMPLETED(getMainTitle(movie))
          : MESSAGES.MOVIE.LOG_EPISODE_SUCCESS(
              getMainTitle(movie),
              movie.season ?? 1,
              nextEpisode,
            ),
        'success',
        UNDO_QUICK_MS,
        {
          label: MESSAGES.MOVIE.UNDO,
          onAction: () => {
            void updateMovie(docId, {
              watched_at: previousWatchedAt,
              progress: previousProgress,
            }).catch(() => {
              showToast(MESSAGES.MOVIE.LOG_EPISODE_ERROR, 'error');
            });
          },
        },
      );
    },
    [showToast, isPending],
  );

  return { startWatching, logEpisode, isPending };
}
