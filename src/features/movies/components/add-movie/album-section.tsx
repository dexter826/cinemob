import Loading from '@/shared/components/ui/loading';
import ErrorState from '@/shared/components/ui/error-state';
import Spinner from '@/shared/components/ui/spinner';
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

  if (loading) return <Loading text="Đang tải album…" />;
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
        <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5 ml-1">
          <FolderPlus size={14} className="text-primary" aria-hidden="true" />{' '}
          {isEditMode ? 'Quản lý Album' : 'Thêm vào Album'}
        </label>
        <button
          type="button"
          onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border cursor-pointer ${showCreateAlbum ? 'text-danger bg-danger/10 border-danger/20' : 'bg-primary text-on-primary border-transparent'}`}
        >
          {showCreateAlbum ? (
            <>
              <X size={12} aria-hidden="true" /> Hủy
            </>
          ) : (
            <>
              <Plus size={12} aria-hidden="true" /> Tạo mới
            </>
          )}
        </button>
      </div>

      {showCreateAlbum && (
        <div className="flex gap-3 p-4 rounded-card border border-border">
          <input
            ref={newAlbumInputRef}
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
            className="flex-1 bg-surface border border-border-default rounded-control px-4 py-2.5 text-sm font-medium focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 transition-colors"
          />
          <button
            type="button"
            onClick={handleCreateAlbum}
            disabled={creatingAlbum || !newAlbumName.trim()}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-control text-sm font-bold disabled:opacity-40 transition-colors"
          >
            {creatingAlbum ? <Spinner size={18} className="text-current" /> : 'Tạo'}
          </button>
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
