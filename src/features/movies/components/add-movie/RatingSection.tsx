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
  ratingRef,
}: RatingSectionProps) {
  const displayRating = hoverRating || rating;
  const groupRef = React.useRef<HTMLDivElement>(null);

  const handleGroupKeyDown = (event: React.KeyboardEvent) => {
    const dir =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? -1
          : 0;
    if (!dir) return;
    event.preventDefault();
    const next = Math.min(10, Math.max(1, (rating || 0) + dir));
    setRating(next);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next - 1]?.focus();
  };

  return (
    <div ref={ratingRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          id="add-movie-rating-label"
          className="text-sm font-semibold text-text-primary flex items-center gap-1.5 ml-1"
        >
          <Star size={14} className="text-primary" aria-hidden="true" />
          Đánh giá phim
        </span>
        <span aria-live="polite" className="text-xs font-bold text-text-secondary tabular-nums">
          {displayRating > 0 ? `${displayRating}/10` : 'Chưa đánh giá'}
        </span>
      </div>
      <div
        className={`bg-black/5 dark:bg-white/5 border border-border rounded-control p-4 transition-colors shadow-sm ${
          isAnimating ? 'border-danger/50' : ''
        }`}
      >
        <div
          ref={groupRef}
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
              tabIndex={rating === star || (rating === 0 && star === 1) ? 0 : -1}
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
                  star <= displayRating ? 'fill-warning text-warning' : 'text-text-secondary/40'
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
