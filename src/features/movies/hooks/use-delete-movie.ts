import { useAuth } from '@/features/auth/components/auth-provider';
import { deleteMovie } from '../services/movie-service';
import useMovieStore from '../stores/movie-store';
import useToastStore from '@/shared/stores/toast-store';
import { getMainTitle } from '../utils/movie-utils';
import { MESSAGES } from '@/constants';

const UNDO_DELETE_MS = 7000;

/**
 * Xóa phim khỏi bộ sưu tập với toast hoàn tác (dùng chung Dashboard và
 * trang chi tiết phim). Logic tách từ use-dashboard để không lặp.
 */
export function useDeleteMovie() {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { movies, removeLocal, restoreMovie, clearPendingDelete } = useMovieStore();

  const handleDelete = (docId: string) => {
    if (!user) return;
    const movie = movies.find((m) => m.docId === docId);
    if (!movie) return;

    removeLocal(docId);
    const timer = setTimeout(async () => {
      try {
        await deleteMovie(user.uid, docId);
        clearPendingDelete(docId);
      } catch {
        restoreMovie(movie);
        showToast(MESSAGES.MOVIE.DELETE_ERROR, 'error');
      }
    }, UNDO_DELETE_MS);

    showToast(`Đã xóa ${getMainTitle(movie)}`, 'info', UNDO_DELETE_MS, {
      label: 'Hoàn tác',
      onAction: () => {
        clearTimeout(timer);
        restoreMovie(movie);
      },
    });
  };

  return handleDelete;
}
