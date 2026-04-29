import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Film, Star, TrendingUp, Globe } from 'lucide-react';
import Navbar from '../layout/Navbar';
import StatsCard from '../ui/StatsCard';
import { Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Loading from '../ui/Loading';
import useMovieStore from '../../stores/movieStore';

const COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#f97316', '#14b8a6', '#f43f5e', '#84cc16'];

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
  const { movies, loading } = useMovieStore();

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
        <h1 className="md:text-2xl text-xl font-bold flex items-center gap-3">
          <TrendingUp className="text-primary" />
          Thống kê phim đã xem
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
            colorClass="text-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Phân bố đánh giá
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-1 w-12">
                    <span className="font-bold text-lg">{rating}</span>
                    <Star size={16} className="fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="flex-1 h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.moviesByRating[rating] / (movies.filter(m => m.rating).length || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-main bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full w-12 text-center">
                    {stats.moviesByRating[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe size={20} className="text-primary" />
              Top 5 Quốc gia xem nhiều nhất
            </h3>
            {Object.keys(stats.moviesByCountry).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.moviesByCountry)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .slice(0, 5)
                  .map(([country, count], index) => (
                    <div key={country} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary text-lg w-6">#{index + 1}</span>
                        <span className="font-medium text-text-main">{country}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {count} phim
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center text-text-muted">
                <Globe size={48} className="opacity-50 mb-4" />
                <p className="text-sm">Chưa có dữ liệu quốc gia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Film size={20} className="text-primary" />
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
  );
};

export default StatsPage;
