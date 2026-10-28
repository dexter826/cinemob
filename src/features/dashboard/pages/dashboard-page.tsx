import LoadingStatus from '@/shared/components/ui/loading-status';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Film, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import PosterCard from '@/features/movies/components/poster-card';
import Pagination from '@/shared/components/ui/pagination';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import Skeleton from '@/shared/components/ui/skeleton';
import Button from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/ui';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import { useScrollRestore } from '@/shared/hooks/use-scroll-restore';
import { staggerContainer, staggerItem } from '@/shared/utils/motion-presets';
import { getMainTitle, getSubTitle } from '@/features/movies/utils/movie-utils';

import { useDashboard } from '../hooks/use-dashboard';
import { MOVIES_PER_PAGE } from '../hooks/use-dashboard-filters';
import DashboardTabs from '../components/dashboard-tabs';
import DashboardFilters from '../components/dashboard-filters';
import DashboardActiveFilters from '../components/dashboard-active-filters';

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
    statusCounts,
    availableYears,
    availableCountries,
    availableGenres,
  } = useDashboard();

  const shouldShowSkeleton = loading && movies.length === 0;
  const showSkeleton = useDelayedSkeleton(shouldShowSkeleton);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 md:pt-6">
      {/* Số liệu nằm ở tabs + thống kê riêng, không đưa lên header */}
      <PageHeader
        title="Thư viện"
        actions={
          <Button
            variant="secondary"
            onClick={() => openAddModal()}
            leadingIcon={<Plus size={14} strokeWidth={1.5} aria-hidden="true" />}
          >
            Thêm thủ công
          </Button>
        }
      />

      <div className="mt-5 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-1 md:gap-4">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={statusCounts.history}
          watchlistCount={statusCounts.watchlist}
          droppedCount={statusCounts.dropped}
          loading={shouldShowSkeleton}
        />
        {shouldShowSkeleton ? (
          <div
            aria-hidden="true"
            className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 py-2"
          >
            <Skeleton className="h-10 w-full lg:w-72" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-10 w-11" />
          </div>
        ) : movies.length > 0 ? (
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
        ) : null}
      </div>

      {movies.length > 0 && (
        <DashboardActiveFilters
          filters={filters}
          updateFilter={updateFilter}
          activeTab={activeTab}
          availableGenres={availableGenres}
          availableCountries={availableCountries}
          clearFilters={clearFilters}
        />
      )}

      <section aria-labelledby="library-content-title" className="py-5">
        <h2 id="library-content-title" className="sr-only">
          Nội dung thư viện
        </h2>
        <LoadingStatus>{loading ? 'Đang tải thư viện…' : ''}</LoadingStatus>
        {shouldShowSkeleton ? (
          showSkeleton ? (
            <div
              aria-busy="true"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
            >
              {Array.from({ length: MOVIES_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} badges={2} />
              ))}
            </div>
          ) : null
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
            title={filters.searchQuery ? 'Không tìm thấy nội dung phù hợp' : 'Chưa có nội dung'}
            description={
              filters.searchQuery
                ? 'Hãy thử điều chỉnh truy vấn tìm kiếm hoặc xóa các bộ lọc hiện tại.'
                : 'Thêm phim từ trang Tìm phim.'
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
              key={`${activeTab}-${currentPage}`}
              variants={staggerContainer}
              initial={reducedMotion ? false : 'hidden'}
              animate="show"
              aria-busy={loading}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
            >
              {processedMovies.map((movie) => (
                <motion.div
                  key={movie.docId}
                  variants={staggerItem}
                  initial={reducedMotion ? false : 'hidden'}
                  animate="show"
                >
                  <PosterCard
                    title={getMainTitle(movie)}
                    posterPath={movie.poster_path}
                    mediaType={movie.media_type}
                    source={movie.source}
                    rating={movie.rating}
                    review={movie.is_review}
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
