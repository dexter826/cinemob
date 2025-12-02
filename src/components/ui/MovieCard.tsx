import React from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import { getDisplayTitle } from '../../utils/movieUtils';
import { Trash2, Clock, Calendar, Star, Edit2, MessageCircle, Film, Tv, CheckCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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

  // Helper to format timestamp
  const formatDate = (date: Timestamp | Date) => {
    if (!date) return '';
    const d = date instanceof Timestamp ? date.toDate() : date;
    return new Intl.DateTimeFormat('vi-VN', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(d);
  };

  return (
    <motion.div
      onClick={() => onClick(movie)}
      className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-primary/50 transition-colors duration-300 cursor-pointer"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 40px -10px rgba(16, 185, 129, 0.2)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Image Container */}
      <div className="aspect-2/3 w-full relative overflow-hidden">
        <img
          src={imageUrl}
          alt={getDisplayTitle(movie)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-100" />

        {/* Progress Bar with Tooltip - Only show for history (watched movies) */}
        {movie.status !== 'watchlist' && (
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-transparent z-20 group/progress">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className={`h-full transition-all duration-300 ${movie.media_type === 'tv' ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{
                  width: movie.media_type === 'tv' && movie.progress
                    ? movie.progress.is_completed
                      ? '100%'
                      : movie.total_episodes && movie.total_episodes > 0
                        ? `${Math.min(100, Math.max(0, (movie.progress.watched_episodes / movie.total_episodes) * 100))}%`
                        : '100%'
                    : '100%'
                }}
              />
            </div>
            {/* Progress Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none z-30">
              <div className="bg-black text-white text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {movie.media_type === 'tv' && movie.progress ? (
                  movie.progress.is_completed ? (
                    'Đã xem hết'
                  ) : movie.total_episodes && movie.total_episodes > 0 ? (
                    `S${movie.progress.current_season}E${movie.progress.current_episode} - ${movie.progress.watched_episodes}/${movie.total_episodes} tập (${Math.round((movie.progress.watched_episodes / movie.total_episodes) * 100)}%)`
                  ) : (
                    `S${movie.progress.current_season}E${movie.progress.current_episode}`
                  )
                ) : (
                  'Đã xem'
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons (Always visible on mobile, visible on hover on desktop) */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
          {!onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-full backdrop-blur-sm hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
              title="Chỉnh sửa phim"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onMarkAsWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsWatched(movie); }}
              className="p-2 bg-green-500/20 text-green-400 rounded-full backdrop-blur-sm hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
              title="Đánh dấu đã xem"
            >
              <CheckCircle size={16} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 bg-red-500/20 text-red-400 rounded-full backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            title="Xóa phim"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Rating Badge (Top Left) */}
        {movie.rating && movie.rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-white">{movie.rating}</span>
          </div>
        )}

        {/* Media Type Badge (Top Left, below rating or standalone) */}
        <div className={`absolute left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10 ${movie.rating && movie.rating > 0 ? 'top-12' : 'top-2'}`}>
          {movie.media_type === 'tv' ? (
            <>
              <Tv size={12} className="text-blue-400" />
              <span className="text-xs font-bold text-white">TV</span>
            </>
          ) : (
            <>
              <Film size={12} className="text-green-400" />
              <span className="text-xs font-bold text-white">Phim</span>
            </>
          )}
        </div>

        {/* Review Indicator (Bottom Right of Image) */}
        {movie.review && (
          <div className="absolute bottom-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-gray-300 z-10" title="Có đánh giá">
            <MessageCircle size={12} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 absolute bottom-0 w-full">
        <h3 className="font-semibold text-lg leading-tight text-white mb-2 line-clamp-1" title={getDisplayTitle(movie)}>
          {getDisplayTitle(movie)}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center space-x-1">
            {movie.media_type === 'tv' ? (
              <>
                <Tv size={12} className="text-primary" />
                <span>{movie.seasons || 0} phần</span>
              </>
            ) : (
              <>
                <Clock size={12} className="text-primary" />
                <span>{movie.runtime || 0}m</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={12} className="text-secondary" />
            <span>{formatDate(movie.watched_at)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;