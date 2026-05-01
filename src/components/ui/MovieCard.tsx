import React from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import { getMainTitle, getSubTitle, formatMovieDate } from '../../utils/movieUtils';
import { Trash2, Clock, Calendar, Star, Edit2, MessageCircle, Film, Tv, CheckCircle, Info } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
  onClick: (movie: Movie) => void;
  onMarkAsWatched?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit, onClick, onMarkAsWatched }) => {
  const imageUrl = movie.poster_path
    ? (movie.source === 'tmdb' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path)
    : PLACEHOLDER_IMAGE;

  const mainTitle = getMainTitle(movie);
  const subTitle = getSubTitle(movie);

  return (
    <div
      onClick={() => onClick(movie)}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-border-default hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-premium hover:shadow-premium-hover"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={imageUrl}
          alt={mainTitle}
          className="w-full h-full object-cover transition-all duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Menu */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 [@media(hover:none)]:opacity-100 group-hover:opacity-100 transition-all duration-300 translate-x-2 [@media(hover:none)]:translate-x-0 group-hover:translate-x-0 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 bg-black/40 hover:bg-error/80 text-white rounded-xl backdrop-blur-xl transition-all duration-200 border border-white/10 cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
          
          {!onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
              className="p-2 bg-black/40 hover:bg-primary/80 text-white rounded-xl backdrop-blur-xl transition-all duration-200 border border-white/10 cursor-pointer"
              title="Sửa"
            >
              <Edit2 size={15} />
            </button>
          )}
          
          {onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsWatched(movie); }}
              className="p-2 bg-black/40 hover:bg-success/80 text-white rounded-xl backdrop-blur-xl transition-all duration-200 border border-white/10 cursor-pointer"
              title="Đã xem"
            >
              <CheckCircle size={15} />
            </button>
          )}
        </div>

        {/* Badges Stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {movie.rating && movie.rating > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-black/40 backdrop-blur-xl rounded-lg border border-white/10 shadow-glass">
              <Star size={10} className="text-warning" fill="currentColor" />
              <span className="text-[10px] font-bold text-white leading-none">{movie.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 px-2 py-1 bg-black/40 backdrop-blur-xl rounded-lg border border-white/10 shadow-glass">
            {movie.media_type === 'tv' ? (
              <>
                <Tv size={11} className="text-info" />
                <span className="text-[10px] font-bold text-white tracking-wider">
                  {movie.seasons && movie.seasons > 0 ? `TV • ${movie.seasons} Mùa` : 'TV'}
                </span>
              </>
            ) : (
              <>
                <Film size={11} className="text-success" />
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">Phim</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar for TV Series */}
        {movie.media_type === 'tv' && movie.progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden z-20">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: movie.progress.is_completed ? '100%' : `${(movie.progress.watched_episodes / (movie.total_episodes || 1)) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="min-h-10 mb-2">
          <h3 className="font-bold text-sm md:text-base leading-tight text-text-main line-clamp-1 group-hover:text-primary transition-colors" title={mainTitle}>
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
              <Calendar size={10} className="opacity-70" />
              <span>{formatMovieDate(movie.watched_at)}</span>
            </div>
          </div>
          
          {movie.review && (
            <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md text-primary shrink-0" title="Có đánh giá">
              <MessageCircle size={11} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;