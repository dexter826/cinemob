import { useCallback, useState } from 'react';
import { deleteField } from 'firebase/firestore';
import { updateMovie } from '../services/movie-service';
import useToastStore from '@/shared/stores/toast-store';
import { getMainTitle } from '../utils/movie-utils';
import { MESSAGES } from '@/constants/messages';
import { Movie } from '@/types';
import { formatDateInput } from '../utils/movie-form-utils';

const UNDO_QUICK_MS = 7000;

/**
 * Đổi trạng thái nhanh 1 chạm từ card/nút chính, không cần mở form:
 * bắt đầu xem series, +1 tập — đều kèm toast hoàn tác 7s.
 */
export function useQuickStatus() {
  const { showToast } = useToastStore();
  const [isPending, setIsPending] = useState(false);

  /** Bắt đầu theo dõi series đang "Sẽ xem": về Đã xem với tiến độ Mùa 1 Tập 1. */
  const startWatching = useCallback(
    async (movie: Movie) => {
      const docId = movie.docId;
      const previousWatchedAt = movie.watched_at;
      if (!docId || isPending) return;
      setIsPending(true);
      const today = formatDateInput(new Date());
      try {
        await updateMovie(docId, {
          status: 'history',
          watched_at: new Date(),
          progress: {
            current_season: 1,
            current_episode: 1,
            watched_episodes: 1,
            is_completed: false,
            season_dates: { '1': today },
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
              // Trường hợp không có tiến độ ban đầu thì xoá sạch tiến độ vừa tạo.
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

  /**
   * Ghi nhận thêm một tập đã xem. Truyền `episodesPerSeason` (từ TMDB) để tự sang mùa mới
   * khi hết mùa; thiếu dữ liệu thì chỉ tăng tập và hoàn thành theo tổng số tập.
   */
  const logEpisode = useCallback(
    async (movie: Movie, episodesPerSeason?: Record<number, number>) => {
      const docId = movie.docId;
      const progress = movie.progress;
      if (!docId || !progress || progress.is_completed || isPending) return;
      setIsPending(true);
      const previousProgress = progress;
      const previousWatchedAt = movie.watched_at;

      const seasonCap = episodesPerSeason?.[progress.current_season];
      const nextEpisode = progress.current_episode + 1;
      const rollSeason = typeof seasonCap === 'number' && seasonCap > 0 && nextEpisode > seasonCap;
      const nextSeason = rollSeason ? progress.current_season + 1 : progress.current_season;
      const nextCurrentEpisode = rollSeason ? 1 : nextEpisode;
      const totalEpisodes = movie.total_episodes || 0;
      const watchedEpisodes = progress.watched_episodes + 1;
      const isCompleted = totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;
      const today = formatDateInput(new Date());
      const seasonDates: Record<string, string> = { ...(progress.season_dates ?? {}) };
      if (!seasonDates[String(nextSeason)]) seasonDates[String(nextSeason)] = today;

      try {
        await updateMovie(docId, {
          watched_at: new Date(),
          progress: {
            current_season: nextSeason,
            current_episode: nextCurrentEpisode,
            watched_episodes: watchedEpisodes,
            is_completed: isCompleted,
            season_dates: seasonDates,
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
          : MESSAGES.MOVIE.LOG_EPISODE_SUCCESS(getMainTitle(movie), nextSeason, nextCurrentEpisode),
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
