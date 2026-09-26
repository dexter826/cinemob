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
  const displayRating = hoverRating || rating;

  const handleGroupKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setRating(Math.min(10, (rating || 0) + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setRating(Math.max(0, (rating || 0) - 1));
    }
  };

  return (
    <div ref={ratingRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <span id="add-movie-rating-label" className="text-sm font-semibold text-text-primary flex items-center gap-1.5 ml-1">
          <Star size={14} className="text-primary" aria-hidden="true" />
          Đánh giá phim
        </span>
        <span aria-live="polite" className="text-xs font-bold text-text-secondary tabular-nums">
          {displayRating > 0 ? `${displayRating}/10` : 'Chưa đánh giá'}
        </span>
      </div>
      <div className={`bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 transition-colors shadow-sm ${
        isAnimating ? 'border-danger/50' : ''
      }`}>
        <div
          role="radiogroup"
          aria-labelledby="add-movie-rating-label"
          onKeyDown={handleGroupKeyDown}
          className="flex justify-between items-center max-w-full overflow-hidden"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`Đánh giá ${star} trên 10`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              className="p-0.5 sm:p-1.5 transition-colors flex-1 flex justify-center cursor-pointer rounded-lg"
            >
              <Star
                aria-hidden="true"
                className={`w-4 h-4 sm:w-6 sm:h-6 transition-colors ${
                  star <= displayRating
                    ? 'fill-warning text-warning'
                    : 'text-text-secondary/40'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RatingSection;
