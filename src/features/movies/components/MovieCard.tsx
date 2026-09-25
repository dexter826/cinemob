import React from 'react';
import { Movie } from '@/types';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getMainTitle, getSubTitle, formatMovieDate, getTMDBImageUrl } from '../utils/movieUtils';
import { Trash2, Calendar, Star, Edit2, MessageCircle, MessageSquare, Film, Tv, CheckCircle } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
  onClick: (movie: Movie) => void;
  onMarkAsWatched?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit, onClick, onMarkAsWatched }) => {
  const imageUrl = movie.poster_path
    ? (movie.source === 'tmdb' ? getTMDBImageUrl(movie.poster_path, 'w500') : movie.poster_path)
    : PLACEHOLDER_IMAGE;

  const mainTitle = getMainTitle(movie);
  const subTitle = getSubTitle(movie);

  const showProgressBar = movie.status === 'history';

  const progressWidth = movie.media_type === 'tv'
    ? (movie.progress?.is_completed ? '100%' : `${((movie.progress?.watched_episodes || 0) / (movie.total_episodes || 1)) * 100}%`)
    : '100%';

  return (
    <div
      onClick={() => onClick(movie)}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-border-default hover:border-primary/40 transition-colors duration-300 cursor-pointer shadow-premium hover:shadow-premium-hover relative"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={imageUrl}
          alt={mainTitle}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Action Menu - Luôn hiển thị trên touch/mobile, hover trên desktop */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 min-w-9 min-h-9 flex items-center justify-center bg-black/60 hover:bg-error text-white rounded-xl transition-colors duration-200 border border-white/10 cursor-pointer active:scale-95"
            title="Xóa"
            aria-label="Xóa phim khỏi danh sách"
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
          
          {!onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
              className="p-2 min-w-9 min-h-9 flex items-center justify-center bg-black/60 hover:bg-primary text-white rounded-xl transition-colors duration-200 border border-white/10 cursor-pointer active:scale-95"
              title="Sửa"
              aria-label="Chỉnh sửa thông tin phim"
            >
              <Edit2 size={15} strokeWidth={1.5} />
            </button>
          )}
          
          {onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsWatched(movie); }}
              className="p-2 min-w-9 min-h-9 flex items-center justify-center bg-black/60 hover:bg-success text-white rounded-xl transition-colors duration-200 border border-white/10 cursor-pointer active:scale-95"
              title="Đã xem"
              aria-label="Đánh dấu đã xem phim"
            >
              <CheckCircle size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Badges Stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {movie.is_review && (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-primary text-white rounded-lg border border-white/10 shadow-sm">
              <MessageSquare size={10} className="text-white" fill="currentColor" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold text-white leading-none uppercase tracking-wider">Review</span>
            </div>
          )}

          {!!movie.rating && movie.rating > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-black/60 rounded-lg border border-white/10 shadow-sm">
              <Star size={10} className="text-warning" fill="currentColor" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold text-white leading-none tabular-nums">{movie.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 px-2.5 py-1 bg-black/60 rounded-lg border border-white/10 shadow-sm">
            {movie.media_type === 'tv' ? (
              <>
                <Tv size={11} className="text-info" strokeWidth={1.5} />
                <span className="text-[10px] font-semibold text-white tracking-wider">
                  {movie.seasons && movie.seasons > 0 ? `TV • ${movie.seasons} Mùa` : 'TV'}
                </span>
              </>
            ) : (
              <>
                <Film size={11} className="text-success" strokeWidth={1.5} />
                <span className="text-[10px] font-semibold text-white tracking-wider uppercase">Phim</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden z-20">
            <div 
              className="h-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: progressWidth }}
            />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="min-h-10 mb-2">
          <h3 className="font-bold text-sm md:text-[15px] leading-tight text-text-main line-clamp-1 group-hover:text-primary transition-colors duration-200" title={mainTitle}>
            {mainTitle}
          </h3>
          <p className="text-[11px] text-text-muted truncate mt-0.5 italic" title={subTitle || ''}>
            {subTitle || '\u00A0'}
          </p>
        </div>

        <div className="mt-auto pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-muted">
          <div className="flex items-center flex-wrap gap-1.5 font-medium">
            {movie.media_type === 'tv' && movie.progress && !movie.progress.is_completed && (
              <>
                <span className="text-primary">{`S${movie.progress.current_season}E${movie.progress.current_episode}`}</span>
                <span className="opacity-30">•</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={10} className="opacity-70" strokeWidth={1.5} />
              <span>{formatMovieDate(movie.watched_at)}</span>
            </div>
          </div>
          
          {movie.review && (
            <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md text-primary shrink-0" title="Có đánh giá">
              <MessageCircle size={11} strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
