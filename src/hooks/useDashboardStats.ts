import { useMemo } from 'react';
import { Movie, Stats } from '../types';

// Tính toán số liệu thống kê cho Dashboard.
export const useDashboardStats = (currentTabMovies: Movie[]) => {
  const stats: Stats = useMemo(() => {
    const totalMovies = currentTabMovies.length;
    const totalMinutes = currentTabMovies.reduce((acc, curr) => acc + (curr.runtime || 0), 0);

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    return { totalMovies, totalMinutes, days, hours, minutes };
  }, [currentTabMovies]);

  const contentTypeStats = useMemo(() => {
    const moviesCount = currentTabMovies.filter(m => m.media_type === 'movie' || !m.media_type).length;
    const tvCount = currentTabMovies.filter(m => m.media_type === 'tv').length;
    return { moviesCount, tvCount };
  }, [currentTabMovies]);

  return {
    stats,
    contentTypeStats
  };
};
