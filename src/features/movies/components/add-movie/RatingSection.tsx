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

function RatingSection({
  rating,
  hoverRating,
  isAnimating,
  setRating,
  setHoverRating,
  ratingRef
}: RatingSectionProps) {
  return (
    <div ref={ratingRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted flex items-center gap-1.5 ml-1">
          <Star size={14} className="text-primary" />
          Đánh giá phim
        </label>
      </div>
      <div className={`bg-black/5 dark:bg-white/5 border border-border-default rounded-xl p-4 transition-colors duration-500 shadow-sm ${
        isAnimating ? 'scale-105 border-error/50 shadow-md' : ''
      }`}>
        <div className="flex justify-between items-center max-w-full overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="group p-0.5 sm:p-1.5 focus:outline-none transition-colors flex-1 flex justify-center cursor-pointer"
            >
              <Star
                className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                  star <= (hoverRating || rating)
                    ? 'fill-warning text-warning scale-110 drop-shadow-sm'
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
