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

      {!TMDB_API_KEY && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center">
          <p className="text-yellow-500 text-sm flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            TMDB API Key bị thiếu. Tìm kiếm sẽ không hoạt động.
          </p>
        </div>
      )}

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
            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
                <Film className="text-text-muted" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-main">
                  {filters.searchQuery
                    ? "Không tìm thấy nội dung phù hợp"
                    : activeTab === 'history'
                      ? "Chưa có nội dung nào trong lịch sử"
                      : "Danh sách Sẽ xem đang trống"}
                </h3>
                <p className="text-text-muted max-w-xs mx-auto">
                  {filters.searchQuery
                    ? "Hãy thử điều chỉnh truy vấn tìm kiếm của bạn."
                    : activeTab === 'history'
                      ? "Bắt đầu xây dựng lịch sử điện ảnh cá nhân của bạn bằng cách thêm bộ phim hoặc series đầu tiên."
                      : "Tìm kiếm và thêm những phim bạn muốn xem sau."}
                </p>
              </div>
              {!filters.searchQuery && (
                <button
                  onClick={() => navigate('/search')}
                  className="px-6 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-text-main rounded-full font-medium transition-colors"
                >
                  Thêm nội dung
                </button>
              )}
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