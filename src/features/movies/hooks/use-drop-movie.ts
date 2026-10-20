import { useCallback, useState } from 'react';
import { updateMovie } from '../services/movie-service';
import useToastStore from '@/shared/stores/toast-store';
import { getMainTitle } from '../utils/movie-utils';
import { MESSAGES } from '@/constants';
import { Movie } from '@/types';

const UNDO_DROP_MS = 7000;

/** Bỏ dở một bộ phim đang theo dõi, kèm toast hoàn tác; và đưa phim bỏ dở trở lại đang theo dõi. */
export function useDropMovie() {
  const { showToast } = useToastStore();
  const [isPending, setIsPending] = useState(false);

  const dropMovie = useCallback(
    async (movie: Movie) => {
      const docId = movie.docId;
      if (!docId || isPending) return;
      setIsPending(true);
      try {
        await updateMovie(docId, { status: 'dropped' });
      } catch {
        showToast(MESSAGES.MOVIE.DROP_ERROR, 'error');
        return;
      } finally {
        setIsPending(false);
      }
      showToast(MESSAGES.MOVIE.DROP_SUCCESS(getMainTitle(movie)), 'info', UNDO_DROP_MS, {
        label: MESSAGES.MOVIE.UNDO,
        onAction: () => {
          void updateMovie(docId, { status: 'history' }).catch(() => {
            showToast(MESSAGES.MOVIE.RESUME_ERROR, 'error');
          });
        },
      });
    },
    [showToast, isPending],
  );

  const resumeMovie = useCallback(
    async (movie: Movie) => {
      const docId = movie.docId;
      if (!docId || isPending) return;
      setIsPending(true);
      try {
        await updateMovie(docId, { status: 'history' });
        showToast(MESSAGES.MOVIE.RESUME_SUCCESS(getMainTitle(movie)), 'success');
      } catch {
        showToast(MESSAGES.MOVIE.RESUME_ERROR, 'error');
      } finally {
        setIsPending(false);
      }
    },
    [showToast, isPending],
  );

  return { dropMovie, resumeMovie, isPending };
}
