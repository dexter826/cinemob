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
    <motion.div
      onClick={() => onClick(movie)}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5">
        <img
          src={imageUrl}
          alt={mainTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 [@media(hover:none)]:opacity-100 group-hover:opacity-100 transition-all duration-300 translate-x-2 [@media(hover:none)]:translate-x-0 group-hover:translate-x-0 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 bg-black/60 dark:bg-black/70 text-white/90 hover:text-red-400 hover:bg-black/80 rounded-xl backdrop-blur-md transition-all duration-200 shadow-sm border border-white/10 cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
          
          {!onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
              className="p-2 bg-black/60 dark:bg-black/70 text-white/90 hover:text-primary hover:bg-black/80 rounded-xl backdrop-blur-md transition-all duration-200 shadow-sm border border-white/10 cursor-pointer"
              title="Sửa"
            >
              <Edit2 size={16} />
            </button>
          )}
          
          {onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsWatched(movie); }}
              className="p-2 bg-black/60 dark:bg-black/70 text-white/90 hover:text-green-400 hover:bg-black/80 rounded-xl backdrop-blur-md transition-all duration-200 shadow-sm border border-white/10 cursor-pointer"
              title="Đã xem"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>

        {movie.rating && movie.rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        <div className={`absolute left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10 transition-all duration-300 ${movie.rating && movie.rating > 0 ? 'top-9' : 'top-2'}`}>
          {movie.media_type === 'tv' ? (
            <>
              <Tv size={11} className="text-blue-400" />
              <span className="text-[10px] font-bold text-white tracking-wider">
                {movie.seasons && movie.seasons > 0 ? `TV • ${movie.seasons} Mùa` : 'TV'}
              </span>
            </>
          ) : (
            <>
              <Film size={11} className="text-green-400" />
              <span className="text-[10px] font-bold text-white tracking-wider">Phim</span>
            </>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="min-h-10 mb-2">
          <h3 className="font-bold text-sm md:text-base leading-tight text-text-main truncate group-hover:text-primary transition-colors" title={mainTitle}>
            {mainTitle}
          </h3>
          {subTitle && (
            <p className="text-xs text-text-muted truncate mt-0.5" title={subTitle}>
              {subTitle}
            </p>
          )}
        </div>

        <div className="mt-auto pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center flex-wrap gap-1.5">
            {movie.media_type === 'tv' && movie.progress && !movie.progress.is_completed && (
              <>
                <span>{`S${movie.progress.current_season}E${movie.progress.current_episode}`}</span>
                <span>•</span>
              </>
            )}
            <span>{formatMovieDate(movie.watched_at)}</span>
          </div>
          
          {movie.review && (
            <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md text-primary shrink-0" title="Có đánh giá">
              <MessageCircle size={12} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;