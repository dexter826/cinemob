import ErrorState from '@/shared/components/ui/error-state';
import { useEffect, useRef, useState } from 'react';
import { FolderPlus, Film, X } from 'lucide-react';
import { Movie, Album } from '@/types';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToastStore from '@/shared/stores/toast-store';
import useAlbumStore from '../stores/album-store';
import { updateAlbum, addAlbum } from '../services/album-service';
import { getDisplayTitle } from '@/features/movies/utils/movie-utils';
import Skeleton from '@/shared/components/ui/skeleton';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import EmptyState from '@/shared/components/ui/empty-state';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { MESSAGES } from '@/constants/messages';
import { Dialog, DialogBody } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { IconButton } from '@/shared/components/ui/icon-button';

interface AlbumSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

function AlbumSelectorModal({ isOpen, onClose, movie }: AlbumSelectorModalProps) {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { albums, loading, error, retry } = useAlbumStore();
  const [addingToAlbum, setAddingToAlbum] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const newAlbumInputRef = useRef<HTMLInputElement>(null);
  const creatingRef = useRef(false);

  // Chỉ tự focus input trên thiết bị trỏ chuột; mobile tránh bật keyboard đột ngột.
  useEffect(() => {
    if (isOpen && showCreateForm && window.matchMedia('(hover: hover)').matches) {
      newAlbumInputRef.current?.focus();
    }
  }, [isOpen, showCreateForm]);

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
    // Ref-guard chống double-submit trong cùng một tick render.
    if (creatingRef.current || !newAlbumName.trim() || !user) return;
    creatingRef.current = true;

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
      creatingRef.current = false;
      setCreatingAlbum(false);
    }
  };

  const availableAlbums = albums.filter(
    (album) => album.movieDocIds && !album.movieDocIds.includes(movie?.docId || ''),
  );
  const showSkeleton = useDelayedSkeleton(loading && albums.length === 0);

  return (
    <Dialog open={isOpen} onClose={onClose} titleId="album-selector-title" presentation="sheet">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {movie && (
            <span className="w-12 h-[72px] rounded-control overflow-hidden border border-border shrink-0 block">
              <img
                src={getTMDBImageUrl(movie.poster_path, 'w200')}
                alt=""
                width={200}
                height={300}
                className="w-full h-full object-cover"
              />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-label-caps text-primary mb-1 block">Thêm vào album</span>
            <h2
              id="album-selector-title"
              className="text-display-md text-text-primary truncate tracking-tight"
            >
              {movie ? getDisplayTitle(movie) : 'Chọn album'}
            </h2>
          </div>
        </div>
        <IconButton label="Đóng bảng chọn album" onClick={onClose} variant="ghost">
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </IconButton>
      </div>

      <DialogBody className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {showCreateForm ? (
          <div className="mb-6 p-5 border border-border rounded-card">
            <h3 className="text-body font-semibold text-text-primary mb-3">Tạo album mới</h3>
            <div className="space-y-4">
              <label htmlFor="album-selector-new-name" className="sr-only">
                Tên album mới
              </label>
              <input
                id="album-selector-new-name"
                name="album-name"
                type="text"
                placeholder="Nhập tên album…"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creatingAlbum) {
                    e.preventDefault();
                    handleCreateAlbum();
                  }
                }}
                autoComplete="off"
                className="w-full h-11 px-5 rounded-card border border-border bg-surface text-body font-bold placeholder:text-text-muted focus-visible:border-primary/50 focus-ring transition-colors"
                ref={newAlbumInputRef}
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
            className="w-full p-5 mb-6 rounded-dialog border-2 border-dashed border-border hover:border-primary/60 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="w-12 h-12 rounded-control flex items-center justify-center shrink-0 border border-border"
              >
                <FolderPlus size={24} strokeWidth={1.5} className="text-primary" />
              </span>
              <span className="flex-1">
                <span className="block text-title-md text-primary">Tạo album mới</span>
              </span>
            </span>
          </button>
        )}

        {error ? (
          <ErrorState
            title={error}
            description="Vui lòng thử tải lại album."
            retry={{ label: 'Thử lại', onClick: retry }}
          />
        ) : loading && albums.length === 0 ? (
          showSkeleton ? (
            <div aria-busy="true" className="space-y-3">
              <Skeleton className="ml-1 h-3 w-24" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-dialog border border-border"
                >
                  <Skeleton className="h-12 w-12 rounded-control shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-10 shrink-0" />
                </div>
              ))}
            </div>
          ) : null
        ) : availableAlbums.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="Không có album để thêm"
            description={
              albums.length === 0
                ? 'Bạn chưa có album nào.'
                : 'Phim này đã có trong tất cả album của bạn.'
            }
            compact
          />
        ) : (
          <div aria-busy={loading} className="space-y-3">
            <h3 className="text-label-caps text-text-secondary ml-1">Chọn album</h3>
            {availableAlbums.map((album) => (
              <button
                key={album.docId}
                type="button"
                onClick={() => handleAddToAlbum(album)}
                disabled={addingToAlbum === album.docId}
                aria-label={`Thêm phim vào album ${album.name}`}
                className="w-full p-4 rounded-dialog border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer"
              >
                <span className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="w-12 h-12 rounded-control flex items-center justify-center shrink-0 border border-border"
                  >
                    <Film size={22} strokeWidth={1.5} className="text-text-secondary" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-title-md text-text-primary truncate">
                      {album.name}
                    </span>
                    <span className="block text-body text-text-secondary">
                      {album.movieDocIds.length} phim
                    </span>
                  </span>
                  <span className="text-primary font-bold text-body-sm shrink-0">
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
