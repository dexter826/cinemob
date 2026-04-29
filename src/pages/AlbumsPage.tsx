import React, { useState } from 'react';
import { Plus, Folder, Film, Trash2 } from 'lucide-react';
import { useAuth } from '../components/providers/AuthProvider';
import Navbar from '../components/layout/Navbar';
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
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Folder className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Album phim</h1>
              <p className="text-sm text-text-muted opacity-80 font-medium">Tự tạo bộ sưu tập phim cá nhân theo ý bạn.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border-default rounded-3xl p-6 shadow-premium"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60 ml-1">Tạo Album mới</label>
              <div className="relative group">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
                  placeholder="Ví dụ: Phim Mafia Ý, Christopher Nolan Collection..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={18} />
              <span>{creating ? 'Đang tạo...' : 'Tạo album'}</span>
            </button>
          </div>
        </form>

        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-3xl border border-border-default shadow-premium">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-border-default">
              <Folder className="text-text-muted opacity-40" size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">Chưa có album nào</h3>
            <p className="text-text-muted/60 text-sm max-w-xs text-center">
              Hãy bắt đầu bằng cách tạo album đầu tiên và thêm các phim bạn đã xem vào đó.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {albums.map(album => (
              <div
                key={album.docId}
                className="group relative bg-surface rounded-3xl border border-border-default hover:border-primary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover cursor-pointer overflow-hidden"
                onClick={() => album.docId && navigate(`/albums/${album.docId}`)}
              >
                {/* Cover image section */}
                <div className="relative h-44 sm:h-48 md:h-56 w-full overflow-hidden">
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
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <Film size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Trống</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                  {/* Album Badge (Top Left) */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 z-10">
                    <Folder size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Album</span>
                  </div>

                  {/* Top-right delete button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(album);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 text-white/80 hover:bg-error hover:text-white backdrop-blur-xl transition-all border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-[-4px] group-hover:translate-y-0 duration-300"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Album name overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-base sm:text-lg text-white truncate tracking-tight drop-shadow-lg">
                      {album.name}
                    </h3>
                  </div>
                </div>

                {/* Info bar */}
                <div className="px-5 py-4 flex items-center justify-between gap-2 bg-surface/50 backdrop-blur-xl border-t border-border-default">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/20">
                    <Film size={12} />
                    <span>{album.movieDocIds.length} mục</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Chi tiết →</span>
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
