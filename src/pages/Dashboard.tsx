import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { Film, AlertTriangle } from 'lucide-react';
import MovieCard from '../components/ui/MovieCard';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import { TMDB_API_KEY } from '../constants';
import { normalizeMovieDate } from '../utils/movieUtils';
import { COUNTRY_TRANSLATIONS } from '../constants/countries';

import { useDashboard } from '../hooks/useDashboard';
import DashboardActions from '../components/dashboard/DashboardActions';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import DashboardFilters from '../components/dashboard/DashboardFilters';

/** Trang Dashboard trung tâm quản lý bộ sưu tập phim. */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    loading,
    stats,
    contentTypeStats,
    processedMovies,
    allProcessedMoviesCount,
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
    handleDelete,
    handleEdit,
    openAddModal,
    handleMarkAsWatched,
    handleMovieClick,
    toggleSortOrder,
    clearFilters,
    movies
  } = useDashboard(user);

  /** Lấy danh sách năm có trong dữ liệu phim để hiển thị trong bộ lọc. */
  const availableYears = useMemo(() => {
    return Array.from(new Set(movies.map(m => {
      const d = normalizeMovieDate(m.watched_at);
      return d ? d.getFullYear() : null;
    }).filter(Boolean)))
      .sort((a, b) => (b as number) - (a as number))
      .map(year => ({
        value: year as number,
        label: year.toString(),
      }));
  }, [movies]);

  /** Lấy danh sách quốc gia có trong dữ liệu phim. */
  const availableCountries = useMemo(() => {
    return Array.from(new Set(
      movies
        .filter(m => m.country && m.country.trim().length > 0)
        .flatMap(m => m.country!.split(',').map(c => c.trim()))
        .filter(c => c.length > 0)
    ))
      .sort()
      .map(country => ({
        value: country,
        label: COUNTRY_TRANSLATIONS[country] || country,
      }));
  }, [movies]);


  return (
    <div className="text-text-main transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        <DashboardActions onOpenAddModal={() => openAddModal()} />

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DashboardTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              moviesCount={contentTypeStats.moviesCount}
              tvCount={contentTypeStats.tvCount}
            />

            {movies.length > 0 && (
              <DashboardFilters 
                filters={filters}
                updateFilter={updateFilter}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterRef={filterRef}
                toggleSortOrder={toggleSortOrder}
                activeTab={activeTab}
                availableYears={availableYears}
                availableCountries={availableCountries}
                clearFilters={clearFilters}
              />
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : processedMovies.length === 0 ? (
            <EmptyState
              icon={Film}
              title={filters.searchQuery
                ? "Không tìm thấy nội dung phù hợp"
                : activeTab === 'history'
                  ? "Chưa có nội dung nào trong lịch sử"
                  : "Danh sách Sẽ xem đang trống"}
              description={filters.searchQuery
                ? "Hãy thử điều chỉnh truy vấn tìm kiếm hoặc xóa các bộ lọc hiện tại."
                : activeTab === 'history'
                  ? "Bắt đầu xây dựng lịch sử điện ảnh của bạn bằng cách thêm bộ phim đầu tiên."
                  : "Khám phá và thêm những bộ phim bạn muốn xem vào đây."}
              action={filters.searchQuery || filters.rating || filters.year || filters.country || filters.contentType !== 'all' ? {
                label: "Xóa tất cả bộ lọc",
                onClick: clearFilters
              } : {
                label: "Khám phá ngay",
                onClick: () => navigate('/search')
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {processedMovies.map(movie => (
                  <MovieCard
                    key={movie.docId}
                    movie={movie}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onClick={handleMovieClick}
                    onMarkAsWatched={activeTab === 'watchlist' ? handleMarkAsWatched : undefined}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;