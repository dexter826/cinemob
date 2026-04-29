import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { Film, AlertTriangle } from 'lucide-react';
import MovieCard from '../components/ui/MovieCard';
import Navbar from '../components/layout/Navbar';
import Pagination from '../components/ui/Pagination';
import Loading from '../components/ui/Loading';
import { TMDB_API_KEY } from '../constants';
import { normalizeMovieDate } from '../utils/movieUtils';

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
        label: country,
      }));
  }, [movies]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        <DashboardActions onOpenAddModal={() => openAddModal()} />

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

          {processedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-3xl border border-border-default shadow-premium">
              <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-border-default">
                <Film className="text-text-muted opacity-40" size={40} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">
                {filters.searchQuery
                  ? "Không tìm thấy nội dung phù hợp"
                  : activeTab === 'history'
                    ? "Chưa có nội dung nào trong lịch sử"
                    : "Danh sách Sẽ xem đang trống"}
              </h3>
              <p className="text-text-muted/60 text-sm mb-8 max-w-xs text-center">
                {filters.searchQuery
                  ? "Hãy thử điều chỉnh truy vấn tìm kiếm hoặc xóa các bộ lọc hiện tại."
                  : activeTab === 'history'
                    ? "Bắt đầu xây dựng lịch sử điện ảnh của bạn bằng cách thêm bộ phim đầu tiên."
                    : "Khám phá và thêm những bộ phim bạn muốn xem vào đây."}
              </p>
              
              <div className="flex gap-3">
                {filters.searchQuery || filters.rating || filters.year || filters.country || filters.contentType !== 'all' ? (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all cursor-pointer border border-primary/20 shadow-sm"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/search')}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-premium"
                  >
                    Khám phá ngay
                  </button>
                )}
              </div>
            </div>
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