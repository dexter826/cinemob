import { TMDBMovieResult } from '@/types';
import { getMainTitleForTMDB, getSubTitleForTMDB, getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import { Film, Tv, Bookmark, Star, Calendar, X } from 'lucide-react';

interface TMDBMovieCardProps {
  movie: TMDBMovieResult;
  onClick: (movie: TMDBMovieResult) => void;
  status?: 'history' | 'watchlist' | null;
  character?: string;
  job?: string;
  onRemove?: (movie: TMDBMovieResult) => void;
}

/** Thẻ hiển thị phim từ TMDB trong kết quả tìm kiếm và khám phá. */
function TMDBMovieCard({ movie, onClick, status, character, job, onRemove }: TMDBMovieCardProps) {
  const mainTitle = getMainTitleForTMDB(movie);
  const subTitle = getSubTitleForTMDB(movie);
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  const isTV = movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <article
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-colors duration-300"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <button
          type="button"
          onClick={() => onClick(movie)}
          aria-label={`Xem chi tiết phim ${mainTitle}`}
          className="absolute inset-0 w-full h-full cursor-pointer rounded-none"
        >
          <img
            src={getTMDBImageUrl(movie.poster_path, 'w500')}
            alt={mainTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {status && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold text-white ${
              status === 'history' ? 'bg-success' : 'bg-primary'
            }`}>
              <Bookmark size={10} className="fill-white" strokeWidth={1.5} aria-hidden="true" />
              <span>{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
            </div>
          )}

          {rating && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/60 rounded-lg border border-white/10 text-xs font-bold text-warning">
              <Star size={10} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
              <span>{rating}</span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 bg-black/60 rounded-lg border border-white/10 text-xs font-bold text-white">
            {isTV ? <Tv size={10} className="text-info" strokeWidth={1.5} aria-hidden="true" /> : <Film size={10} className="text-success" strokeWidth={1.5} aria-hidden="true" />}
            <span>{isTV ? 'TV' : 'Phim'}</span>
          </div>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(movie)}
            aria-label={`Bỏ qua gợi ý ${mainTitle}`}
            className="absolute top-2 right-2 z-20 min-w-9 min-h-9 flex items-center justify-center p-1.5 bg-black/60 hover:bg-danger text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="Không quan tâm"
          >
            <X size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-1">
        <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-1 text-text-main group-hover:text-primary transition-colors duration-200" title={mainTitle}>
          {mainTitle}
        </h3>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-muted truncate flex-1 italic" title={subTitle}>
            {subTitle || '\u00A0'}
          </p>
          {year && (
            <div className="flex items-center gap-1 text-xs text-text-muted font-medium shrink-0">
              <Calendar size={10} className="opacity-70" strokeWidth={1.5} />
              <span>{year}</span>
            </div>
          )}
        </div>

        {(character || job) && (
          <p className="text-xs text-primary/80 font-medium truncate pt-1 border-t border-border-default dark:border-white/5">
            {character ? `Nhân vật: ${character}` : `Công việc: ${job}`}
          </p>
        )}
      </div>
    </article>
  );
};

export default TMDBMovieCard;
