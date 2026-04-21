import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { getTMDBImageUrl } from '../../../utils/movieUtils';

interface PosterPreviewProps {
  posterPath: string;
  title: string;
  isManualMode: boolean;
  onPosterClick?: () => void;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({
  posterPath,
  title,
  isManualMode,
  onPosterClick
}) => {
  return (
    <div className="md:w-72 shrink-0 space-y-4">
      <div className="relative group aspect-2/3 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-white/10 shadow-xl">
        {posterPath ? (
          <img
            src={getTMDBImageUrl(posterPath, 'w500')}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
            <ImageIcon size={48} className="opacity-20" />
            <span className="text-xs font-medium opacity-40">Không có ảnh</span>
          </div>
        )}
        {isManualMode && (
          <button
            type="button"
            onClick={onPosterClick}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-white"
          >
            <Camera size={32} />
            <span className="text-sm font-medium">Thay đổi ảnh</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PosterPreview;
