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
    <div className="pt-5 border-t border-border-default space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
          <FolderPlus size={14} /> {isEditMode ? 'Quản lý Album' : 'Thêm vào Album'}
        </label>
        <button
          type="button"
          onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${showCreateAlbum ? 'text-error bg-error/10 border-error/20' : 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/20'}`}
        >
          {showCreateAlbum ? (
            <>
              <X size={12} /> Hủy
            </>
          ) : (
            <>
              <Plus size={12} /> Tạo mới
            </>
          )}
        </button>
      </div>

      {showCreateAlbum && (
        <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default shadow-sm">
          <input
            type="text"
            placeholder="Tên album mới..."
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
            className="flex-1 bg-surface border border-border-default rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateAlbum}
            disabled={creatingAlbum || !newAlbumName.trim()}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-premium disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
          >
            {creatingAlbum ? <Loader2 size={18} className="animate-spin" /> : 'Tạo'}
          </button>
        </div>
      )}

      <MultiSelectDropdown
        options={albums.map(album => ({ value: album.docId || '', label: album.name }))}
        values={selectedAlbumIds}
        onChange={(values) => setSelectedAlbumIds(values as string[])}
        placeholder="Tìm hoặc chọn album..."
        searchable={true}
        maxDisplay={3}
        className="w-full"
      />
    </div>
  );
};

export default AlbumSection;
