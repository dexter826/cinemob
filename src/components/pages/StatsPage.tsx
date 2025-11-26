import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { subscribeToMovies } from '../../services/movieService';
import { Movie } from '../../types';
import { Calendar, Film, Star, TrendingUp, Tv, Globe, View } from 'lucide-react';
import Navbar from '../layout/Navbar';
import StatsCard from '../ui/StatsCard';
import { Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Loading from '../ui/Loading';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6'];

const GENRE_TRANSLATIONS: Record<string, string> = {
  'Action': 'Hành động',
  'Adventure': 'Phiêu lưu',
  'Animation': 'Hoạt hình',
  'Comedy': 'Hài',
  'Crime': 'Tội phạm',
  'Documentary': 'Tài liệu',
  'Drama': 'Chính kịch',
  'Family': 'Gia đình',
  'Fantasy': 'Phiêu lưu kỳ thú',
  'History': 'Lịch sử',
  'Horror': 'Kinh dị',
  'Music': 'Âm nhạc',
  'Mystery': 'Bí ẩn',
  'Romance': 'Lãng mạn',
  'Science Fiction': 'Khoa học viễn tưởng',
  'TV Movie': 'Phim truyền hình',
  'Thriller': 'Gay cấn',
  'War': 'Chiến tranh',
  'Western': 'Miền Tây',
  'Sci-Fi & Fantasy': 'Khoa học viễn tưởng',
  'Action & Adventure': 'Hành động & Phiêu lưu',
  'War & Politics': 'Chiến tranh & Chính trị',
  'Soap': 'Phím dài tập',
  'Talk': 'Talk show',
  'News': 'Tin tức',
  'Reality': 'Thực tế',
  'Kids': 'Thiếu nhi'
};

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let displayLabel = label;
      if (payload[0].payload && payload[0].payload.fullCountry) {
        displayLabel = payload[0].payload.fullCountry;
      }
      return (
        <div style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)', color: theme === 'dark' ? '#ffffff' : '#000000', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px' }}>
          <p>{displayLabel}</p>
          <p>Số lượng: {value} phim</p>
        </div>
      );
    }
    return null;
  };

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllYears, setShowAllYears] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setMovies(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Track screen size to tweak chart labels on mobile
  useEffect(() => {
    const update = () => setIsSmallScreen(window.innerWidth < 640); // Tailwind 'sm'
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const watchedMovies = useMemo(() => movies.filter(m => (m.status || 'history') === 'history'), [movies]);

  const stats = useMemo(() => {
    const totalMovies = watchedMovies.length;
    const movieCount = watchedMovies.filter(m => m.media_type === 'movie').length;
    const tvCount = watchedMovies.filter(m => m.media_type === 'tv').length;
    const totalMinutes = watchedMovies.reduce((acc, curr) => acc + (curr.runtime || 0), 0);

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const ratedMovies = watchedMovies.filter(m => m.rating && m.rating > 0);
    const avgRating = ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1)
      : '0';

    // Movies by Year (Watched Year)
    const moviesByYear: Record<string, number> = {};
    watchedMovies.forEach(m => {
      const date = m.watched_at instanceof Timestamp ? m.watched_at.toDate() : new Date(m.watched_at as any);
      const year = date.getFullYear();
      moviesByYear[year] = (moviesByYear[year] || 0) + 1;
    });

    // Movies by Rating
    const moviesByRating: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedMovies.forEach(m => {
      if (m.rating) moviesByRating[m.rating] = (moviesByRating[m.rating] || 0) + 1;
    });

    // Movies by Country
    const moviesByCountry: Record<string, number> = {};
    movies.forEach(m => {
      if (m.country && m.country.trim().length > 0) {
        const countries = m.country.split(',').map(c => c.trim()).filter(c => c.length > 0);
        countries.forEach(country => {
          moviesByCountry[country] = (moviesByCountry[country] || 0) + 1;
        });
      }
    });

    // Movies by Genre
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

    const totalCountries = Object.keys(moviesByCountry).length;

    // Series Statistics
    const tvSeries = watchedMovies.filter(m => m.media_type === 'tv');
    const totalSeasons = tvSeries.reduce((acc, curr) => acc + (curr.seasons || 0), 0);
    const totalEpisodesWatched = tvSeries.reduce((acc, curr) => {
      if (curr.progress && curr.progress.watched_episodes) {
        return acc + curr.progress.watched_episodes;
      }
      return acc;
    }, 0);
    const completedSeries = tvSeries.filter(m => m.progress?.is_completed).length;
    const watchingSeries = tvSeries.filter(m => m.progress && !m.progress.is_completed).length;

    return {
      totalMovies,
      movieCount,
      tvCount,
      totalMinutes,
      days,
      hours,
      minutes,
      avgRating,
      moviesByYear,
      moviesByRating,
      moviesByCountry,
      moviesByGenre,
      totalCountries,
      totalSeasons,
      totalEpisodesWatched,
      completedSeries,
      watchingSeries
    };
  }, [watchedMovies, movies]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <h1 className="md:text-2xl text-xl font-bold flex items-center gap-3">
          <TrendingUp className="text-primary" />
          Thống kê phim đã xem
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Tổng phim đã xem"
            value={stats.totalMovies}
            icon={Film}
            colorClass="text-blue-500"
          />
          <StatsCard
            label="Series đang xem"
            value={stats.watchingSeries}
            icon={View}
            colorClass="text-orange-500"
          />
          <StatsCard
            label="Phim / TV"
            value={`${stats.movieCount}/${stats.tvCount}`}
            icon={Tv}
            colorClass="text-green-500"
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
            <div className="relative">
              <div className="space-y-4">
                {Object.entries(stats.moviesByYear)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .slice(0, showAllYears ? undefined : 4)
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
              {Object.keys(stats.moviesByYear).length > 4 && !showAllYears && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-surface to-transparent cursor-pointer flex items-end justify-center pb-2"
                  onClick={() => setShowAllYears(true)}
                >
                  <span className="text-primary font-medium text-sm">Xem thêm</span>
                </div>
              )}
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

        {/* Country and Genre Distribution */}
        <div className="space-y-8">

          {/* Movies by Country */}
          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe size={20} className="text-purple-500" />
              Phân bố phim theo quốc gia
            </h3>
            {Object.keys(stats.moviesByCountry).length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={Object.entries(stats.moviesByCountry)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 10)
                      .map(([country, count]) => ({
                        country: country.length > 12 ? country.substring(0, 12) + '...' : country,
                        fullCountry: country,
                        count: Number(count)
                      }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-text-muted" opacity={0.1} />
                    <XAxis
                      dataKey="country"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-text-muted"
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-text-muted"
                    />
                    <Tooltip content={customTooltip} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center text-text-muted">
                <Globe size={48} className="opacity-50 mb-4" />
                <p className="text-sm">Chưa có dữ liệu quốc gia</p>
              </div>
            )}
          </div>

          {/* Movies by Genre */}
          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Film size={20} className="text-teal-500" />
              Phân bố phim theo thể loại
            </h3>
            {Object.keys(stats.moviesByGenre).length > 0 ? (
              <div className="h-112 sm:h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    {(() => {
                      const entries = Object.entries(stats.moviesByGenre)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .map(([genre, count]) => ({ name: genre, value: Number(count) }));

                      // Keep top 7 and group the rest as "Khác" to prevent long legends
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
                            labelLine={false}
                            label={isSmallScreen ? false : (({ name, value }) => `${name}: ${((value / stats.totalMovies) * 100).toFixed(1)}%`)}
                            outerRadius={isSmallScreen ? 80 : 90}
                            fill="#8884d8"
                            dataKey="value"
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
                              wrapperStyle={{ fontSize: 12, marginTop: 12 }}
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
                <Film size={48} className="opacity-50 mb-4" />
                <p className="text-sm">Chưa có dữ liệu thể loại</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsPage;
