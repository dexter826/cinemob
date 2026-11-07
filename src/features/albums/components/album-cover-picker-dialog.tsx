import { useEffect, useId, useState } from 'react';
import { Images } from 'lucide-react';
import { Album, Movie } from '@/types';
import { updateAlbum } from '../services/album-service';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import { getMainTitle } from '@/features/movies/utils/movie-utils';
import { Dialog, DialogBody, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import PosterCard from '@/features/movies/components/poster-card';

const MAX_COVER_MOVIES = 3;

interface AlbumCoverPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | null;
  movies: Movie[];
}

/** Chọn tối đa 3 phim trong album làm ảnh bìa; bỏ chọn hết để trả về bìa tự động. */
function AlbumCoverPickerDialog({ isOpen, onClose, album, movies }: AlbumCoverPickerDialogProps) {
  const { showToast } = useToastStore();
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setPickedIds(album?.coverMovieDocIds ?? []);
  }, [isOpen, album]);

  const togglePick = (docId: string) => {
    setPickedIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : prev.length >= MAX_COVER_MOVIES
          ? prev
          : [...prev, docId],
    );
  };

  const handleSave = async () => {
    if (!album?.docId || isSaving) return;
    setIsSaving(true);
    try {
      await updateAlbum(album.docId, { coverMovieDocIds: pickedIds });
      showToast(MESSAGES.ALBUM.COVER_SAVED, 'success');
      onClose();
    } catch {
      showToast(MESSAGES.ALBUM.UPDATE_ERROR, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const dialogTitleId = useId();

  return (
    <Dialog open={isOpen} onClose={onClose} titleId={dialogTitleId} presentation="sheet">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <span
            aria-hidden="true"
            className="w-12 h-12 rounded-control flex items-center justify-center shrink-0 border border-border"
          >
            <Images size={22} strokeWidth={1.5} className="text-primary" />
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-label-caps text-primary mb-1 block">Ảnh bìa album</span>
            <h2 id={dialogTitleId} className="text-display-md text-text-primary truncate">
              {album?.name ?? ''}
            </h2>
            <p className="text-body-sm text-text-secondary mt-0.5">
              Chọn tới {MAX_COVER_MOVIES} phim ({pickedIds.length}/{MAX_COVER_MOVIES}) · bỏ chọn hết
              để dùng bìa tự động
            </p>
          </div>
        </div>
      </div>

      <DialogBody>
        <div aria-busy={isSaving} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {movies.map((movie) => (
            <PosterCard
              key={movie.docId}
              title={getMainTitle(movie)}
              posterPath={movie.poster_path}
              source={movie.source}
              selectable
              selected={!!movie.docId && pickedIds.includes(movie.docId)}
              onClick={() => movie.docId && togglePick(movie.docId)}
              ariaLabel={`Chọn “${getMainTitle(movie)}” làm ảnh bìa`}
            />
          ))}
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={isSaving}>
          Hủy
        </Button>
        <Button variant="primary" loading={isSaving} onClick={() => void handleSave()}>
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default AlbumCoverPickerDialog;
