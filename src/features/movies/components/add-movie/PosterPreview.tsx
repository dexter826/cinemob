import { Image as ImageIcon } from 'lucide-react';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';

interface PosterPreviewProps {
  posterPath: string;
  title: string;
}

// Xem trước poster phim
function PosterPreview({
  posterPath,
  title
}: PosterPreviewProps) {
  return (
    <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none md:w-full mx-auto shrink-0">
      <div className="relative group aspect-2/3 rounded-2xl sm:rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-border shadow-card transition-shadow hover:shadow-elevated">
        {posterPath ? (
          <>
            <img
              src={getTMDBImageUrl(posterPath, 'w500')}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-3 bg-linear-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border">
              <ImageIcon size={32} className="opacity-30 text-text-secondary" />
            </div>
            <span className="text-[11px] font-bold opacity-60 uppercase tracking-wider">Chưa có ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterPreview;
