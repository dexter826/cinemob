import React from 'react';
import { FolderPlus, Plus, X, Loader2 } from 'lucide-react';
import MultiSelectDropdown from '../../ui/MultiSelectDropdown';
import { Album } from '../../../types';

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

const AlbumSection: React.FC<AlbumSectionProps> = ({
  isEditMode,
  showCreateAlbum,
  setShowCreateAlbum,
  newAlbumName,
  setNewAlbumName,
  handleCreateAlbum,
  creatingAlbum,
  albums,
  selectedAlbumIds,
  setSelectedAlbumIds
}) => {
  return (
    <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <FolderPlus size={12} /> {isEditMode ? 'Quản lý Album' : 'Thêm vào Album'}
        </label>
        <button
          type="button"
          onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          className={`text-xs hover:underline font-medium flex items-center gap-1 transition-colors ${showCreateAlbum ? 'text-red-500' : 'text-primary'}`}
        >
          {showCreateAlbum ? (
            <>
              <X size={12} /> Hủy
            </>
          ) : (
            <>
              <Plus size={12} /> Tạo album mới
            </>
          )}
        </button>
      </div>

      {showCreateAlbum && (
        <div className="flex gap-2 animate-in slide-in-from-top-1 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
          <input
            type="text"
            placeholder="Tên album mới..."
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
            className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateAlbum}
            disabled={creatingAlbum || !newAlbumName.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {creatingAlbum ? <Loader2 size={16} className="animate-spin" /> : 'Tạo'}
          </button>
        </div>
      )}

      <MultiSelectDropdown
        options={albums.map(album => ({ value: album.docId || '', label: album.name }))}
        values={selectedAlbumIds}
        onChange={(values) => setSelectedAlbumIds(values as string[])}
        placeholder="Chọn album..."
        searchable={true}
        maxDisplay={3}
        className="w-full"
      />
    </div>
  );
};

export default AlbumSection;
