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
import { MESSAGES } from '../constants/messages';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import PageHeader from '../components/ui/PageHeader';

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
      showToast(MESSAGES.ALBUM.NAME_REQUIRED, 'error');
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
      showToast(MESSAGES.ALBUM.CREATE_SUCCESS(name), 'success');
    } catch (error) {
      showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
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
          showToast(MESSAGES.ALBUM.DELETE_SUCCESS, 'success');
        } catch (error) {
          showToast(MESSAGES.ALBUM.DELETE_ERROR, 'error');
        }
      },
    });
  };

  return (
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader 
          icon={Folder} 
          title="Album phim" 
          description="Tự tạo bộ sưu tập phim cá nhân theo ý bạn."
        />

        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border-default rounded-3xl p-3 sm:p-4 shadow-premium"
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
              disabled={creating || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{creating ? 'Đang tạo...' : 'Tạo album'}</span>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 animate-in fade-in duration-500">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video bg-surface rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="Chưa có album nào"
            description="Hãy bắt đầu bằng cách tạo album đầu tiên và thêm các phim bạn đã xem vào đó."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
                      className="h-full w-full object-cover transition-transform duration-700"
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
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 bg-surface/50 backdrop-blur-xl border-t border-border-default">
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
