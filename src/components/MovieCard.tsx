import React from 'react';
import { Movie } from '../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';
import { Trash2, Clock, Calendar, Star, Edit2, MessageCircle, Film, Tv } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit, onClick }) => {
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
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
    >
      {/* Image Container */}
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100" />

        {/* Action Buttons (Visible on Hover) */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-full backdrop-blur-sm hover:bg-blue-500 hover:text-white transition-colors"
            title="Chỉnh sửa phim"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); movie.docId && onDelete(movie.docId); }}
            className="p-2 bg-red-500/20 text-red-400 rounded-full backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
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
        <h3 className="font-semibold text-lg leading-tight text-white mb-2 line-clamp-1" title={movie.title}>
          {movie.title}
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
    </div>
  );
};

export default MovieCard;