import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Movie } from '@/types';
import useMovieStore from '@/features/movies/stores/movie-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import { useDeleteMovie } from '@/features/movies/hooks/use-delete-movie';
import { useDashboardFilters, ActiveTab } from './use-dashboard-filters';
import { useDashboardStats } from './use-dashboard-stats';

// Hook điều phối chính cho Dashboard.
export const useDashboard = () => {
  const { openAddModal } = useAddMovieStore();
  const handleDelete = useDeleteMovie();

  const { movies, loading } = useMovieStore();
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

  const statusCounts = useMemo(
    () => ({
      history: movies.filter((m) => (m.status || 'history') === 'history').length,
      watchlist: movies.filter((m) => m.status === 'watchlist').length,
    }),
    [movies],
  );

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
    statusCounts,
    activeTab,
    setActiveTab,
    handleDelete,
    handleEdit,
    handleMarkAsWatched,
    openAddModal,
    ...filters,
  };
};
