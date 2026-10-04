import { FolderPlus, Plus, X, Loader2 } from 'lucide-react';
import MultiSelectDropdown from '@/shared/components/ui/MultiSelectDropdown';
import { Album } from '@/types';

interface AlbumSectionProps {
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
          className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border cursor-pointer ${showCreateAlbum ? 'text-danger bg-danger/10 border-danger/20' : 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/20'}`}
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
        <div className="flex gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-card border border-border">
          <input
            type="text"
            placeholder="Tên album mới…"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
            className="flex-1 bg-surface border border-border-default rounded-control px-4 py-2.5 text-sm font-medium focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 outline-none transition-colors"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateAlbum}
            disabled={creatingAlbum || !newAlbumName.trim()}
            className="px-5 py-2.5 bg-primary text-white rounded-control text-sm font-bold hover:shadow-premium disabled:opacity-40 transition-colors shadow-lg shadow-primary/20"
          >
            {creatingAlbum ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              'Tạo'
            )}
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
