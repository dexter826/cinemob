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
    <div className="w-full max-w-60 sm:max-w-none sm:md:w-80 mx-auto md:mx-0 shrink-0 space-y-4">
      <div className="relative group aspect-2/3 rounded-3xl sm:rounded-4xl overflow-hidden bg-black/5 dark:bg-white/5 border border-border-default shadow-premium">
        {posterPath ? (
          <>
            <img
              src={getTMDBImageUrl(posterPath, 'w500')}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-4 bg-linear-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10">
            <div className="w-20 h-20 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border-default/50">
              <ImageIcon size={40} className="opacity-20" />
            </div>
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Chưa có ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterPreview;
