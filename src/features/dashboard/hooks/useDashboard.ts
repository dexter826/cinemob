import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Movie } from '@/types';
import { deleteMovie } from '@/features/movies/services/movieService';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import { getMainTitle } from '@/features/movies/utils/movieUtils';
import { useDashboardFilters, ActiveTab } from './useDashboardFilters';
import { useDashboardStats } from './useDashboardStats';
import { MESSAGES } from '@/constants/messages';
import type { User } from 'firebase/auth';

const UNDO_DELETE_MS = 7000;

// Hook điều phối chính cho Dashboard.
export const useDashboard = (user: User | null) => {
  const { showToast } = useToastStore();
  const { openAddModal } = useAddMovieStore();
  const { openDetailModal } = useMovieDetailStore();

  const { movies, loading, removeLocal, restoreMovie, clearPendingDelete } = useMovieStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() =>
    searchParams.get('tab') === 'watchlist' ? 'watchlist' : 'history',
  );

  const setActiveTab = useCallback(
    (tab: ActiveTab) => {
      setActiveTabState(tab);
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (tab === 'watchlist') params.set('tab', tab);
        else params.delete('tab');
        params.delete('page');
        return params;
      });
    },
    [setSearchParams],
  );

  const filters = useDashboardFilters(movies, activeTab);

  const { stats, contentTypeStats } = useDashboardStats(filters.currentTabMovies);

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

  const handleEdit = (movie: Movie) => {
    openAddModal({ movieToEdit: movie });
  };

  const handleMarkAsWatched = (movie: Movie) => {
    const now = new Date();
    openAddModal({
      movieToEdit: {
        ...movie,
        status: 'history',
        watched_at: now,
      },
    });
  };

  return {
    movies,
    loading,
    stats,
    contentTypeStats,
    activeTab,
    setActiveTab,
    handleDelete,
    handleEdit,
    handleMarkAsWatched,
    handleMovieClick: openDetailModal,
    openAddModal,
    ...filters,
  };
};
