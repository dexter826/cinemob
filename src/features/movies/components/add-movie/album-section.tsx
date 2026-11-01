import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import { Button, TextField } from '@/shared/components/ui';
import { useEffect, useRef } from 'react';
import { FolderPlus, Plus, X } from 'lucide-react';
import MultiSelectDropdown from '@/shared/components/ui/multi-select-dropdown';
import { Album } from '@/types';

interface AlbumSectionProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  isEditMode: boolean;
  showCreateAlbum: boolean;
  setShowCreateAlbum: (show: boolean) => void;
  newAlbumName: string;
  setNewAlbumName: (name: string) => void;
  handleCreateAlbum: () => void;
  creatingAlbum: boolean;
  albums: Album[];
  selectedAlbumIds: string[];
  setSelectedAlbumIds: (ids: string[]) => void;
}

function AlbumSection({
  loading,
  error,
  onRetry,
  isEditMode,
  showCreateAlbum,
  setShowCreateAlbum,
  newAlbumName,
  setNewAlbumName,
  handleCreateAlbum,
  creatingAlbum,
  albums,
  selectedAlbumIds,
  setSelectedAlbumIds,
}: AlbumSectionProps) {
  const newAlbumInputRef = useRef<HTMLInputElement>(null);

  // Chỉ tự focus input trên thiết bị trỏ chuột; mobile tránh mở keyboard đột ngột.
  useEffect(() => {
    if (showCreateAlbum && window.matchMedia('(hover: hover)').matches) {
      newAlbumInputRef.current?.focus();
    }
  }, [showCreateAlbum]);

  if (loading)
    return (
      <div aria-busy="true" className="pt-5 border-t border-border-default space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="ml-1 h-3 w-32" />
          <Skeleton className="h-8 w-20 rounded-control" />
        </div>
        <Skeleton className="h-11 w-full rounded-control" />
      </div>
    );
  if (error)
    return (
      <ErrorState
        title={error}
        description="Tải lại album trước khi lưu phim."
        retry={{ label: 'Thử lại', onClick: onRetry }}
        compact
      />
    );
  return (
    <div className="pt-5 border-t border-border-default space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-label-caps text-text-secondary flex items-center gap-1.5 ml-1">
          <FolderPlus size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />{' '}
          {isEditMode ? 'Quản lý album' : 'Thêm vào album'}
        </span>
        <button
          type="button"
          onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          aria-expanded={showCreateAlbum}
          aria-label={showCreateAlbum ? 'Hủy tạo album' : 'Tạo album mới'}
          className={`text-body-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-control transition-colors border cursor-pointer focus-ring focus-visible:outline-none ${showCreateAlbum ? 'text-danger bg-danger/10 border-danger/20' : 'bg-primary text-on-primary border-transparent'}`}
        >
          {showCreateAlbum ? (
            <>
              <X size={12} strokeWidth={1.5} aria-hidden="true" /> Hủy
            </>
          ) : (
            <>
              <Plus size={12} strokeWidth={1.5} aria-hidden="true" /> Tạo mới
            </>
          )}
        </button>
      </div>

      {showCreateAlbum && (
        <div className="flex gap-3 p-4 rounded-card border border-border">
          <TextField
            ref={newAlbumInputRef}
            id="new-album-name"
            name="new-album-name"
            type="text"
            autoComplete="off"
            aria-label="Tên album mới"
            placeholder="Nhập tên album…"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateAlbum();
              }
            }}
            variant="boxed"
            inputClassName="bg-surface font-medium"
            className="flex-1 min-w-0"
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateAlbum}
            disabled={!newAlbumName.trim()}
            loading={creatingAlbum}
            aria-label="Tạo album mới"
          >
            Tạo
          </Button>
        </div>
      )}

      <MultiSelectDropdown
        options={albums.map((album) => ({ value: album.docId || '', label: album.name }))}
        values={selectedAlbumIds}
        onChange={(values) => setSelectedAlbumIds(values as string[])}
        placeholder="Tìm hoặc chọn album…"
        searchable={true}
        maxDisplay={3}
        className="w-full"
      />
    </div>
  );
}

export default AlbumSection;
