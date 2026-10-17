import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bookmark, CheckCircle, Eye, Star, X } from 'lucide-react';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { Chip } from '@/shared/components/ui';
import { classNames } from '@/shared/utils/class-names';

interface PosterCardProps {
  title: string;
  posterPath: string | null;
  /** 'manual' → posterPath là URL trực tiếp, không ghép base TMDB. */
  source?: 'tmdb' | 'manual';
  mediaType?: 'movie' | 'tv';
  rating?: number;
  /** Dòng meta caps dưới tiêu đề, vd "Tâm lý · 2025". */
  meta?: string;
  /** TV progress: thanh 2px dưới cùng poster. */
  progress?: { current: number; total: number } | null;
  /** Badge trạng thái bộ sưu tập (Đã xem / Sẽ xem). */
  status?: 'history' | 'watchlist' | null;
  /** Nhân vật / vai trò (trang diễn viên) — dòng vàng dưới meta. */
  credit?: string;
  /** Đánh dấu phim có review. */
  review?: boolean;
  /** Nút bỏ gợi ý (góc phải trên, trên cùng). */
  onRemove?: () => void;
  /** Icon actions (xóa/sửa/đã xem) — desktop hiện khi hover, mobile luôn hiện. */
  actions?: React.ReactNode;
  /** Chế độ chọn (album selector): overlay check theo `selected`. */
  selectable?: boolean;
  selected?: boolean;
  /** Không truyền → card chỉ hiển thị, không bấm được (vd profile công khai). */
  onClick?: () => void;
  ariaLabel?: string;
  layoutId?: string;
  className?: string;
}

/**
 * Card DUY NHẤT của app (editorial): poster là cả thẻ, chữ trên scrim.
 * Hover = viền vàng 1px + ảnh phóng nhẹ bên trong — không lift, không bóng.
 */
function PosterCard({
  title,
  posterPath,
  source = 'tmdb',
  mediaType,
  rating,
  meta,
  progress,
  status,
  credit,
  review,
  onRemove,
  actions,
  selectable = false,
  selected = false,
  onClick,
  ariaLabel,
  layoutId,
  className,
}: PosterCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const imageUrl =
    posterPath && source === 'manual' ? posterPath : getTMDBImageUrl(posterPath, 'w500');
  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : null;
  const showRating = typeof rating === 'number' && rating > 0;
  const statusLabel = status === 'history' ? 'Đã xem' : status === 'watchlist' ? 'Sẽ xem' : null;
  const kindLabel = mediaType === 'tv' ? 'Series' : 'Phim';

  return (
    <motion.article
      layoutId={!reducedMotion && layoutId ? layoutId : undefined}
      className={classNames(
        'group relative block aspect-2/3 rounded-poster overflow-hidden',
        'bg-surface border border-border',
        selected ? 'ring-1 ring-primary' : 'ring-inset transition-[outline-color] duration-200',
        onClick && !selected && 'hover:ring-1 hover:ring-primary',
        selectable || onClick ? 'cursor-pointer' : '',
        className ?? '',
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel ?? `Xem chi tiết ${kindLabel.toLowerCase()} ${title}`}
          className="absolute inset-0 w-full h-full cursor-pointer p-0 text-left"
        >
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </button>
      ) : (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Scrim chức năng: nền tối để chữ đọc được trên ảnh */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
      />

      {/* Badges góc trái trên */}
      <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
        {statusLabel && (
          <Chip
            tone={status === 'history' ? 'success' : 'gold'}
            icon={<Bookmark size={9} className="fill-current" aria-hidden="true" />}
          >
            {statusLabel}
          </Chip>
        )}
        {showRating && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-poster bg-black/60 border border-white/10 text-[10px] font-bold text-primary tabular-nums">
            <Star size={9} className="fill-primary" aria-hidden="true" />
            {rating!.toFixed(1)}
          </span>
        )}
      </div>

      {/* Review chip */}
      {review && (
        <span className="absolute bottom-12 left-2.5 z-10 pointer-events-none">
          <Chip icon={<Eye size={9} aria-hidden="true" />}>Review</Chip>
        </span>
      )}

      {/* Cột phải trên: nút bỏ gợi ý + actions tùy chọn */}
      {(onRemove || actions) && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-200">
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Bỏ gợi ý ${title}`}
              title="Không quan tâm"
              className="min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 transition-colors cursor-pointer"
            >
              <X size={13} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
          {actions}
        </div>
      )}

      {/* Overlay chọn (album selector) */}
      {selectable && selected && (
        <div className="absolute inset-0 z-10 bg-primary/25 border border-primary flex items-center justify-center pointer-events-none">
          <CheckCircle className="text-white" size={40} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}

      {/* Info trên scrim */}
      <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
        <h3
          className="text-[11px] font-bold tracking-[0.05em] leading-[1.35] text-white line-clamp-2"
          title={title}
        >
          {title}
        </h3>
        {meta && (
          <p className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] text-white/55 truncate">
            {meta}
          </p>
        )}
        {credit && (
          <p className="mt-1 pt-1 border-t border-white/15 text-[9px] font-semibold tracking-[0.08em] text-primary truncate">
            {credit}
          </p>
        )}
      </div>

      {/* Progress TV */}
      {progressPercent !== null && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-black/40">
          <span className="block h-full bg-primary" style={{ width: `${progressPercent}%` }} />
        </span>
      )}
    </motion.article>
  );
}

export default PosterCard;
