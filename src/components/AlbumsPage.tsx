import React, { useEffect, useState } from 'react';
import { Plus, Folder, Film, Trash2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Navbar from './Navbar';
import Loading from './Loading';
import { Album } from '../types';
import { addAlbum, deleteAlbum, subscribeToAlbums } from '../services/albumService';
import { useToast } from './Toast';
import { useAlert } from './Alert';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const AlbumsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAlbums(user.uid, data => {
      setAlbums(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
        description: description.trim() || undefined,
        movieDocIds: [],
      });
      setName('');
      setDescription('');
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

  const formatDate = (value: Timestamp | Date | undefined) => {
    if (!value) return '';
    const d = value instanceof Timestamp ? value.toDate() : value;
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
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
          className="bg-surface border border-black/5 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-text-muted">Tên album</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm"
                placeholder="Ví dụ: Godfather Collection, Phim Mafia Ý, ..."
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-text-muted">Mô tả (tuỳ chọn)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm"
                placeholder="Ghi chú ngắn về album này"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {albums.map(album => (
              <div
                key={album.docId}
                className="group relative bg-surface rounded-2xl border border-black/5 dark:border-white/10 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => album.docId && navigate(`/albums/${album.docId}`)}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Film size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{album.name}</h3>
                        <p className="text-xs text-text-muted truncate">
                          {album.description || 'Album phim đã xem'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(album);
                      }}
                      className="p-1.5 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{album.movieDocIds.length} phim</span>
                    <span>{formatDate(album.createdAt)}</span>
                  </div>
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
