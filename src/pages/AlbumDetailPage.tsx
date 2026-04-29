import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, PlusCircle, Trash2, Edit2, X as XIcon, Search } from 'lucide-react';
import Loading from '../components/ui/Loading';
import { Album, Movie } from '../types';
import { subscribeToAlbum, updateAlbum } from '../services/albumService';
import { useAuth } from '../components/providers/AuthProvider';
import useToastStore from '../stores/toastStore';
import useAlertStore from '../stores/alertStore';
import MovieCard from '../components/ui/MovieCard';
import Pagination from '../components/ui/Pagination';
import { Timestamp } from 'firebase/firestore';
import useMovieStore from '../stores/movieStore';
import { formatMovieDate } from '../utils/movieUtils';
import useMovieDetailStore from '../stores/movieDetailStore';

const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();

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
      showToast('Tên album không được để trống', 'error');
      return;
    }
    try {
      setSaving(true);
      await updateAlbum(album.docId, {
        name: name.trim(),
      });
      showToast('Đã cập nhật album', 'success');
      setEditing(false);
    } catch (error) {
      showToast('Cập nhật album thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = async (movie: Movie) => {
    if (!album || !album.docId || !movie.docId) return;
    if ((movie.status || 'history') !== 'history') {
      showToast('Chỉ có thể thêm phim đã xem vào album', 'error');
      return;
    }
    try {
      const newIds = Array.from(new Set([...(album.movieDocIds || []), movie.docId]));
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast('Đã thêm phim vào album', 'success');
    } catch (error) {
      showToast('Thêm phim vào album thất bại', 'error');
    }
  };

  const handleRemoveMovie = (movie: Movie) => {
    if (!album || !album.docId || !movie.docId) return;
    showAlert({
      title: 'Xóa phim khỏi album',
      message: 'Phim sẽ được gỡ khỏi album này nhưng vẫn giữ lại trong lịch sử xem.',
      confirmText: 'Gỡ phim',
      type: 'warning',
      onConfirm: async () => {
        try {
          const newIds = (album.movieDocIds || []).filter(id => id !== movie.docId);
          await updateAlbum(album.docId!, { movieDocIds: newIds });
          showToast('Đã gỡ phim khỏi album', 'info');
        } catch (error) {
          showToast('Gỡ phim khỏi album thất bại', 'error');
        }
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!album) {
    return (
      <div className="text-text-main">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <button
            type="button"
            onClick={() => navigate('/albums')}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main mb-6"
          >
            <ArrowLeft size={18} />
            <span>Quay lại danh sách album</span>
          </button>
          <div className="border border-border-default rounded-2xl p-10 text-center">
            <p className="text-lg font-medium mb-2">Không tìm thấy album</p>
            <p className="text-text-muted text-sm">
              Có thể album đã bị xóa hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-text-main">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/albums')}
              className="w-12 h-12 rounded-2xl bg-surface border border-border-default flex items-center justify-center text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-premium shrink-0"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Film className="text-primary" size={16} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold truncate tracking-tight">{album.name}</h1>
              </div>
              <p className="text-xs text-text-muted font-medium opacity-60 ml-1">
                {album.movieDocIds.length} phim · Tạo ngày {formatMovieDate(album.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-stretch gap-3 w-full md:w-auto md:justify-end">
            <button
              type="button"
              onClick={() => setManagingMovies(v => !v)}
              className={`
                flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all border
                ${managingMovies 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-inner' 
                  : 'bg-surface border-border-default text-text-main hover:border-primary/50 shadow-premium'
                }
              `}
            >
              <PlusCircle size={18} />
              <span>{managingMovies ? 'Đóng quản lý' : 'Thêm phim'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditing(v => !v)}
              className={`
                flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all border
                ${editing 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-inner' 
                  : 'bg-surface border-border-default text-text-main hover:border-primary/50 shadow-premium'
                }
              `}
            >
              {editing ? <XIcon size={18} /> : <Edit2 size={18} />}
              <span>{editing ? 'Hủy' : 'Sửa tên'}</span>
            </button>
          </div>
        </div>

        {editing && (
          <form
            onSubmit={handleSaveInfo}
            className="bg-surface border border-border-default rounded-3xl p-6 shadow-premium animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60 ml-1">Tên album mới</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 rounded-2xl text-sm bg-primary text-white font-bold hover:shadow-premium shadow-lg disabled:opacity-40 transition-all"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-xl font-bold tracking-tight">Phim trong album</h2>
            <span className="text-xs font-bold text-text-muted bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-border-default uppercase tracking-widest">
              {albumMovies.length} phim
            </span>
          </div>

          {albumMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-border-default shadow-premium">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-border-default">
                <Film className="text-text-muted opacity-40" size={32} />
              </div>
              <p className="text-text-muted/60 text-sm font-medium max-w-xs text-center">
                Chưa có phim nào trong album này. Hãy nhấn "Thêm phim" để bắt đầu bộ sưu tập.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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

        {managingMovies && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-border-default pt-8">
              <h2 className="text-xl font-bold tracking-tight">Chọn thêm phim</h2>
              <div className="flex items-center gap-4">
                <div className="relative group flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm trong lịch sử xem..."
                    className="w-full bg-surface border border-border-default rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 text-sm font-medium shadow-sm transition-all"
                  />
                </div>
                <span className="text-xs font-bold text-text-muted bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-border-default uppercase tracking-widest whitespace-nowrap">
                  {filteredAvailableMovies.length} phim
                </span>
              </div>
            </div>

            {availableMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-surface/50 rounded-3xl border border-dashed border-border-default">
                <p className="text-text-muted/60 text-sm font-medium">Tất cả phim trong lịch sử đều đã có trong album.</p>
              </div>
            ) : filteredAvailableMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-surface/50 rounded-3xl border border-dashed border-border-default">
                <p className="text-text-muted/60 text-sm font-medium">Không tìm thấy phim phù hợp với "{searchQuery}"</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {paginatedMovies.map(movie => (
                    <div key={movie.docId} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleAddMovie(movie)}
                        className="w-full text-left"
                      >
                        <MovieCard
                          movie={movie}
                          onClick={openDetailModal}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/20 transition-all rounded-3xl flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 border border-transparent group-hover:border-primary/50">
                          <PlusCircle
                            className="text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
                            size={48}
                          />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
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
