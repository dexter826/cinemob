import React, { useState, useEffect, useMemo } from 'react';
import { Film, Star, TrendingUp, Globe, Calendar, ChevronDown } from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import useMovieStore from '../stores/movieStore';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useStats } from '../hooks/useStats';
import CustomDropdown from '../components/ui/CustomDropdown';

const COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#f97316', '#14b8a6', '#f43f5e', '#84cc16'];

const StatsPage: React.FC = () => {
  const { movies, loading } = useMovieStore();
  const { 
    totalMovies, movieCount, tvCount, avgRating, ratedCount,
    moviesByRating, moviesByCountry, moviesByGenre,
    availableYears, getMonthlyDataForYear 
  } = useStats(movies);

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Danh sách năm cho dropdown.
  const yearOptions = useMemo(() => 
    availableYears.map(year => ({ value: year, label: year })), 
    [availableYears]
  );

  // Mặc định chọn năm gần nhất.
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    const update = () => setIsSmallScreen(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Thống kê theo tháng cho năm đã chọn.
  const monthlyData = useMemo(() => {
    return selectedYear ? getMonthlyDataForYear(selectedYear) : [];
  }, [selectedYear, getMonthlyDataForYear]);

  const totalInYear = useMemo(() => {
    return monthlyData.reduce((acc, curr) => acc + curr.count, 0);
  }, [monthlyData]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur-xl border border-border-default rounded-2xl p-4 shadow-premium animate-in fade-in duration-200">
          <p className="text-text-main font-bold mb-1">{label || payload[0].name}</p>
          <p className="text-primary font-bold text-sm">Số lượng: {payload[0].value} phim</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-surface rounded-3xl animate-pulse" />
          <div className="h-32 bg-surface rounded-3xl animate-pulse" />
        </div>
        <div className="h-96 bg-surface rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader 
          icon={TrendingUp} 
          title="Thống kê điện ảnh" 
          description="Cái nhìn tổng quan về thói quen xem phim của bạn."
        />

        {totalMovies === 0 ? (
          <EmptyState
            icon={Film}
            title="Chưa có dữ liệu"
            description="Bắt đầu thêm phim vào lịch sử để khám phá các thống kê."
          />
        ) : (
          <>
            {/* Thống kê tổng quát */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                label="Tổng nội dung"
                value={totalMovies}
                subValue={`${movieCount} Điện ảnh • ${tvCount} TV Series`}
                icon={Film}
                colorClass="text-primary"
              />
              <StatsCard
                label="Đánh giá trung bình"
                value={avgRating}
                subValue={`Trên ${ratedCount} phim`}
                icon={Star}
                colorClass="text-warning"
              />
            </div>

            {/* Biểu đồ hoạt động */}
            <div className="bg-surface border border-border-default p-4 sm:p-6 rounded-3xl shadow-premium">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Thống kê theo</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex px-3 h-10 items-center bg-black/5 dark:bg-white/5 rounded-xl border border-border-default">
                    <span className="text-[11px] font-bold text-primary">{totalInYear} phim</span>
                  </div>
                  <CustomDropdown 
                    options={yearOptions}
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val.toString())}
                    className="w-28"
                  />
                </div>
              </div>

              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                      dy={10}
                      tickFormatter={(value) => value.replace('Tháng ', 'T')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                    />
                    <Tooltip content={customTooltip} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                    <Bar 
                      dataKey="count" 
                      fill="url(#barGradient)" 
                      radius={[4, 4, 0, 0]} 
                      barSize={isSmallScreen ? 12 : 24}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phân bổ đánh giá */}
              <div className="bg-surface border border-border-default p-6 rounded-3xl shadow-premium">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-warning/10 rounded-xl">
                    <Star size={18} className="text-warning" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Phân bổ đánh giá</h3>
                </div>
                <div className="space-y-4">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4 group">
                      <div className="flex items-center gap-1 w-12 shrink-0">
                        <span className="font-bold text-base text-text-main">{rating}</span>
                        <Star size={12} className="fill-warning text-warning" />
                      </div>
                      <div className="flex-1 h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-border-default shadow-inner">
                        <div
                          className="h-full bg-warning rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(moviesByRating[rating] / (ratedCount || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text-muted bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg w-10 text-center border border-border-default group-hover:text-primary transition-colors">
                        {moviesByRating[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Quốc gia */}
              <div className="bg-surface border border-border-default p-6 rounded-3xl shadow-premium">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Globe size={18} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Top 5 Quốc gia</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(moviesByCountry)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([country, count], index) => (
                      <div key={country} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-border-default hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-primary/20 group-hover:text-primary transition-colors">0{index + 1}</span>
                          <span className="font-bold text-sm text-text-main truncate max-w-[150px]">{country}</span>
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                          {count} phim
                        </span>
                      </div>
                    ))}
                  {Object.keys(moviesByCountry).length === 0 && (
                    <EmptyState icon={Globe} title="Chưa có dữ liệu" description="Thêm phim để xem quốc gia." className="py-10" />
                  )}
                </div>
              </div>
            </div>

            {/* Phân bổ thể loại */}
            <div className="bg-surface border border-border-default p-6 rounded-3xl shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Film size={18} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Phân bổ thể loại</h3>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {(() => {
                      const entries = Object.entries(moviesByGenre).sort((a, b) => b[1] - a[1]);
                      let genreData = entries.map(([name, value]) => ({ name, value }));
                      if (genreData.length > 8) {
                        const top = genreData.slice(0, 7);
                        const others = genreData.slice(7).reduce((acc, cur) => acc + cur.value, 0);
                        genreData = [...top, { name: 'Khác', value: others }];
                      }
                      return (
                        <>
                          <Pie
                            data={genreData}
                            cx="50%" cy="50%"
                            innerRadius={isSmallScreen ? 70 : 100}
                            outerRadius={isSmallScreen ? 90 : 130}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {genreData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            layout="horizontal"
                            wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 30, opacity: 0.8 }}
                            formatter={(value: string, entry: any) => `${value}: ${entry.payload.value}`}
                          />
                        </>
                      );
                    })()}
                    <Tooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
