import React from 'react';
import { Star } from 'lucide-react';

interface RatingSectionProps {
  rating: number;
  hoverRating: number;
  isAnimating: boolean;
  setRating: (rating: number) => void;
  setHoverRating: (rating: number) => void;
  ratingRef: React.RefObject<HTMLDivElement | null>;
}

const RatingSection: React.FC<RatingSectionProps> = ({
  rating,
  hoverRating,
  isAnimating,
  setRating,
  setHoverRating,
  ratingRef
}) => {
  return (
    <div ref={ratingRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
          <Star size={14} className="text-primary" />
          Đánh giá phim
        </label>
      </div>
      <div className={`bg-black/5 dark:bg-white/5 border border-border-default rounded-xl p-4 transition-all duration-500 shadow-sm ${
        isAnimating ? 'scale-105 border-error/50 shadow-lg shadow-error/5' : ''
      }`}>
        <div className="flex justify-between items-center max-w-full overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="group p-0.5 sm:p-1.5 focus:outline-none transition-all flex-1 flex justify-center"
            >
              <Star
                className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  star <= (hoverRating || rating)
                    ? 'fill-warning text-warning scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                    : 'text-text-muted/30 group-hover:text-warning/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSection;
