import { PLACEHOLDER_IMAGE } from '@/constants';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Album } from '@/types';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';

interface AlbumCardProps {
  album: Album;
  /** Poster của tối đa 3 phim đầu tiên (bìa + 2 lớp chồng sau). */
  coverPosters: (string | null)[];
  onDelete: (album: Album) => void;
}

function AlbumCard({ album, coverPosters, onDelete }: AlbumCardProps) {
  const count = album.movieDocIds.length;
  const cover = coverPosters[0] ?? null;
  const backRight = coverPosters[2] ?? null;
  const backLeft = coverPosters[1] ?? null;

  const fanClasses = (variant: 'left' | 'right') => `
    absolute inset-0 rounded-poster border border-border bg-surface overflow-hidden
    transition-transform duration-200 ease-out
    ${
      variant === 'left'
        ? 'rotate-[-1.5deg] -translate-x-[2%] group-hover:-rotate-[6deg] group-hover:-translate-x-[6%]'
        : 'rotate-[1.5deg] translate-x-[2%] group-hover:rotate-[6deg] group-hover:translate-x-[6%]'
    }
  `;

  return (
    <article className="group relative block aspect-2/3">
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

      {backLeft && (
        <div className={fanClasses('left')}>
          <img
            src={getTMDBImageUrl(backLeft, 'w185')}
            alt=""
            aria-hidden="true"
            width={185}
            height={278}
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              if (image.getAttribute('src') !== PLACEHOLDER_IMAGE) image.src = PLACEHOLDER_IMAGE;
            }}
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
            width={185}
            height={278}
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              if (image.getAttribute('src') !== PLACEHOLDER_IMAGE) image.src = PLACEHOLDER_IMAGE;
            }}
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {cover ? (
        <div className="absolute inset-0 z-20 rounded-poster overflow-hidden bg-surface border border-border group-has-[:focus-visible]:ring-1 group-has-[:focus-visible]:ring-primary">
          <img
            src={getTMDBImageUrl(cover, 'w500')}
            alt=""
            aria-hidden="true"
            width={500}
            height={750}
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              if (image.getAttribute('src') !== PLACEHOLDER_IMAGE) image.src = PLACEHOLDER_IMAGE;
            }}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
          />

          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
          />

          <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
            <h3 className="text-body-sm font-bold text-white line-clamp-2" title={album.name}>
              {album.name}
            </h3>
            <p className="mt-0.5 text-micro-caps normal-case text-white/55 tabular-nums">
              {count} phim
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-poster border border-dashed border-border bg-surface">
          <span className="text-label-caps text-text-secondary opacity-60">Trống</span>
        </div>
      )}

      <button
        type="button"
        aria-label={`Xóa album ${album.name}`}
        onClick={() => onDelete(album)}
        className="absolute top-2 right-2 z-40 min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-[opacity,color,background-color] duration-150 cursor-pointer"
      >
        <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </article>
  );
}

export default AlbumCard;
