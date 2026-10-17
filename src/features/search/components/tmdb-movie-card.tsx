import { TMDBMovieResult } from '@/types';
import { getMainTitleForTMDB, getSubTitleForTMDB, getTMDBImageUrl } from '@/shared/utils/tmdb';
import { Film, Tv, Bookmark, Star, X } from 'lucide-react';

interface TMDBMovieCardProps {
  movie: TMDBMovieResult;
  onClick: (movie: TMDBMovieResult) => void;
  status?: 'history' | 'watchlist' | null;
  character?: string;
  job?: string;
  onRemove?: (movie: TMDBMovieResult) => void;
}

/** Thẻ TMDB editorial: poster là cả thẻ, info trên scrim, badge trạng thái flat. */
function TMDBMovieCard({ movie, onClick, status, character, job, onRemove }: TMDBMovieCardProps) {
  const mainTitle = getMainTitleForTMDB(movie);
  const subTitle = getSubTitleForTMDB(movie);
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  const isTV = movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <article className="group relative aspect-2/3 rounded-poster overflow-hidden border border-border bg-surface ring-inset transition-[outline-color] duration-200 hover:ring-1 hover:ring-primary">
      <button
        type="button"
        onClick={() => onClick(movie)}
        aria-label={
          status ? `Mở chi tiết phim ${mainTitle}` : `Thêm phim ${mainTitle} vào bộ sưu tập`
        }
        className="absolute inset-0 w-full h-full cursor-pointer p-0 text-left"
      >
        <img
          src={getTMDBImageUrl(movie.poster_path, 'w500')}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </button>

      {/* Scrim chức năng: nền tối để chữ đọc được trên ảnh */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
      />

      <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
        {status && (
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-[9px] font-bold uppercase tracking-[0.06em] ${
              status === 'history' ? 'bg-success text-on-success' : 'bg-primary text-on-primary'
            }`}
          >
            <Bookmark size={9} className="fill-current" aria-hidden="true" />
            {status === 'history' ? 'Đã xem' : 'Sẽ xem'}
          </span>
        )}
        {rating && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-poster bg-black/60 border border-white/10 text-[10px] font-bold text-primary tabular-nums">
            <Star size={9} className="fill-primary" aria-hidden="true" />
            {rating}
          </span>
        )}
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-poster bg-black/60 border border-white/10 text-[9px] font-bold uppercase tracking-[0.06em] text-white">
          {isTV ? (
            <Tv size={9} aria-hidden="true" />
          ) : (
            <Film size={9} aria-hidden="true" />
          )}
          {isTV ? 'TV' : 'Phim'}
        </span>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(movie)}
          aria-label={`Bỏ qua gợi ý ${mainTitle}`}
          className="absolute top-2 right-2 z-20 min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 transition-colors cursor-pointer"
          title="Không quan tâm"
        >
          <X size={13} strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.05em] leading-[1.35] text-white line-clamp-2"
          title={mainTitle}
        >
          {mainTitle}
        </h3>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/55 truncate">
          {[subTitle, year].filter(Boolean).join(' · ') || '\u00A0'}
        </p>
        {(character || job) && (
          <p className="mt-1 pt-1 border-t border-white/15 text-[9px] font-semibold uppercase tracking-[0.08em] text-primary truncate">
            {character ?? job}
          </p>
        )}
      </div>
    </article>
  );
}

export default TMDBMovieCard;
