import React, { useState } from 'react';
import { Plus, Folder, Film, Trash2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import Navbar from '../layout/Navbar';
import Loading from '../ui/Loading';
import { Album } from '../../types';
import { addAlbum, deleteAlbum } from '../../services/albumService';
import useToastStore from '../../stores/toastStore';
import useAlertStore from '../../stores/alertStore';
import { useNavigate } from 'react-router-dom';
import useAlbumStore from '../../stores/albumStore';

const AlbumsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const navigate = useNavigate();
  const { albums, loading, albumCoverMovies } = useAlbumStore();

  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      showToast('Tên album không được để trống', 'error');
      return;
    }
    try {
      setCreating(true);
      await addAlbum({
        uid: user.uid,
        name: name.trim(),
        movieDocIds: [],
      });
      setName('');
      showToast('Đã tạo album mới', 'success');
    } catch (error) {
      showToast('Tạo album thất bại', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (album: Album) => {
    if (!album.docId) return;
    showAlert({
      title: 'Xóa album',
      message: 'Bạn có chắc chắn muốn xóa album này? Hành động này không xóa phim đã xem, chỉ xóa album.',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await deleteAlbum(album.docId!);
          showToast('Đã xóa album', 'info');
        } catch (error) {
          showToast('Xóa album thất bại', 'error');
        }
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Folder className="text-primary" size={28} />
            <div>
              <h1 className="text-2xl font-bold">Album phim</h1>
              <p className="text-sm text-text-muted">Tự tạo bộ sưu tập phim đã xem theo ý bạn.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-surface border border-black/15 dark:border-white/10 rounded-2xl p-4 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 flex items-center gap-3">
              <label className="text-sm font-medium text-text-muted whitespace-nowrap">Tên album</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm"
                placeholder="Ví dụ: Godfather Collection, Phim Mafia Ý, ..."
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{creating ? 'Đang tạo...' : 'Tạo album'}</span>
            </button>
          </div>
        </form>

        {albums.length === 0 ? (
          <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
              <Folder className="text-text-muted" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-main">Chưa có album nào</h3>
              <p className="text-text-muted max-w-xs mx-auto text-sm">
                Hãy bắt đầu bằng cách tạo album đầu tiên và thêm các phim bạn đã xem vào đó.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {albums.map(album => (
              <div
                key={album.docId}
                className="group relative bg-surface rounded-2xl border border-black/15 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer overflow-hidden"
                onClick={() => album.docId && navigate(`/albums/${album.docId}`)}
              >
                {/* Cover image section */}
                <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden">
                  {albumCoverMovies[album.docId || '']?.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${albumCoverMovies[album.docId || '']!.poster_path}`}
                      alt={albumCoverMovies[album.docId || '']!.title}
                      className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                          <Film size={22} className="text-primary" />
                        </div>
                        <span className="text-xs">Chưa có poster</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Album Badge (Top Left) */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-yellow-500/50 backdrop-blur-md rounded-lg border border-white/20 z-10">
                    <Folder size={12} className="text-white" />
                    <span className="text-xs font-bold text-white">Album</span>
                  </div>

                  {/* Top-right delete button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(album);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Album name overlay */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 sm:left-3 sm:right-3">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base text-white truncate drop-shadow">
                      {album.name}
                    </h3>
                  </div>
                </div>

                {/* Info bar */}
                <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] md:text-xs bg-surface/80 backdrop-blur border-t border-white/5">
                  <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                    <Film size={12} className="hidden xs:inline-block sm:inline-block" />
                    <span>{album.movieDocIds.length} phim</span>
                  </div>
                  <span className="text-text-muted truncate text-right">Nhấn để xem chi tiết</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumsPage;
