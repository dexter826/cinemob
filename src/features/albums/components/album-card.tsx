import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Album } from '@/types';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';

interface AlbumCardProps {
  album: Album;
  /** Poster của tối đa 3 phim đầu tiên (bìa + 2 lớp chồng sau). */
  coverPosters: (string | null)[];
  onDelete: (album: Album) => void;
  /** Vị trí trong lưới — dùng cho stagger fade khi tải. */
  index: number;
}

/**
 * Thẻ album (editorial): chồng poster kiểu túi đựng ảnh — poster bìa trước,
 * 2 poster sau lệch nhẹ, hover xòe ra. Không bóng: lớp sau phân tách bằng
 * hairline. Album trống = ô đứt nét + chữ "TRỐNG" mờ.
 */
function AlbumCard({ album, coverPosters, onDelete, index }: AlbumCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const count = album.movieDocIds.length;
  const cover = coverPosters[0] ?? null;
  const backRight = coverPosters[2] ?? null;
  const backLeft = coverPosters[1] ?? null;

  const fanClasses = (variant: 'left' | 'right') => `
    absolute inset-0 rounded-poster border border-border bg-surface overflow-hidden
    transition-transform duration-300 ease-out
    ${
      variant === 'left'
        ? 'rotate-[-1.5deg] -translate-x-[2%] group-hover:-rotate-[6deg] group-hover:-translate-x-[6%]'
        : 'rotate-[1.5deg] translate-x-[2%] group-hover:rotate-[6deg] group-hover:translate-x-[6%]'
    }
  `;

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: reducedMotion ? 0 : Math.min(index * 0.05, 0.4) }}
      className="group relative block aspect-2/3"
    >
      <Link
        to={`/albums/${album.docId}`}
        aria-label={`Mở album ${album.name}, ${count} phim`}
        onClick={(event) => {
          if (!album.docId) event.preventDefault();
        }}
        className="absolute inset-0 z-30"
      >
        <span className="sr-only">Mở album {album.name}</span>
      </Link>

      {/* Chồng sau: các phim tiếp theo trong album (xòe khi hover) */}
      {backLeft && (
        <div className={fanClasses('left')}>
          <img
            src={getTMDBImageUrl(backLeft, 'w185')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {backRight && (
        <div className={fanClasses('right')}>
          <img
            src={getTMDBImageUrl(backRight, 'w185')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {cover ? (
        <div className="absolute inset-0 z-20 rounded-poster overflow-hidden bg-surface border border-border transition-[outline-color] duration-200 group-hover:ring-1 group-hover:ring-primary group-focus-within:ring-1 group-focus-within:ring-primary">
          <img
            src={getTMDBImageUrl(cover, 'w500')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />

          {/* Scrim chức năng: nền tối để chữ đọc được trên ảnh */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
          />

          {/* Info trên scrim */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
            <h3
              className="text-[11px] font-bold tracking-[0.05em] leading-[1.35] text-white line-clamp-2"
              title={album.name}
            >
              {album.name}
            </h3>
            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] text-white/55 uppercase tabular-nums">
              {count} phim
            </p>
          </div>
        </div>
      ) : (
        /* Album trống: ô đứt nét + nhãn mờ */
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-poster border border-dashed border-border bg-surface">
          <span className="text-[10px] font-semibold tracking-[0.1em] text-text-secondary opacity-60 uppercase">
            Trống
          </span>
        </div>
      )}

      {/* Nút xóa: mobile luôn hiện, desktop hiện khi hover */}
      <button
        type="button"
        aria-label={`Xóa album ${album.name}`}
        onClick={() => onDelete(album)}
        className="absolute top-2 right-2 z-40 min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-[opacity,color,background-color] duration-200 cursor-pointer"
      >
        <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </motion.article>
  );
}

export default AlbumCard;
