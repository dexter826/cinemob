import LoadingStatus from '@/shared/components/ui/loading-status';
import ErrorState from '@/shared/components/ui/error-state';
import useMovieStore from '@/features/movies/stores/movie-store';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  PlusCircle,
  Edit2,
  Trash2,
  X as XIcon,
  Search as SearchIcon,
} from 'lucide-react';
import PosterCard from '@/features/movies/components/poster-card';
import { getMainTitle } from '@/features/movies/utils/movie-utils';
import Pagination from '@/shared/components/ui/pagination';
import SearchField from '@/shared/components/ui/search-field';
import { formatDateAny } from '@/shared/utils/date-format';
import EmptyState from '@/shared/components/ui/empty-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import PageHeader from '@/shared/components/ui/page-header';
import { useAlbumDetail } from '../hooks/use-album-detail';

function AlbumDetailPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const {
    album,
    loading,
    error,
    retry,
    moviesLoading,
    moviesError,
    pendingMovieIds,
    editing,
    setEditing,
    name,
    setName,
    saving,
    managingMovies,
    setManagingMovies,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    albumMovies,
    availableMovies,
    filteredAvailableMovies,
    paginatedMovies,
    totalPages,
    handleSaveInfo,
    handleAddMovie,
    handleRemoveMovie,
  } = useAlbumDetail(albumId);

  const retryMovies = useMovieStore((state) => state.retry);
  if (error)
    return (
      <ErrorState
        title={error}
        description="Không thể đọc album. Vui lòng thử lại."
        retry={{ label: 'Thử lại', onClick: retry }}
      />
    );
  return (
    <div className="text-text-primary transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <LoadingStatus>
          {loading || moviesLoading
            ? 'Đang tải phim trong album…'
            : pendingMovieIds.size
              ? 'Đang cập nhật album…'
              : ''}
        </LoadingStatus>
        <PageHeader
          onBack={() => navigate('/albums')}
          icon={Film}
          title={loading ? 'Đang tải…' : album?.name || 'Chi tiết album'}
          description={
            !loading && album
              ? `${album.movieDocIds.length} phim · Tạo ngày ${formatDateAny(album.createdAt)}`
              : ''
          }
          className="flex-col sm:flex-row"
        >
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-auto">
            <button
              type="button"
              disabled={loading || !album}
              onClick={() => setManagingMovies((v) => !v)}
              aria-label={
                managingMovies ? 'Đóng chế độ thêm phim' : 'Mở chế độ thêm phim vào album'
              }
              className={`
                inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-control sm:rounded-card text-xs sm:text-sm font-bold transition-colors border cursor-pointer
                ${
                  managingMovies
                    ? 'bg-primary border-primary text-on-primary'
                    : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                }
                ${loading || !album ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <PlusCircle size={18} strokeWidth={1.5} />
              <span className="hidden sm:inline">{managingMovies ? 'Đóng' : 'Thêm phim'}</span>
            </button>
            <button
              type="button"
              disabled={loading || !album}
              onClick={() => setEditing((v) => !v)}
              aria-label={editing ? 'Hủy chỉnh sửa tên' : 'Chỉnh sửa tên album'}
              className={`
                inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-control sm:rounded-card text-xs sm:text-sm font-bold transition-colors border cursor-pointer
                ${
                  editing
                    ? 'bg-primary border-primary text-on-primary'
                    : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                }
                ${loading || !album ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {editing ? (
                <XIcon size={18} strokeWidth={1.5} />
              ) : (
                <Edit2 size={18} strokeWidth={1.5} />
              )}
              <span className="hidden sm:inline">{editing ? 'Hủy' : 'Sửa tên'}</span>
            </button>
          </div>
        </PageHeader>

        {editing && (
          <form
            onSubmit={handleSaveInfo}
            className="bg-surface border border-border rounded-dialog p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="flex-1 space-y-1.5 sm:space-y-2">
                <label
                  htmlFor="album-name"
                  className="text-xs font-medium text-text-secondary ml-1"
                >
                  Tên album mới
                </label>
                <input
                  id="album-name"
                  name="album-name"
                  type="text"
                  autoComplete="off"
                  required
                  placeholder="Nhập tên album…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border rounded-control sm:rounded-card px-4 sm:px-5 py-2.5 sm:py-3.5 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 text-xs sm:text-sm font-medium transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-control sm:rounded-card text-xs sm:text-sm font-bold text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-control sm:rounded-card text-xs sm:text-sm bg-primary text-on-primary font-bold disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        )}

        {!loading && !album ? (
          <div className="max-w-3xl mx-auto px-4 py-20">
            <EmptyState
              icon={ArrowLeft}
              title="Không tìm thấy album"
              description="Có thể album đã bị xóa hoặc bạn không có quyền truy cập."
              action={{
                label: 'Quay lại danh sách',
                onClick: () => navigate('/albums'),
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-3 sm:pb-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Phim trong album</h2>
              {!loading && !moviesLoading && !moviesError && (
                <span className="text-[11px] font-semibold tracking-[0.08em] text-text-secondary tabular-nums">
                  {albumMovies.length} phim
                </span>
              )}
            </div>

            {moviesError ? (
              <ErrorState
                title="Không tải được danh sách phim"
                description="Vui lòng thử lại."
                retry={{ label: 'Thử lại', onClick: retryMovies }}
              />
            ) : loading || moviesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : albumMovies.length === 0 ? (
              <EmptyState
                icon={Film}
                title="Album đang trống"
                description="Thêm phim đã xem vào album này."
                action={
                  !managingMovies
                    ? {
                        label: 'Thêm phim ngay',
                        onClick: () => setManagingMovies(true),
                      }
                    : undefined
                }
              />
            ) : (
              <div className="grid cv-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {albumMovies.map((movie) => (
                  <PosterCard
                    key={movie.docId}
                    title={getMainTitle(movie)}
                    posterPath={movie.poster_path}
                    source={movie.source}
                    mediaType={movie.media_type}
                    rating={movie.rating}
                    review={movie.is_review}
                    onClick={() =>
                      navigate(`/movie/${movie.id}${movie.media_type === 'tv' ? '?type=tv' : ''}`)
                    }
                    actions={
                      <button
                        type="button"
                        onClick={() => handleRemoveMovie(movie)}
                        disabled={pendingMovieIds.has(movie.docId!)}
                        aria-busy={pendingMovieIds.has(movie.docId!)}
                        aria-label={`Bỏ ${getMainTitle(movie)} khỏi album`}
                        title="Bỏ khỏi album"
                        className="min-w-10 min-h-10 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 transition-colors cursor-pointer"
                      >
                        {pendingMovieIds.has(movie.docId!) ? (
                          <span className="text-[9px]">Đang gỡ…</span>
                        ) : (
                          <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
                        )}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {managingMovies && !moviesLoading && !moviesError && !loading && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 border-t border-border-default dark:border-white/5 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Chọn thêm phim</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                <SearchField
                  variant="underline"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Tìm phim trong lịch sử…"
                  label="Tìm phim trong lịch sử để thêm vào album"
                  className="flex-1 md:w-80"
                />
                <span className="text-[11px] font-semibold tracking-[0.08em] text-text-secondary whitespace-nowrap tabular-nums">
                  {filteredAvailableMovies.length} phim
                </span>
              </div>
            </div>

            {availableMovies.length === 0 ? (
              <EmptyState
                title="Đã hết phim để thêm"
                description="Mọi phim đã xem đều đã nằm trong album này."
                className="py-10"
              />
            ) : filteredAvailableMovies.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="Không tìm thấy phim"
                description={`Không tìm thấy phim phù hợp với từ khóa “${searchQuery}”`}
                className="py-10"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {paginatedMovies.map((movie) => (
                    <PosterCard
                      key={movie.docId}
                      title={getMainTitle(movie)}
                      posterPath={movie.poster_path}
                      source={movie.source}
                      mediaType={movie.media_type}
                      rating={movie.rating}
                      selectable
                      ariaLabel={`Thêm ${getMainTitle(movie)} vào album`}
                      onClick={
                        pendingMovieIds.has(movie.docId!) ? undefined : () => handleAddMovie(movie)
                      }
                      credit={pendingMovieIds.has(movie.docId!) ? 'Đang thêm…' : undefined}
                    />
                  ))}
                </div>

                <div className="pt-4 sm:pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumDetailPage;
