import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Movie } from '../types';
import { deleteMovie } from '../services/movieService';
import useMovieStore from '../stores/movieStore';
import useToastStore from '../stores/toastStore';
import useAlertStore from '../stores/alertStore';
import useAddMovieStore from '../stores/addMovieStore';
import useMovieDetailStore from '../stores/movieDetailStore';
import useExportStore from '../stores/exportStore';
import { useDashboardFilters, ActiveTab } from './useDashboardFilters';
import { useDashboardStats } from './useDashboardStats';
import { MESSAGES } from '../constants/messages';

// Hook điều phối chính cho Dashboard.
export const useDashboard = (user: any) => {
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
    const existingDate = movie.watched_at instanceof Timestamp
      ? movie.watched_at.toDate()
      : (movie.watched_at as Date | undefined);

    openAddModal({
      movieToEdit: {
        ...movie,
        status: 'history',
        watched_at: existingDate || now,
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
