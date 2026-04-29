import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import { useTheme } from '../components/providers/ThemeProvider';
import { Film, Star, TrendingUp, Globe } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import StatsCard from '../components/ui/StatsCard';
import { Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Loading from '../components/ui/Loading';
import useMovieStore from '../stores/movieStore';

const COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#f97316', '#14b8a6', '#f43f5e', '#84cc16'];

import { GENRE_TRANSLATIONS } from '../constants/genres';

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { movies, loading } = useMovieStore();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let displayLabel = label;
      if (payload[0].payload && payload[0].payload.fullCountry) {
        displayLabel = payload[0].payload.fullCountry;
      }
      return (
        <div className="bg-surface/90 backdrop-blur-xl border border-border-default rounded-2xl p-4 shadow-premium animate-in fade-in zoom-in-95 duration-200">
          <p className="text-text-main font-bold mb-1">{displayLabel}</p>
          <p className="text-primary font-bold text-sm">Số lượng: {value} phim</p>
        </div>
      );
    }
    return null;
  };


  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const update = () => setIsSmallScreen(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const watchedMovies = useMemo(() => movies.filter(m => (m.status || 'history') === 'history'), [movies]);

  const stats = useMemo(() => {
    const totalMovies = watchedMovies.length;
    const movieCount = watchedMovies.filter(m => m.media_type === 'movie').length;
    const tvCount = watchedMovies.filter(m => m.media_type === 'tv').length;

    const ratedMovies = watchedMovies.filter(m => m.rating && m.rating > 0);
    const avgRating = ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1)
      : '0';

    const moviesByRating: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedMovies.forEach(m => {
      if (m.rating) moviesByRating[m.rating] = (moviesByRating[m.rating] || 0) + 1;
    });

    const moviesByCountry: Record<string, number> = {};
    movies.forEach(m => {
      if (m.country && m.country.trim().length > 0) {
        const countries = m.country.split(',').map(c => c.trim()).filter(c => c.length > 0);
        countries.forEach(country => {
          moviesByCountry[country] = (moviesByCountry[country] || 0) + 1;
        });
      }
    });

    const moviesByGenre: Record<string, number> = {};
    movies.forEach(m => {
      if (m.genres && m.genres.trim().length > 0) {
        const genres = m.genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
        genres.forEach(genre => {
          const translatedGenre = GENRE_TRANSLATIONS[genre] || genre;
          moviesByGenre[translatedGenre] = (moviesByGenre[translatedGenre] || 0) + 1;
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
      moviesByGenre
    };
  }, [watchedMovies, movies]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-4 tracking-tight">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <TrendingUp className="text-primary" size={24} />
          </div>
          Thống kê điện ảnh
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            label="Tổng nội dung"
            value={stats.totalMovies}
            subValue={`${stats.movieCount} Điện ảnh • ${stats.tvCount} TV Series`}
            icon={Film}
            colorClass="text-primary"
          />
          <StatsCard
            label="Đánh giá trung bình"
            value={stats.avgRating}
            subValue={`Trên ${movies.filter(m => m.rating && m.rating > 0).length} phim`}
            icon={Star}
            colorClass="text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-border-default p-8 rounded-3xl shadow-premium">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 tracking-tight">
              <Star size={20} className="text-warning" />
              Phân bố đánh giá
            </h3>
            <div className="space-y-5">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4 group">
                  <div className="flex items-center gap-1.5 w-14 shrink-0">
                    <span className="font-bold text-lg text-text-main">{rating}</span>
                    <Star size={16} className="fill-warning text-warning" />
                  </div>
                  <div className="flex-1 h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-border-default shadow-inner">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(stats.moviesByRating[rating] / (movies.filter(m => m.rating).length || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-muted bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg w-12 text-center border border-border-default group-hover:text-primary transition-colors">
                    {stats.moviesByRating[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border-default p-8 rounded-3xl shadow-premium">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 tracking-tight">
              <Globe size={20} className="text-primary" />
              Top 5 Quốc gia
            </h3>
            {Object.keys(stats.moviesByCountry).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.moviesByCountry)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .slice(0, 5)
                  .map(([country, count], index) => (
                    <div key={country} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl transition-all duration-300 hover:shadow-md hover:bg-black/[0.08] dark:hover:bg-white/[0.08] border border-transparent hover:border-border-default group">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary/40 text-2xl w-8 group-hover:text-primary transition-colors">0{index + 1}</span>
                        <span className="font-bold text-text-main">{country}</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                        {count} phim
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center text-text-muted">
                <Globe size={48} className="opacity-10 mb-4" />
                <p className="text-sm font-medium opacity-60">Chưa có dữ liệu quốc gia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border-default p-8 rounded-3xl shadow-premium">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 tracking-tight">
            <Film size={20} className="text-primary" />
            Phân bố thể loại
          </h3>
          {Object.keys(stats.moviesByGenre).length > 0 ? (
            <div className="h-112 sm:h-96">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  {(() => {
                    const entries = Object.entries(stats.moviesByGenre)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .map(([genre, count]) => ({ name: genre, value: Number(count) }));

                    let genreData = entries;
                    if (entries.length > 8) {
                      const top = entries.slice(0, 7);
                      const othersTotal = entries.slice(7).reduce((acc, cur) => acc + cur.value, 0);
                      genreData = [...top, { name: 'Khác', value: othersTotal }];
                    } else {
                      genreData = entries.slice(0, 8);
                    }
                    return (
                      <>
                        <Pie
                          data={genreData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isSmallScreen ? 60 : 100}
                          outerRadius={isSmallScreen ? 90 : 140}
                          paddingAngle={5}
                          labelLine={false}
                          label={isSmallScreen ? false : (({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`)}
                          dataKey="value"
                          stroke="none"
                        >
                          {genreData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        {isSmallScreen && (
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            layout="vertical"
                            wrapperStyle={{ fontSize: 11, marginTop: 24, fontWeight: 'bold' }}
                            formatter={(value: string, entry: any) => `${value}: ${((entry.payload.value / stats.totalMovies) * 100).toFixed(1)}%`}
                          />
                        )}
                      </>
                    );
                  })()}
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center text-text-muted">
              <Film size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-medium opacity-60">Chưa có dữ liệu thể loại</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
