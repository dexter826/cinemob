import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, PlusCircle, Trash2, Edit2, X as XIcon } from 'lucide-react';
import Navbar from './Navbar';
import Loading from './Loading';
import { Album, Movie } from '../types';
import { subscribeToAlbum, updateAlbum } from '../services/albumService';
import { subscribeToMovies } from '../services/movieService';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';
import { useAlert } from './Alert';
import MovieCard from './MovieCard';
import { Timestamp } from 'firebase/firestore';

const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert } = useAlert();

  const [album, setAlbum] = useState<Album | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [managingMovies, setManagingMovies] = useState(false);

  useEffect(() => {
    if (!albumId) return;

    const unsubscribe = subscribeToAlbum(albumId, data => {
      setAlbum(data);
      if (data) {
        setName(data.name);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [albumId]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMovies(user.uid, data => {
      setMovies(data);
    });

    return () => unsubscribe();
  }, [user]);

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

  const formatDate = (value: Timestamp | Date | undefined) => {
    if (!value) return '';
    const d = value instanceof Timestamp ? value.toDate() : value;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  };

  if (loading) {
    return <Loading />;
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background text-text-main pb-20">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <button
            type="button"
            onClick={() => navigate('/albums')}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main mb-6"
          >
            <ArrowLeft size={18} />
            <span>Quay lại danh sách album</span>
          </button>
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-10 text-center">
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
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/albums')}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-main shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Film className="text-primary" size={24} />
                <h1 className="text-xl md:text-2xl font-bold truncate">{album.name}</h1>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {album.movieDocIds.length} phim · Tạo ngày {formatDate(album.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setManagingMovies(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <PlusCircle size={16} />
              <span>{managingMovies ? 'Đóng danh sách phim' : 'Thêm phim đã xem'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditing(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            >
              {editing ? <XIcon size={16} /> : <Edit2 size={16} />}
              <span>{editing ? 'Hủy' : 'Sửa thông tin'}</span>
            </button>
          </div>
        </div>

        {editing && (
          <form
            onSubmit={handleSaveInfo}
            className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-4 md:p-5"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 flex items-center gap-3">
                <label className="text-sm font-medium text-text-muted whitespace-nowrap">Tên album</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Phim trong album</h2>
            <span className="text-sm text-text-muted">{albumMovies.length} phim</span>
          </div>

          {albumMovies.length === 0 ? (
            <div className="border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-10 text-center text-sm text-text-muted">
              Chưa có phim nào trong album này. Nhấn "Thêm phim đã xem" để thêm từ lịch sử xem của bạn.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {albumMovies.map(movie => (
                <div key={movie.docId} className="relative">
                  <MovieCard
                    movie={movie}
                    onClick={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {
                      if (!movie.docId) return;
                      handleRemoveMovie(movie);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMovie(movie)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-red-400 hover:bg-red-500 hover:text-white transition-colors z-20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {managingMovies && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chọn thêm phim đã xem</h2>
              <span className="text-sm text-text-muted">{availableMovies.length} phim khả dụng</span>
            </div>
            {availableMovies.length === 0 ? (
              <div className="border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-8 text-center text-sm text-text-muted">
                Tất cả phim đã xem của bạn đều đã nằm trong album này.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {availableMovies.map(movie => (
                  <div key={movie.docId} className="relative">
                    <button
                      type="button"
                      onClick={() => handleAddMovie(movie)}
                      className="w-full text-left"
                    >
                      <MovieCard
                        movie={movie}
                        onClick={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetailPage;
