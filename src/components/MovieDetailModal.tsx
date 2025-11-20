import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Star, Film, Info } from 'lucide-react';
import { Movie, TMDBMovieDetail } from '../types';
import { getMovieDetails } from '../services/tmdbService';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ isOpen, onClose, movie }) => {
  const [details, setDetails] = useState<TMDBMovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (movie && movie.source === 'tmdb' && movie.id) {
        setLoading(true);
        try {
          let data = await getMovieDetails(Number(movie.id), movie.media_type || 'movie');
          
          // Fallback for legacy data: if 'movie' failed and we didn't specify type, try 'tv'
          if (!data && !movie.media_type) {
             data = await getMovieDetails(Number(movie.id), 'tv');
          }
          
          setDetails(data);
        } catch (error) {
          console.error("Failed to fetch details", error);
        } finally {
          setLoading(false);
        }
      } else {
        setDetails(null);
      }
    };

    if (isOpen && movie) {
      fetchDetails();
    }
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const title = details?.title || details?.name || movie.title;
  const overview = details?.overview || movie.review || "Chưa có mô tả.";
  const backdropUrl = details?.backdrop_path 
    ? `${TMDB_IMAGE_BASE_URL}${details.backdrop_path}` 
    : (movie.poster_path && movie.source === 'tmdb' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE);
  
  const posterUrl = details?.poster_path 
    ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}`
    : (movie.poster_path && movie.source === 'tmdb' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : (movie.poster_path || PLACEHOLDER_IMAGE));

  const genres = details?.genres?.map(g => g.name).join(', ');
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : null;
  const releaseDate = details?.release_date || details?.first_air_date;
  const country = details?.production_countries?.map(c => c.name).join(', ') || movie.country;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col md:flex-row max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Poster Section */}
        <div className="w-full md:w-1/3 h-64 md:h-auto relative flex-shrink-0">
            <img 
              src={posterUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-surface" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-2">{title}</h2>
                {details?.tagline && (
                  <p className="text-text-muted italic text-lg">"{details.tagline}"</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                {releaseDate && (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <Calendar size={16} className="text-primary" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                  <Clock size={16} className="text-blue-400" />
                  <span>{movie.media_type === 'tv' ? `${details?.number_of_seasons || movie.seasons || 0} phần` : `${details?.runtime || movie.runtime} phút`}</span>
                </div>
                {rating && (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span>{rating}/10 (TMDB)</span>
                  </div>
                )}
                {movie.rating && (
                   <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                   <Star size={16} className="text-primary fill-primary" />
                   <span className="text-primary font-medium">{movie.rating}/5 (Của bạn)</span>
                 </div>
                )}
              </div>

              {genres && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Film size={16} />
                  <span>{genres}</span>
                </div>
              )}

              {country && (
                <div className="flex items-center gap-2 text-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>{country}</span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                  <Info size={20} />
                  Nội dung
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {overview}
                </p>
              </div>

              {movie.review && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-text-main mb-2">Đánh giá của bạn</h3>
                  <p className="text-text-muted italic">"{movie.review}"</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/10 text-xs text-text-muted flex justify-between">
                 <span>Đã xem: {movie.watched_at instanceof Object && 'toDate' in movie.watched_at ? movie.watched_at.toDate().toLocaleDateString('vi-VN') : new Date(movie.watched_at as any).toLocaleDateString('vi-VN')}</span>
                 <span>Nguồn: {movie.source === 'tmdb' ? 'TMDB' : 'Thủ công'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;
