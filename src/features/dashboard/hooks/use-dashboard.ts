import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMovieStore from '@/features/movies/stores/movie-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import { useDeleteMovie } from '@/features/movies/hooks/use-delete-movie';
import { useDashboardFilters, ActiveTab } from './use-dashboard-filters';
import { useDashboardStats } from './use-dashboard-stats';

export const useDashboard = () => {
  const { openAddModal } = useAddMovieStore();
  const handleDelete = useDeleteMovie();

  const { movies, loading } = useMovieStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    const tab = searchParams.get('tab');
    return tab === 'watchlist' || tab === 'dropped' ? tab : 'history';
  });

  const setActiveTab = useCallback(
    (tab: ActiveTab) => {
      setActiveTabState(tab);
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (tab === 'history') params.delete('tab');
        else params.set('tab', tab);
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
      dropped: movies.filter((m) => m.status === 'dropped').length,
    }),
    [movies],
  );

  return {
    movies,
    loading,
    stats,
    contentTypeStats,
    statusCounts,
    activeTab,
    setActiveTab,
    handleDelete,
    openAddModal,
    ...filters,
  };
};
