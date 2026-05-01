import { useMemo } from 'react';
import { Movie } from '../types';
import { GENRE_TRANSLATIONS } from '../constants/genres';
import { COUNTRY_TRANSLATIONS } from '../constants/countries';
import { normalizeMovieDate } from '../utils/movieUtils';

// Hook xử lý logic thống kê toàn diện.
export const useStats = (movies: Movie[]) => {
  const watchedMovies = useMemo(() =>
    movies.filter(m => (m.status || 'history') === 'history'),
    [movies]
  );

  // Danh sách các năm có dữ liệu phim.
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    watchedMovies.forEach(m => {
      const date = normalizeMovieDate(m.watched_at);
      if (date) years.add(date.getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [watchedMovies]);

  // Thống kê theo tháng cho một năm cụ thể.
  const getMonthlyDataForYear = (year: string) => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`,
      count: 0
    }));

    watchedMovies.forEach(m => {
      const date = normalizeMovieDate(m.watched_at);
      if (date && date.getFullYear().toString() === year) {
        const monthIndex = date.getMonth();
        months[monthIndex].count++;
      }
    });

    return months;
  };

  const stats = useMemo(() => {
    // Chỉ số cơ bản.
    const totalMovies = watchedMovies.length;
    const movieCount = watchedMovies.filter(m => m.media_type === 'movie' || !m.media_type).length;
    const tvCount = watchedMovies.filter(m => m.media_type === 'tv').length;

    // Đánh giá trung bình.
    const ratedMovies = watchedMovies.filter(m => m.rating && m.rating > 0);
    const avgRating = ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1)
      : '0';

    // Phân bổ đánh giá.
    const moviesByRating: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    ratedMovies.forEach(m => {
      if (m.rating) moviesByRating[m.rating] = (moviesByRating[m.rating] || 0) + 1;
    });

    // Top Quốc gia.
    const moviesByCountry: Record<string, number> = {};
    watchedMovies.forEach(m => {
      if (m.country) {
        const countries = m.country.split(',').map(c => c.trim()).filter(Boolean);
        countries.forEach(country => {
          const translated = COUNTRY_TRANSLATIONS[country] || country;
          moviesByCountry[translated] = (moviesByCountry[translated] || 0) + 1;
        });
      }
    });

    // Phân bổ thể loại.
    const moviesByGenre: Record<string, number> = {};
    watchedMovies.forEach(m => {
      if (m.genres) {
        const genres = m.genres.split(',').map(g => g.trim()).filter(Boolean);
        genres.forEach(genre => {
          const translated = GENRE_TRANSLATIONS[genre] || genre;
          moviesByGenre[translated] = (moviesByGenre[translated] || 0) + 1;
        });
      }
    });

    return {
      totalMovies,
      movieCount,
      tvCount,
      avgRating,
      moviesByRating,
      moviesByCountry,
      moviesByGenre,
      ratedCount: ratedMovies.length
    };
  }, [watchedMovies]);

  return {
    ...stats,
    availableYears,
    getMonthlyDataForYear
  };
};
