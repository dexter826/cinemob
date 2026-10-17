import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Film, Search, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import PosterCard from '@/features/movies/components/poster-card';
import Pagination from '@/shared/components/ui/pagination';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import Button from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/ui';
import { SectionHeader } from '@/shared/components/ui';
import { normalizeDate } from '@/shared/utils/date-format';
import { useScrollRestore } from '@/shared/hooks/use-scroll-restore';
import { staggerContainer, staggerItem } from '@/shared/utils/motion-presets';
import { COUNTRY_TRANSLATIONS } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import {
  getSeasonWatchedDates,
  getMainTitle,
  getSubTitle,
  getLatestWatchedDate,
} from '@/features/movies/utils/movie-utils';

import { useDashboard } from '../hooks/use-dashboard';
import DashboardTabs from '../components/dashboard-tabs';
import DashboardFilters from '../components/dashboard-filters';

/** Quản lý bộ sưu tập phim — editorial: hero typography + hairline sections. */
function DashboardPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  useScrollRestore('dashboard');
  const { user } = useAuth();
  const { error: libraryError, initialize: initMovies, cleanup: cleanupMovies } = useMovieStore();

  const {
    loading,
    processedMovies,
    totalPages,
    currentPage,
    setCurrentPage,
    activeTab,
    setActiveTab,
    filters,
    updateFilter,
    showFilters,
    setShowFilters,
    filterRef,
    toggleRef,
    openAddModal,
    toggleSortOrder,
    clearFilters,
    movies,
  } = useDashboard();

  // Hero dùng số liệu toàn bộ bộ sưu tập (không theo tab).
  const statusCounts = useMemo(
    () => ({
      history: movies.filter((m) => (m.status || 'history') === 'history').length,
      watchlist: movies.filter((m) => m.status === 'watchlist').length,
    }),
    [movies],
  );

  /** TV đang xem dở (có progress thật trong data) — tối đa 4, mới nhất trước. */
  const continueWatching = useMemo(
    () =>
      movies
        .filter(
          (m) =>
            m.media_type === 'tv' &&
            (m.status || 'history') === 'history' &&
            m.progress &&
            !m.progress.is_completed &&
            (m.progress.watched_episodes ?? 0) > 0,
        )
        .sort(
          (a, b) =>
            (getLatestWatchedDate(b)?.getTime() ?? 0) - (getLatestWatchedDate(a)?.getTime() ?? 0),
        )
        .slice(0, 4),
    [movies],
  );

  /** Danh sách năm cho bộ lọc. */
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        movies.flatMap((m) => {
          const d = normalizeDate(m.watched_at);
          const years = d ? [d.getFullYear()] : [];
          getSeasonWatchedDates(m).forEach(({ date }) => years.push(date.getFullYear()));
          return years;
        }),
      ),
    )
      .sort((a, b) => b - a)
      .map((year) => ({
        value: year,
        label: year.toString(),
      }));
  }, [movies]);

  /** Danh sách quốc gia cho bộ lọc. */
  const availableCountries = useMemo(() => {
    return Array.from(
      new Set(
        movies
          .filter((m) => m.country && m.country.trim().length > 0)
          .flatMap((m) => (m.country ?? '').split(',').map((c) => c.trim()))
          .filter((c) => c.length > 0),
      ),
    )
      .sort()
      .map((country) => ({
        value: country,
        label: COUNTRY_TRANSLATIONS[country] || country,
      }));
  }, [movies]);

  /** Danh sách thể loại cho bộ lọc. */
  const availableGenres = useMemo(() => {
    return Array.from(
      new Set(
        movies
          .filter((m) => m.genres && m.genres.trim().length > 0)
          .flatMap((m) => (m.genres ?? '').split(',').map((g) => g.trim()))
          .filter((g) => g.length > 0),
      ),
    )
      .sort((a, b) => a.localeCompare(b))
      .map((genre) => ({
        value: genre,
        label: GENRE_TRANSLATIONS[genre] || genre,
      }));
  }, [movies]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      {/* Header đồng bộ với mọi trang — số liệu chỉ ở tabs + thống kê riêng */}
      <PageHeader
        title="Thư viện"
        actions={
          <>
            <Button
              onClick={() => navigate('/search')}
              leadingIcon={<Search size={14} aria-hidden="true" />}
            >
              Tìm phim
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAddModal()}
              leadingIcon={<Plus size={14} aria-hidden="true" />}
            >
              Thêm thủ công
            </Button>
          </>
        }
      />

      {/* Tabs + filters */}
      <div className="mt-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={statusCounts.history}
          watchlistCount={statusCounts.watchlist}
        />
        {movies.length > 0 && (
          <DashboardFilters
            filters={filters}
            updateFilter={updateFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filterRef={filterRef}
            toggleRef={toggleRef}
            toggleSortOrder={toggleSortOrder}
            activeTab={activeTab}
            availableYears={availableYears}
            availableCountries={availableCountries}
            availableGenres={availableGenres}
            clearFilters={clearFilters}
          />
        )}
      </div>

      {/* Tiếp tục xem: TV có progress thật — đặt trên lưới theo yêu cầu */}
      {continueWatching.length > 0 && (
        <section aria-labelledby="continue-watching-title" className="border-b border-border">
          <div className="py-5">
            <SectionHeader id="continue-watching-title">Tiếp tục xem</SectionHeader>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {continueWatching.map((movie) => {
                const total = movie.total_episodes || 0;
                const watched = movie.progress?.watched_episodes ?? 0;
                const percent = total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0;
                return (
                  <div
                    key={movie.docId}
                    className="sm:border-l sm:border-border-default sm:pl-4 first:sm:border-l-0 first:sm:pl-0"
                  >
                    <p className="text-xs font-bold tracking-[0.05em] truncate">
                      {getMainTitle(movie)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-text-secondary tabular-nums">
                      S{movie.progress?.current_season ?? 1} · E
                      {movie.progress?.current_episode ?? 0}/{total} · {percent}%
                    </p>
                    <div className="mt-2 h-0.5 bg-border-default" role="presentation">
                      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lưới poster */}
      <section aria-labelledby="library-content-title" className="py-5">
        <h2 id="library-content-title" className="sr-only">
          Nội dung thư viện
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : libraryError ? (
          <ErrorState
            title="Không tải được thư viện"
            description="Lỗi kết nối tới dữ liệu phim. Bộ sưu tập của bạn vẫn an toàn."
            retry={
              user
                ? {
                    label: 'Thử lại',
                    onClick: () => {
                      cleanupMovies();
                      initMovies(user.uid);
                    },
                  }
                : undefined
            }
          />
        ) : processedMovies.length === 0 ? (
          <EmptyState
            icon={Film}
            title={
              filters.searchQuery
                ? 'Không tìm thấy nội dung phù hợp'
                : activeTab === 'history'
                  ? 'Chưa có nội dung nào trong lịch sử'
                  : 'Danh sách Sẽ xem đang trống'
            }
            description={
              filters.searchQuery
                ? 'Hãy thử điều chỉnh truy vấn tìm kiếm hoặc xóa các bộ lọc hiện tại.'
                : activeTab === 'history'
                  ? 'Bắt đầu xây dựng lịch sử điện ảnh của bạn bằng cách thêm bộ phim đầu tiên.'
                  : 'Khám phá và thêm những bộ phim bạn muốn xem vào đây.'
            }
            action={
              filters.searchQuery ||
              filters.ratingRange ||
              filters.year ||
              filters.country ||
              filters.genre ||
              filters.contentType !== 'all'
                ? {
                    label: 'Xóa tất cả bộ lọc',
                    onClick: clearFilters,
                  }
                : {
                    label: 'Khám phá ngay',
                    onClick: () => navigate('/search'),
                  }
            }
          />
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial={reducedMotion ? false : 'hidden'}
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
            >
              {processedMovies.map((movie) => (
                <motion.div key={movie.docId} variants={staggerItem}>
                  <PosterCard
                    title={getMainTitle(movie)}
                    posterPath={movie.poster_path}
                    mediaType={movie.media_type}
                    source={movie.source}
                    rating={movie.rating}
                    meta={getSubTitle(movie)}
                    progress={
                      movie.media_type === 'tv' && movie.progress && !movie.progress.is_completed
                        ? {
                            current: movie.progress.watched_episodes ?? 0,
                            total: movie.total_episodes ?? 0,
                          }
                        : null
                    }
                    onClick={() =>
                      navigate(`/movie/${movie.id}${movie.media_type === 'tv' ? '?type=tv' : ''}`)
                    }
                  />
                </motion.div>
              ))}
            </motion.div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
