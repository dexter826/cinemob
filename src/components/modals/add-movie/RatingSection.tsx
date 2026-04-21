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
    <div 
      ref={ratingRef} 
      className={`bg-black/5 dark:bg-white/5 rounded-xl p-4 space-y-3 transition-transform duration-500 ${
        isAnimating ? 'scale-110' : ''
      }`}
    >
      <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">
        Đánh giá
      </label>
      <div className="flex justify-between px-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="group p-1 focus:outline-none"
          >
            <Star
              size={28}
              className={`transition-all duration-200 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-500 text-yellow-500 scale-110'
                  : 'text-text-muted/40 group-hover:text-yellow-500/50 group-hover:scale-110'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingSection;
