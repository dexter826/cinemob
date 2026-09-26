import { useState } from 'react';
import { FolderPlus, Film } from 'lucide-react';
import { Movie, Album } from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import useToastStore from '@/shared/stores/toastStore';
import useAlbumStore from '../stores/albumStore';
import { updateAlbum, addAlbum } from '../services/albumService';
import { getDisplayTitle } from '@/features/movies/utils/movieUtils';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import logoText from '@/assets/images/logo_text.png';
import { MESSAGES } from '@/constants/messages';
import { Dialog, DialogBody } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';

interface AlbumSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

/** Sheet on mobile, centered dialog above sm. Create/select with parent-dialog-safe locks. */
function AlbumSelectorModal({ isOpen, onClose, movie }: AlbumSelectorModalProps) {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { albums, loading } = useAlbumStore();
  const [addingToAlbum, setAddingToAlbum] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  const handleAddToAlbum = async (album: Album) => {
    if (!album.docId || !movie?.docId) return;
    if (!user) return;

    if (album.movieDocIds.includes(movie.docId)) {
      showToast(MESSAGES.ALBUM.ALREADY_IN, 'info');
      return;
    }

    if ((movie.status || 'history') !== 'history') {
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
      return;
    }

    try {
      setAddingToAlbum(album.docId);
      const newIds = Array.from(new Set([...(album.movieDocIds || []), movie.docId]));
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.ADD_MOVIE_SUCCESS, 'success');
    } catch (error) {
      showToast(MESSAGES.ALBUM.ADD_MOVIE_ERROR, 'error');
    } finally {
      setAddingToAlbum(null);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !user) return;

    try {
      setCreatingAlbum(true);
      await addAlbum({
        uid: user.uid,
        name: newAlbumName.trim(),
        movieDocIds: [],
      });
      showToast(MESSAGES.ALBUM.CREATE_SUCCESS(newAlbumName), 'success');
      setNewAlbumName('');
      setShowCreateForm(false);
    } catch (error) {
      showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const availableAlbums = albums.filter(album =>
    album.movieDocIds && !album.movieDocIds.includes(movie?.docId || '')
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="album-selector-title"
      descriptionId="album-selector-description"
      presentation="sheet"
    >
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {movie && (
            <span className="w-12 h-[72px] rounded-xl overflow-hidden border border-border shrink-0 block">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : logoText}
                alt=""
                className="w-full h-full object-cover"
              />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-primary mb-1 block">Thêm vào album</span>
            <h2 id="album-selector-title" className="text-xl font-bold text-text-primary truncate tracking-tight font-display">
              {movie ? getDisplayTitle(movie) : 'Chọn album'}
            </h2>
            <p id="album-selector-description" className="text-sm text-text-secondary mt-1">Lưu giữ phim vào danh sách yêu thích của bạn</p>
          </div>
        </div>
        <IconButton label="Đóng bảng chọn album" onClick={onClose} variant="ghost">
          <span aria-hidden="true" className="text-lg leading-none">×</span>
        </IconButton>
      </div>

      <DialogBody>
        {showCreateForm ? (
          <div className="mb-6 p-5 border border-primary/20 rounded-2xl bg-primary/5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Tạo album mới</h3>
            <div className="space-y-4">
              <label htmlFor="album-selector-new-name" className="sr-only">Tên album mới</label>
              <input
                id="album-selector-new-name"
                type="text"
                placeholder="Nhập tên album…"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
                className="w-full h-11 px-5 rounded-2xl border border-border bg-surface text-text-primary font-bold placeholder-text-secondary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateAlbum}
                  disabled={creatingAlbum || !newAlbumName.trim()}
                  loading={creatingAlbum}
                  className="flex-1"
                >
                  {creatingAlbum ? 'Đang xử lý…' : 'Tạo album'}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="w-full p-5 mb-6 rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-4">
              <span aria-hidden="true" className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                <FolderPlus size={24} className="text-primary" />
              </span>
              <span className="flex-1">
                <span className="block font-bold text-primary text-lg">Tạo bộ sưu tập mới</span>
                <span className="block text-sm text-text-secondary">Phân loại phim theo sở thích riêng</span>
              </span>
            </span>
          </button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loading size={40} fullScreen={false} />
            <p className="text-xs font-semibold text-text-secondary">Đang tải album…</p>
          </div>
        ) : availableAlbums.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="Trống trải quá"
            description={albums.length === 0
              ? 'Bạn chưa có album nào. Hãy tạo cái đầu tiên để bắt đầu lưu trữ!'
              : 'Phim này đã có mặt trong tất cả các album hiện có của bạn.'
            }
            compact
          />
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary ml-1">Chọn album</h3>
            {availableAlbums.map(album => (
              <button
                key={album.docId}
                type="button"
                onClick={() => handleAddToAlbum(album)}
                disabled={addingToAlbum === album.docId}
                aria-label={`Thêm phim vào album ${album.name}`}
                className="w-full p-4 rounded-3xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer"
              >
                <span className="flex items-center gap-4">
                  <span aria-hidden="true" className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-border">
                    <Film size={22} className="text-text-secondary" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-text-primary text-lg truncate">
                      {album.name}
                    </span>
                    <span className="block text-sm text-text-secondary font-medium">
                      {album.movieDocIds.length} phim trong bộ sưu tập
                    </span>
                  </span>
                  <span className="text-primary font-bold text-xs shrink-0">
                    {addingToAlbum === album.docId ? 'Đang xử lý…' : 'Chọn'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default AlbumSelectorModal;
