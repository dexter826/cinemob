import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Star, Globe } from 'lucide-react';
import { Stat } from '@/shared/components/ui';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import useMovieStore from '@/features/movies/stores/movie-store';
import EmptyState from '@/shared/components/ui/empty-state';
import PageHeader from '@/shared/components/ui/page-header';
import { useStats } from '../hooks/use-stats';
import Dropdown from '@/shared/components/ui/dropdown';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import { buildGenreChartData, topEntries } from '../utils/stats-selectors';

// Palette biểu đồ derive từ token — tự đúng ở cả 2 theme (spec 2026-10-17).
const COLORS = [
  'var(--color-primary)',
  'color-mix(in srgb, var(--color-primary) 78%, var(--color-text-secondary))',
  'color-mix(in srgb, var(--color-primary) 56%, var(--color-text-secondary))',
  'var(--color-text-secondary)',
  'color-mix(in srgb, var(--color-text-secondary) 76%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 58%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 42%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 28%, var(--color-surface))',
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
  label?: string;
}

const StatsTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated border border-border rounded-card p-4">
        <p className="text-text-primary font-bold mb-1">{label || payload[0].name}</p>
        <p className="text-primary font-bold text-sm">Số lượng: {payload[0].value} phim</p>
      </div>
    );
  }
  return null;
};

