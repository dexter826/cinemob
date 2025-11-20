import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { subscribeToMovies } from '../services/movieService';
import { Movie } from '../types';
import { BarChart, Calendar, Clock, Film, Star, TrendingUp, PieChart } from 'lucide-react';
import Navbar from './Navbar';
import StatsCard from './StatsCard';
import { Timestamp } from 'firebase/firestore';

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setMovies(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const totalMovies = movies.length;
    const totalMinutes = movies.reduce((acc, curr) => acc + (curr.runtime || 0), 0);
    
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const ratedMovies = movies.filter(m => m.rating && m.rating > 0);
    const avgRating = ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1)
      : '0';

    // Movies by Year (Watched Year)
    const moviesByYear: Record<string, number> = {};
    movies.forEach(m => {
      const date = m.watched_at instanceof Timestamp ? m.watched_at.toDate() : new Date(m.watched_at as any);
      const year = date.getFullYear();
      moviesByYear[year] = (moviesByYear[year] || 0) + 1;
    });

    // Movies by Rating
    const moviesByRating: Record<string, number> = {1:0, 2:0, 3:0, 4:0, 5:0};
    ratedMovies.forEach(m => {
      if (m.rating) moviesByRating[m.rating] = (moviesByRating[m.rating] || 0) + 1;
    });

    return {
      totalMovies,
      totalMinutes,
      days,
      hours,
      minutes,
      avgRating,
      moviesByYear,
      moviesByRating
    };
  }, [movies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="text-primary" />
          Thống kê chi tiết
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Tổng phim đã xem"
            value={stats.totalMovies}
            icon={Film}
            colorClass="text-blue-500"
          />
          <StatsCard
            label="Tổng thời gian"
            value={`${stats.days}d ${stats.hours}h ${stats.minutes}m`}
            subValue={`${stats.totalMinutes} phút`}
            icon={Clock}
            colorClass="text-purple-500"
          />
          <StatsCard
            label="Đánh giá trung bình"
            value={stats.avgRating}
            subValue={`Trên ${movies.filter(m => m.rating && m.rating > 0).length} phim`}
            icon={Star}
            colorClass="text-yellow-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Movies by Year */}
          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Phim theo năm
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.moviesByYear)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([year, count]) => (
                  <div key={year} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{year}</span>
                      <span className="font-medium">{count} phim</span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(Number(count) / (stats.totalMovies || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Phân bố đánh giá
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-12">
                    <span className="font-bold">{rating}</span>
                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.moviesByRating[rating] / (movies.filter(m => m.rating).length || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-muted w-12 text-right">
                    {stats.moviesByRating[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsPage;
