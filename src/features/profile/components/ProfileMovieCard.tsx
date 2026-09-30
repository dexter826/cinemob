import { Calendar, Eye, Film, Star, Tv } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { formatMovieDate, getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import type { ProfileMovie } from '@/types';

interface ProfileMovieCardProps {
  movie: ProfileMovie;
}

/** Thẻ phim dùng chung cho grid hồ sơ và grid phim chung. */
function ProfileMovieCard({ movie }: ProfileMovieCardProps) {
  const poster = movie.poster_path ? getTMDBImageUrl(movie.poster_path, 'w500') : PLACEHOLDER_IMAGE;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const watchedAt = movie.watched_at ? formatMovieDate(movie.watched_at) : '';
  const isTvSeries = movie.media_type === 'tv';

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-2/3 bg-black/5 dark:bg-white/5 overflow-hidden">
        <img src={poster} alt={movie.title} loading="lazy" className="w-full h-full object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          {isTvSeries ? (
            <Tv size={11} className="text-info" aria-hidden="true" />
          ) : (
            <Film size={11} className="text-success" aria-hidden="true" />
          )}
          {isTvSeries ? 'Series' : 'Phim'}
        </span>
        {movie.is_review && (
          <span className="absolute left-1/2 bottom-2 -translate-x-1/2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Eye size={11} aria-hidden="true" />
            <span className="hidden sm:inline">Xem qua </span>Review
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary line-clamp-1">{movie.title}</p>
          {movie.title_vi && movie.title_vi !== movie.title && (
            <p className="text-xs text-text-muted italic line-clamp-1 mt-0.5">{movie.title_vi}</p>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-border-default/50 flex items-center justify-between text-xs text-text-muted">
          {watchedAt ? (
            <span className="flex items-center gap-1">
              <Calendar size={11} className="opacity-70" aria-hidden="true" />
              {watchedAt}
            </span>
          ) : year ? (
            <span>{year}</span>
          ) : (
            <span />
          )}
          {!!movie.rating && movie.rating > 0 && (
            <span className="flex items-center gap-1 font-semibold text-text-main tabular-nums">
              <Star size={13} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              {movie.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileMovieCard;
