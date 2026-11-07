import LoadingStatus from '@/shared/components/ui/loading-status';
import ErrorState from '@/shared/components/ui/error-state';
import useMovieStore from '@/features/movies/stores/movie-store';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Images,
  PlusCircle,
  Edit2,
  Trash2,
  X as XIcon,
  Search as SearchIcon,
} from 'lucide-react';
import PosterCard from '@/features/movies/components/poster-card';
import { getMainTitle } from '@/features/movies/utils/movie-utils';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import { useDeleteAlbum } from '../hooks/use-delete-album';
import AlbumCoverPickerDialog from '../components/album-cover-picker-dialog';
import Pagination from '@/shared/components/ui/pagination';
import SearchField from '@/shared/components/ui/search-field';
import { formatDateAny } from '@/shared/utils/date-format';
import EmptyState from '@/shared/components/ui/empty-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import PageHeader from '@/shared/components/ui/page-header';
import { Button, TextField } from '@/shared/components/ui';
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
  const { handleDelete: handleDeleteAlbum } = useDeleteAlbum();
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  const retryMovies = useMovieStore((state) => state.retry);
  const shouldShowSkeleton = (loading || moviesLoading) && albumMovies.length === 0;
  const showSkeleton = useDelayedSkeleton(shouldShowSkeleton);
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
          leading={<Film className="text-primary w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />}
          loading={loading}
          title={album?.name || 'Chi tiết album'}
          description={
            album
              ? `${moviesLoading ? album.movieDocIds.length : albumMovies.length} phim · Tạo ngày ${formatDateAny(album.createdAt)}`
              : undefined
          }
          className="flex-col sm:flex-row"
          actions={
            <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-auto">
              <Button
                variant="secondary"
                disabled={loading || !album || albumMovies.length === 0}
                onClick={() => setCoverPickerOpen(true)}
                aria-label="Chọn ảnh bìa album"
                leadingIcon={<Images size={18} strokeWidth={1.5} />}
              >
                <span className="hidden sm:inline">Sửa bìa</span>
              </Button>
              <Button
                variant={managingMovies ? 'primary' : 'secondary'}
                disabled={loading || !album}
                onClick={() => setManagingMovies((v) => !v)}
                aria-expanded={managingMovies}
                aria-label={
                  managingMovies ? 'Đóng chế độ thêm phim' : 'Mở chế độ thêm phim vào album'
                }
                leadingIcon={<PlusCircle size={18} strokeWidth={1.5} />}
              >
                <span className="hidden sm:inline">{managingMovies ? 'Đóng' : 'Thêm phim'}</span>
              </Button>
              <Button
                variant={editing ? 'primary' : 'secondary'}
                disabled={loading || !album}
                onClick={() => setEditing((v) => !v)}
                aria-expanded={editing}
                aria-label={editing ? 'Hủy chỉnh sửa tên' : 'Chỉnh sửa tên album'}
                leadingIcon={
                  editing ? (
                    <XIcon size={18} strokeWidth={1.5} />
                  ) : (
                    <Edit2 size={18} strokeWidth={1.5} />
                  )
                }
              >
                <span className="hidden sm:inline">{editing ? 'Hủy' : 'Sửa tên'}</span>
              </Button>
              <Button
                variant="ghost"
                className="text-danger hover:bg-danger/10"
                disabled={loading || !album}
                onClick={() => {
                  if (!album) return;
                  handleDeleteAlbum(album);
                  navigate('/albums');
                }}
                aria-label={`Xoá album “${album?.name ?? ''}”`}
                leadingIcon={<Trash2 size={18} strokeWidth={1.5} />}
              >
                <span className="hidden sm:inline">Xoá album</span>
              </Button>
            </div>
          }
        />

        {editing && (
          <form
            onSubmit={handleSaveInfo}
            className="bg-surface border border-border rounded-dialog p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="flex-1">
                <TextField
                  id="album-name"
                  name="album-name"
                  label="Tên album mới"
                  variant="boxed"
                  required
                  autoComplete="off"
                  placeholder="Nhập tên album…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  disabled={saving || !name.trim()}
                >
                  {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
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
              <h2 className="text-title-lg tracking-tight">Phim trong album</h2>
              {!loading && !moviesLoading && !moviesError && (
                <span className="text-label-caps normal-case text-text-secondary tabular-nums">
                  {albumMovies.length} phim
                </span>
              )}
            </div>

            {moviesError ? (
              <ErrorState
                title="Không tải được danh sách phim"
                description="Vui lòng thử lại để tải danh sách phim trong album."
                retry={{ label: 'Thử lại', onClick: retryMovies }}
              />
            ) : shouldShowSkeleton ? (
              showSkeleton ? (
                <div
                  aria-busy="true"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} badges={2} />
                  ))}
                </div>
              ) : null
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
              <div
                aria-busy={loading || moviesLoading}
                className="grid cv-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
              >
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
                        aria-label={`Gỡ “${getMainTitle(movie)}” khỏi album`}
                        title="Gỡ khỏi album"
                        className="min-w-10 min-h-10 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 transition-colors cursor-pointer focus-ring focus-visible:outline-none"
                      >
                        {pendingMovieIds.has(movie.docId!) ? (
                          <span className="text-micro-caps normal-case">Đang gỡ…</span>
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
              <h2 className="text-title-lg tracking-tight">Chọn thêm phim</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                <SearchField
                  variant="underline"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Tìm phim đã xem…"
                  label="Tìm phim đã xem để thêm vào album"
                  className="flex-1 md:w-80"
                />
                <span className="text-label-caps normal-case text-text-secondary whitespace-nowrap tabular-nums">
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
                description={`Không tìm thấy phim nào khớp với từ khóa “${searchQuery}”.`}
                action={{ label: 'Xóa tìm kiếm', onClick: () => setSearchQuery('') }}
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
                      ariaLabel={`Thêm “${getMainTitle(movie)}” vào album`}
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
      <AlbumCoverPickerDialog
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        album={album}
        movies={albumMovies}
      />
    </div>
  );
}

export default AlbumDetailPage;
