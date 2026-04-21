import React from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import { getDisplayTitle, formatMovieDate } from '../../utils/movieUtils';
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

  return (
    <motion.div
      onClick={() => onClick(movie)}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Poster Section */}
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5">
        <img
          src={imageUrl}
          alt={getDisplayTitle(movie)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Progress Bar (TV Show Only) */}
        {movie.status !== 'watchlist' && movie.media_type === 'tv' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 z-20 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: movie.progress
                  ? movie.progress.is_completed
                    ? '100%'
                    : movie.total_episodes && movie.total_episodes > 0
                      ? `${Math.min(100, Math.max(0, (movie.progress.watched_episodes / movie.total_episodes) * 100))}%`
                      : '100%'
                  : '100%'
              }}
              className="h-full bg-primary"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}

        {/* Action Buttons (Top Right) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 bg-red-500/90 text-white rounded-xl backdrop-blur-md hover:bg-red-600 transition-colors shadow-lg"
            title="Xóa phim"
          >
            <Trash2 size={16} />
          </button>
          
          {!onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
              className="p-2 bg-blue-500/90 text-white rounded-xl backdrop-blur-md hover:bg-blue-600 transition-colors shadow-lg"
              title="Chỉnh sửa"
            >
              <Edit2 size={16} />
            </button>
          )}
          
          {onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsWatched(movie); }}
              className="p-2 bg-green-500/90 text-white rounded-xl backdrop-blur-md hover:bg-green-600 transition-colors shadow-lg"
              title="Đánh dấu đã xem"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>

        {/* Rating Badge (Top Left) */}
        {movie.rating && movie.rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Media Type Badge */}
        <div className={`absolute left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10 transition-all duration-300 ${movie.rating && movie.rating > 0 ? 'top-9' : 'top-2'}`}>
          {movie.media_type === 'tv' ? (
            <Tv size={11} className="text-blue-400" />
          ) : (
            <Film size={11} className="text-green-400" />
          )}
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {movie.media_type === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-bold text-sm md:text-base leading-tight text-text-main line-clamp-2 min-h-10 mb-2 group-hover:text-primary transition-colors">
          {getDisplayTitle(movie)}
        </h3>

        <div className="mt-auto space-y-2">
          {/* Progress / Episodes Info */}
          {movie.media_type === 'tv' && movie.progress && (
            <div className="flex items-center text-[11px] text-text-muted font-medium bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">
              <Tv size={12} className="mr-1.5 text-primary" />
              <span className="truncate">
                {movie.progress.is_completed 
                  ? 'Hoàn thành' 
                  : `S${movie.progress.current_season} E${movie.progress.current_episode} • ${movie.progress.watched_episodes}/${movie.total_episodes || '?'} tập`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-[11px] text-text-muted">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1 text-secondary" />
                <span>{formatMovieDate(movie.watched_at)}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center">
                  <Clock size={12} className="mr-1 text-primary" />
                  <span>{movie.runtime}m</span>
                </div>
              )}
            </div>
            
            {movie.review && (
              <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md text-primary" title="Có đánh giá">
                <MessageCircle size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;