/** Thống kê hoạt động xem phim, điểm số và thể loại. */
function StatsPage() {
  const { movies, loading } = useMovieStore();
  const {
    totalMovies,
    movieCount,
    tvCount,
    avgRating,
    ratedCount,
    moviesByRating,
    moviesByCountry,
    moviesByGenre,
    availableYears,
    getMonthlyDataForYear,
  } = useStats(movies);

  // Năm thống kê sync theo query param ?year=.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedYear = searchParams.get('year') ?? '';
  const setSelectedYear = useCallback(
    (year: string) => {
      setSearchParams(year ? { year } : {}, { replace: true });
    },
    [setSearchParams],
  );
  const isSmallScreen = useMediaQuery('(max-width: 639px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Danh sách năm cho dropdown.
  const yearOptions = useMemo(
    () => availableYears.map((year) => ({ value: year, label: year })),
    [availableYears],
  );

  // Mặc định chọn năm gần nhất.
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear, setSelectedYear]);

  // Thống kê theo tháng cho năm đã chọn.
  const monthlyData = useMemo(() => {
    return selectedYear ? getMonthlyDataForYear(selectedYear) : [];
  }, [selectedYear, getMonthlyDataForYear]);

  const totalInYear = useMemo(() => {
    return monthlyData.reduce((acc, curr) => acc + curr.count, 0);
  }, [monthlyData]);

  const topCountries = useMemo(() => {
    return topEntries(moviesByCountry, 5);
  }, [moviesByCountry]);

  const genreData = useMemo(() => {
    return buildGenreChartData(moviesByGenre);
  }, [moviesByGenre]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-surface rounded-dialog animate-pulse" />
          <div className="h-32 bg-surface rounded-dialog animate-pulse" />
        </div>
        <div className="h-96 bg-surface rounded-dialog animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader title="Thống kê điện ảnh" />

      {totalMovies === 0 ? (
        <EmptyState
          icon={Film}
          title="Chưa có dữ liệu"
          description="Thêm phim vào lịch sử để xem thống kê."
        />
      ) : (
        <>
          <section aria-labelledby="stats-summary-title">
            <h2 id="stats-summary-title" className="sr-only">
              Chỉ số tổng quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Stat
                label="Tổng nội dung"
                value={totalMovies}
                subValue={`${movieCount} phim lẻ, ${tvCount} series`}
                icon={Film}
                colorClass="text-primary"
              />
              <Stat
                label="Đánh giá trung bình"
                value={avgRating}
                subValue={`Trên ${ratedCount} phim`}
                icon={Star}
                colorClass="text-warning"
              />
            </div>
          </section>

          <section
            aria-labelledby="stats-trend-title"
            className="bg-surface border border-border p-4 sm:p-6 rounded-dialog"
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h3
                  id="stats-trend-title"
                  className="text-lg font-bold tracking-tight text-text-primary"
                >
                  Hoạt động theo tháng
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.08em] text-text-secondary tabular-nums">
                  {totalInYear} phim · {selectedYear}
                </span>
                <Dropdown
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val.toString())}
                  className="w-28"
                  aria-label="Năm thống kê"
                />
              </div>
            </div>

            <div
              role="img"
              aria-label={`Biểu đồ cột số phim xem theo tháng trong năm ${selectedYear}`}
              className="h-72 sm:h-80 text-text-secondary"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    opacity={0.05}
                  />
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
                  <Tooltip
                    content={<StatsTooltip />}
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary)"
                    radius={[2, 2, 0, 0]}
                    barSize={isSmallScreen ? 12 : 24}
                    animationDuration={1000}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section
              aria-labelledby="stats-rating-title"
              className="bg-surface border border-border p-6 rounded-dialog"
            >
              <div className="flex items-center gap-3 mb-8">
                <h3
                  id="stats-rating-title"
                  className="text-lg font-bold tracking-tight text-text-primary"
                >
                  Phân bổ đánh giá
                </h3>
              </div>
              <div className="space-y-4">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4 group">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="font-bold text-base text-text-primary tabular-nums">
                        {rating}
                      </span>
                      <Star
                        size={12}
                        className="fill-warning text-warning"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 h-0.5 bg-border-default overflow-hidden">
                      <div
                        className="h-full w-full bg-warning origin-left transition-transform duration-700 ease-out"
                        style={{
                          transform: `scaleX(${Math.min(
                            1,
                            (moviesByRating[rating] ?? 0) / (ratedCount || 1),
                          )})`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-secondary px-2.5 py-1 rounded-lg w-10 text-center border border-border-default dark:border-white/5 group-hover:text-primary transition-colors tabular-nums">
                      {moviesByRating[rating] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="stats-countries-title"
              className="bg-surface border border-border p-6 rounded-dialog"
            >
              <div className="flex items-center gap-3 mb-8">
                <h3
                  id="stats-countries-title"
                  className="text-lg font-bold tracking-tight text-text-primary"
                >
                  Top 5 quốc gia
                </h3>
              </div>
              <div className="space-y-3">
                {topCountries.map(([country, count], index) => (
                  <div
                    key={country}
                    className="flex items-center justify-between p-4 rounded-card border border-transparent hover:border-border-default dark:hover:border-white/5 transition-colors duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-primary/20 group-hover:text-primary transition-colors tabular-nums">
                        0{index + 1}
                      </span>
                      <span className="font-bold text-sm text-text-primary truncate max-w-[150px]">
                        {country}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-primary tabular-nums">
                      {count} phim
                    </span>
                  </div>
                ))}
                {Object.keys(moviesByCountry).length === 0 && (
                  <EmptyState
                    icon={Globe}
                    title="Chưa có dữ liệu"
                    description="Thêm phim để xem quốc gia."
                    compact
                  />
                )}
              </div>
            </section>
          </div>

          <section
            aria-labelledby="stats-genres-title"
            className="bg-surface border border-border p-6 rounded-dialog"
          >
            <div className="flex items-center gap-3 mb-8">
              <h3
                id="stats-genres-title"
                className="text-lg font-bold tracking-tight text-text-primary"
              >
                Phân bổ thể loại
              </h3>
            </div>
            <div className="h-96 text-text-secondary">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isSmallScreen ? 70 : 100}
                    outerRadius={isSmallScreen ? 90 : 130}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1000}
                    isAnimationActive={!prefersReducedMotion}
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
                    formatter={(value: string, entry?: { payload?: { value?: number | string } }) =>
                      `${value}: ${entry?.payload?.value ?? ''}`
                    }
                  />
                  <Tooltip content={<StatsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default StatsPage;
