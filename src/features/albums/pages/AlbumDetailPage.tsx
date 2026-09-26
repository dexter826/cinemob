import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, PlusCircle, Edit2, X as XIcon, Search } from 'lucide-react';
import { Album, Movie } from '@/types';
import { subscribeToAlbum, updateAlbum } from '../services/albumService';
import { useAuth } from '@/app/providers/AuthProvider';
import useToastStore from '@/shared/stores/toastStore';
import MovieCard from '@/features/movies/components/MovieCard';
import Pagination from '@/shared/components/ui/Pagination';
import useMovieStore from '@/features/movies/stores/movieStore';
import { formatMovieDate } from '@/features/movies/utils/movieUtils';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import { MESSAGES } from '@/constants/messages';
import EmptyState from '@/shared/components/ui/EmptyState';
import SkeletonCard from '@/shared/components/ui/SkeletonCard';
import PageHeader from '@/shared/components/ui/PageHeader';

/** Quản lý chi tiết album và thêm/bớt phim trong album. */
function AlbumDetailPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastStore();

  const { movies } = useMovieStore();
  const { openDetailModal } = useMovieDetailStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [managingMovies, setManagingMovies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!albumId || !user) return;

    const unsubscribe = subscribeToAlbum(user.uid, albumId, data => {
      setAlbum(data);
      if (data) {
        setName(data.name);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [albumId, user]);

  const watchedMovies = useMemo(
    () => movies.filter(m => (m.status || 'history') === 'history'),
    [movies]
  );

  const albumMovies = useMemo(() => {
    if (!album) return [];
    const ids = new Set(album.movieDocIds || []);
    return watchedMovies.filter(m => m.docId && ids.has(m.docId));
  }, [album, watchedMovies]);

  const availableMovies = useMemo(() => {
    if (!album) return [];
    const ids = new Set(album.movieDocIds || []);
    return watchedMovies.filter(m => m.docId && !ids.has(m.docId));
  }, [album, watchedMovies]);

  const normalizeVietnamese = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredAvailableMovies = useMemo(() => {
    if (!searchQuery.trim()) return availableMovies;
    const query = normalizeVietnamese(searchQuery.trim());
    return availableMovies.filter(movie => {
      const title = normalizeVietnamese(movie.title || '');
      const titleVi = normalizeVietnamese(movie.title_vi || '');
      return title.includes(query) || titleVi.includes(query);
    });
  }, [availableMovies, searchQuery]);

  const totalPages = Math.ceil(filteredAvailableMovies.length / itemsPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAvailableMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAvailableMovies, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !album.docId) return;
    if (!name.trim()) {
      showToast(MESSAGES.ALBUM.NAME_REQUIRED, 'error');
      return;
    }
    try {
      setSaving(true);
      await updateAlbum(album.docId, {
        name: name.trim(),
      });
      showToast(MESSAGES.ALBUM.UPDATE_SUCCESS, 'success');
      setEditing(false);
    } catch (error) {
      showToast(MESSAGES.ALBUM.UPDATE_ERROR, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = async (movie: Movie) => {
    if (!album || !album.docId || !movie.docId) return;
    if ((movie.status || 'history') !== 'history') {
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
      return;
    }
    try {
      const newIds = Array.from(new Set([...(album.movieDocIds || []), movie.docId]));
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.ADD_MOVIE_SUCCESS, 'success');
    } catch (error) {
      showToast(MESSAGES.ALBUM.ADD_MOVIE_ERROR, 'error');
    }
  };

  const handleRemoveMovie = async (movie: Movie) => {
    if (!album || !album.docId || !movie.docId) return;
    try {
      const newIds = (album.movieDocIds || []).filter(id => id !== movie.docId);
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.REMOVE_MOVIE_SUCCESS, 'info');
    } catch (error) {
      showToast(MESSAGES.ALBUM.REMOVE_MOVIE_ERROR, 'error');
    }
  };

  return (
    <div className="text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader
          onBack={() => navigate('/albums')}
          icon={Film}
          title={loading ? "Đang tải…" : album?.name || "Chi tiết Album"}
          description={!loading && album ? `${album.movieDocIds.length} phim · Tạo ngày ${formatMovieDate(album.createdAt)}` : ""}
          className="flex-col sm:flex-row items-stretch sm:items-center"
        >
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <button
              type="button"
              disabled={loading || !album}
              onClick={() => setManagingMovies(v => !v)}
              aria-label={managingMovies ? 'Đóng chế độ thêm phim' : 'Mở chế độ thêm phim vào album'}
              className={`
                flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors border cursor-pointer
                ${managingMovies 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-inner' 
                  : 'bg-surface border-border-default dark:border-white/5 text-text-main hover:border-primary/50 shadow-premium'
                }
                ${(loading || !album) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <PlusCircle size={18} strokeWidth={1.5} />
              <span>{managingMovies ? 'Đóng' : 'Thêm phim'}</span>
            </button>
            <button
              type="button"
              disabled={loading || !album}
              onClick={() => setEditing(v => !v)}
              aria-label={editing ? 'Hủy chỉnh sửa tên' : 'Chỉnh sửa tên album'}
              className={`
                flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors border cursor-pointer
                ${editing 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-inner' 
                  : 'bg-surface border-border-default dark:border-white/5 text-text-main hover:border-primary/50 shadow-premium'
                }
                ${(loading || !album) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {editing ? <XIcon size={18} strokeWidth={1.5} /> : <Edit2 size={18} strokeWidth={1.5} />}
              <span>{editing ? 'Hủy' : 'Sửa tên'}</span>
            </button>
          </div>
        </PageHeader>

        {editing && (
          <form
            onSubmit={handleSaveInfo}
            className="bg-surface border border-border rounded-3xl p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="flex-1 space-y-1.5 sm:space-y-2">
                <label className="text-xs font-medium text-text-muted ml-1">Tên album mới</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border-default dark:border-white/5 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs sm:text-sm font-medium transition-colors shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-primary text-white font-bold hover:shadow-premium shadow-lg disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
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
                label: "Quay lại danh sách",
                onClick: () => navigate('/albums')
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-3 sm:pb-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Phim trong album</h2>
              {!loading && (
                <span className="text-xs font-semibold text-text-muted bg-black/5 dark:bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-border-default tabular-nums">
                  {albumMovies.length} phim
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : albumMovies.length === 0 ? (
              <EmptyState
                icon={Film}
                title="Album đang trống"
                description="Hãy bắt đầu thêm những bộ phim yêu thích của bạn vào album này."
                action={!managingMovies ? {
                  label: "Thêm phim ngay",
                  onClick: () => setManagingMovies(true)
                } : undefined}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {albumMovies.map(movie => (
                  <MovieCard
                    key={movie.docId}
                    movie={movie}
                    onClick={openDetailModal}
                    onEdit={() => {}}
                    onDelete={() => handleRemoveMovie(movie)}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {managingMovies && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 border-t border-border-default dark:border-white/5 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Chọn thêm phim</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative group flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm trong lịch sử…"
                    className="w-full bg-surface border border-border-default dark:border-white/5 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary text-xs sm:text-sm font-medium shadow-sm transition-colors ring-1 ring-black/5 dark:ring-white/5"
                  />
                </div>
                <span className="text-xs font-semibold text-text-muted bg-black/5 dark:bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-border-default dark:border-white/5 whitespace-nowrap tabular-nums">
                  {filteredAvailableMovies.length} phim
                </span>
              </div>
            </div>

            {availableMovies.length === 0 ? (
              <EmptyState
                title="Đã hết phim để thêm"
                description="Tất cả phim trong lịch sử của bạn đều đã có trong album này."
                className="py-10"
              />
            ) : filteredAvailableMovies.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Không tìm thấy phim"
                description={`Không tìm thấy phim phù hợp với từ khóa "${searchQuery}"`}
                className="py-10"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                  {paginatedMovies.map(movie => (
                    <div key={movie.docId} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleAddMovie(movie)}
                        aria-label={`Thêm phim ${movie.title} vào album`}
                        className="w-full text-left"
                      >
                        <MovieCard
                          movie={movie}
                          onClick={openDetailModal}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/20 transition-colors rounded-[20px] sm:rounded-3xl flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 border border-transparent group-hover:border-primary/40 dark:group-hover:border-primary/40">
                          <PlusCircle
                            className="text-white drop-shadow-lg transition-colors duration-300"
                            size={44}
                            strokeWidth={1.5}
                          />
                        </div>
                      </button>
                    </div>
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
};

export default AlbumDetailPage;
