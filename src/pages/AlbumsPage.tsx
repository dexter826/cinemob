import React, { useState } from 'react';
import { Plus, Folder, Film, Trash2 } from 'lucide-react';
import { useAuth } from '../components/providers/AuthProvider';
import Loading from '../components/ui/Loading';
import { Album } from '../types';
import { addAlbum, deleteAlbum } from '../services/albumService';
import useToastStore from '../stores/toastStore';
import useAlertStore from '../stores/alertStore';
import { useNavigate } from 'react-router-dom';
import useAlbumStore from '../stores/albumStore';
import { getTMDBImageUrl } from '../utils/movieUtils';

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
          showToast('Đã xóa album', 'success');
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
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Folder className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Album phim</h1>
              <p className="text-xs sm:text-sm text-text-muted opacity-80 font-medium">Tự tạo bộ sưu tập phim cá nhân theo ý bạn.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border-default rounded-3xl sm:rounded-3xl p-4 sm:p-6 shadow-premium"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest opacity-60 ml-1">Tạo Album mới</label>
              <div className="relative group">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-xs sm:text-sm font-medium transition-all"
                  placeholder="Ví dụ: Phim Mafia Ý..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{creating ? 'Đang tạo...' : 'Tạo album'}</span>
            </button>
          </div>
        </form>

        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-surface rounded-3xl sm:rounded-3xl border border-border-default shadow-premium">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 border border-border-default">
              <Folder className="text-text-muted opacity-40" size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2 tracking-tight">Chưa có album nào</h3>
            <p className="text-text-muted/60 text-xs sm:text-sm max-w-xs text-center px-4">
              Hãy bắt đầu bằng cách tạo album đầu tiên và thêm các phim bạn đã xem vào đó.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {albums.map(album => (
              <div
                key={album.docId}
                className="group relative bg-surface rounded-3xl border border-border-default hover:border-primary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover cursor-pointer overflow-hidden"
                onClick={() => album.docId && navigate(`/albums/${album.docId}`)}
              >
                {/* Cover image section */}
                <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden">
                  {albumCoverMovies[album.docId || '']?.poster_path ? (
                    <img
                      src={getTMDBImageUrl(albumCoverMovies[album.docId || '']!.poster_path, 'w500')}
                      alt={albumCoverMovies[album.docId || '']!.title}
                      className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <Film size={20} className="text-white" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white">Trống</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay - Darker for better text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-90" />

                  {/* Album Badge (Top Left) */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center space-x-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 z-10">
                    <Folder size={10} className="text-primary" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">Album</span>
                  </div>

                  {/* Top-right delete button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(album);
                    }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-xl bg-black/40 text-white/80 hover:bg-error hover:text-white backdrop-blur-xl transition-all border border-white/10 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 duration-300"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Album name overlay */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-white truncate tracking-tight drop-shadow-xl">
                      {album.name}
                    </h3>
                  </div>
                </div>

                {/* Info bar - More compact on mobile */}
                <div className="px-3 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-1 sm:gap-2 bg-surface/50 backdrop-blur-xl border-t border-border-default">
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-[9px] sm:text-[10px] uppercase tracking-wider border border-primary/20 shrink-0">
                    <Film size={12} />
                    <span>{album.movieDocIds.length} mục</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity truncate">Chi tiết →</span>
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
