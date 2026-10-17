import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { classNames } from '@/shared/utils/class-names';

interface PosterCardProps {
  /** TMDB id (Movie.id). */
  id: number | string;
  title: string;
  posterPath: string | null;
  mediaType?: 'movie' | 'tv';
  /** Điểm người dùng; fallback TMDB vote_average. Ẩn nếu <= 0. */
  rating?: number;
  /** Dòng meta caps dưới tiêu đề, vd "Tâm lý · 2025". */
  meta?: string;
  /** 'manual' → posterPath là URL trực tiếp, không ghép base TMDB (đồng bộ movie-card). */
  source?: 'tmdb' | 'manual';
  /** TV progress: thanh 2px dưới cùng poster. */
  progress?: { current: number; total: number } | null;
  /** Bật hero transition sang /movie/:id (Task 6) — bỏ khi reduced-motion. */
  layoutId?: string;
  className?: string;
}

/**
 * Poster card editorial: poster là nguồn màu duy nhất, hover = viền vàng 1px
 * + ảnh phóng nhẹ bên trong frame (không lift, không bóng).
 */
function PosterCard({
  id,
  title,
  posterPath,
  mediaType,
  rating,
  meta,
  source = 'tmdb',
  progress,
  layoutId,
  className,
}: PosterCardProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  const imageUrl =
    posterPath && source === 'manual' ? posterPath : getTMDBImageUrl(posterPath, 'w500');
  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : null;
  const showRating = typeof rating === 'number' && rating > 0;

  const handleClick = () => {
    navigate(`/movie/${id}${mediaType === 'tv' ? '?type=tv' : ''}`);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      layoutId={!reducedMotion && layoutId ? layoutId : undefined}
      aria-label={`Xem chi tiết phim ${title}`}
      className={classNames(
        'group relative block w-full aspect-2/3 rounded-poster overflow-hidden',
        'bg-surface border border-border cursor-pointer text-left p-0',
        'ring-inset transition-[outline-color] duration-200',
        'hover:ring-1 hover:ring-primary focus-visible:ring-1 focus-visible:ring-primary',
        className ?? '',
      )}
    >
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />

      {/* Scrim chức năng: nền tối để chữ đọc được trên ảnh */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
      />

      {showRating && (
        <span className="absolute top-1.5 right-2 flex items-center gap-1 text-[11px] font-bold text-primary">
          <Star size={11} className="fill-primary" aria-hidden="true" />
          {rating.toFixed(1)}
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 block p-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.05em] leading-[1.35] text-white line-clamp-2">
          {title}
        </span>
        {meta && (
          <span className="block mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/55 truncate">
            {meta}
          </span>
        )}
      </span>

      {progressPercent !== null && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-black/40">
          <span className="block h-full bg-primary" style={{ width: `${progressPercent}%` }} />
        </span>
      )}
    </motion.button>
  );
}

export default PosterCard;
