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
    <div
      onClick={() => onClick(movie)}
      role="button"
      tabIndex={0}
      aria-label={`Xem chi tiết phim ${mainTitle}`}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border-default cursor-pointer shadow-premium hover:shadow-premium-hover hover:border-primary/40 hover:ring-1 hover:ring-primary/20 transition-colors duration-300"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={getTMDBImageUrl(movie.poster_path, 'w500')}
          alt={mainTitle}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {status && (
            <div className={`flex items-center gap-1 px-2.5 py-1 backdrop-blur-md rounded-lg border border-white/10 dark:border-white/5 text-xs font-bold text-white shadow-glass ring-1 ring-white/10 ${
              status === 'history' ? 'bg-success/70' : 'bg-primary/70'
            }`}>
              <Bookmark size={10} className="fill-white" strokeWidth={1.5} />
              <span>{status === 'history' ? 'ĐÃ XEM' : 'SẼ XEM'}</span>
            </div>
          )}
          
          {rating && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 dark:border-white/5 text-xs font-bold text-warning shadow-glass ring-1 ring-white/5">
              <Star size={10} fill="currentColor" strokeWidth={1.5} />
              <span>{rating}</span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 dark:border-white/5 text-xs font-bold text-white uppercase shadow-glass ring-1 ring-white/5">
            {isTV ? <Tv size={10} className="text-info" strokeWidth={1.5} /> : <Film size={10} className="text-success" strokeWidth={1.5} />}
            <span>{isTV ? 'TV' : 'Phim'}</span>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(movie);
            }}
            aria-label={`Bỏ qua gợi ý ${mainTitle}`}
            className="absolute top-2 right-2 z-20 min-w-9 min-h-9 flex items-center justify-center p-1.5 bg-black/60 hover:bg-red-500/90 backdrop-blur-md rounded-lg border border-white/10 text-white shadow-glass ring-1 ring-white/5 transition-colors cursor-pointer"
            title="Không quan tâm"
          >
            <X size={14} strokeWidth={1.5} />
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
    </div>
  );
};

export default TMDBMovieCard;
