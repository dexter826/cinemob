import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { deleteMovie } from '@/features/movies/services/movieService';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import useAlertStore from '@/shared/stores/alertStore';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import useExportStore from '@/features/movies/stores/exportStore';
import { useDashboardFilters, ActiveTab } from './useDashboardFilters';
import { useDashboardStats } from './useDashboardStats';
import { MESSAGES } from '@/constants/messages';

// Hook điều phối chính cho Dashboard.
export const useDashboard = (_user: unknown) => {
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const { openAddModal } = useAddMovieStore();
  const { openDetailModal } = useMovieDetailStore();
  const { setMovies: setExportMovies } = useExportStore();
  
  const { movies, loading } = useMovieStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');

  const filters = useDashboardFilters(movies, activeTab);
  
  const { stats, contentTypeStats } = useDashboardStats(filters.currentTabMovies);

  useEffect(() => {
    setExportMovies(movies);
  }, [movies, setExportMovies]);

  const handleDelete = async (docId: string) => {
    showAlert({
      title: "Xóa phim",
      message: "Bạn có chắc chắn muốn xóa phim này khỏi lịch sử không? Hành động này không thể hoàn tác.",
      type: "danger",
      confirmText: "Xóa",
      onConfirm: async () => {
        try {
          await deleteMovie(docId);
          showToast(MESSAGES.MOVIE.DELETE_SUCCESS, "success");
        } catch (e) {
          showToast(MESSAGES.MOVIE.DELETE_ERROR, "error");
        }
      }
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
    ...filters
  };
};
