import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Star, Film, Info, FolderPlus, Play, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, TMDBVideo, TMDBCredits } from '../../types';
import { getMovieVideos, getMovieCredits } from '../../services/tmdb';
import { PLACEHOLDER_IMAGE } from '../../constants';
import { getMainTitle, getSubTitle, formatMovieDate, getTMDBImageUrl } from '../../utils/movieUtils';
import Loading from '../ui/Loading';
import AlbumSelectorModal from './AlbumSelectorModal';
import useToastStore from '../../stores/toastStore';
import { useNavigate } from 'react-router-dom';
import { usePreventScroll } from '../../hooks/usePreventScroll';

// Modal animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    } as const
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.2
    } as const
  }
};

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ isOpen, onClose, movie }) => {
  const [loading, setLoading] = useState(false);
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  usePreventScroll(isOpen);

  useEffect(() => {
    const fetchData = async () => {
      if (movie && movie.source === 'tmdb' && movie.id) {
        setLoading(true);
        try {
          if (movie.status === 'watchlist') {
            const movieVideos = await getMovieVideos(Number(movie.id), movie.media_type || 'movie');
            setVideos(movieVideos);
          }
          const movieCredits = await getMovieCredits(Number(movie.id), movie.media_type || 'movie');
          setCredits(movieCredits);
        } catch (error) {
          setVideos([]);
          setCredits(null);
        } finally {
          setLoading(false);
        }
      } else {
        setVideos([]);
        setCredits(null);
        setLoading(false);
      }
    };

    if (isOpen && movie) {
      fetchData();
    }
  }, [isOpen, movie]);

  if (!movie) return null;

  const mainTitle = getMainTitle(movie);
  const subTitle = getSubTitle(movie);
  const overview = movie.content || movie.review || "Chưa có mô tả.";
  const posterUrl = movie.source === 'tmdb' ? getTMDBImageUrl(movie.poster_path, 'w780') : (movie.poster_path || PLACEHOLDER_IMAGE);
  const canAddToAlbum = (movie.status || 'history') === 'history' && movie.docId;

  const handleAddToAlbum = () => {
    if (!canAddToAlbum) {
      showToast('Chỉ có thể thêm phim đã xem vào album', 'error');
      return;
    }
    setShowAlbumSelector(true);
  };

  const handleWatchTrailer = () => {
    if (videos.length > 0) {
      window.open(`https://www.youtube.com/watch?v=${videos[0].key}`, '_blank');
    }
  };

  const handlePersonClick = (personId: number) => {
    navigate(`/person/${personId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0">
              <img src={posterUrl} alt={mainTitle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:to-surface" />
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {loading ? (
                <Loading fullScreen={false} size={48} />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-1">{mainTitle}</h2>
                    {subTitle && <p className="text-text-muted text-lg mb-2">{subTitle}</p>}
                    {movie.tagline && <p className="text-text-muted italic">"{movie.tagline}"</p>}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                    {movie.release_date && (
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                        <Calendar size={14} className="text-primary" />
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}
                    {(movie.media_type === 'tv' ? (movie.seasons && movie.seasons > 0) : (movie.runtime && movie.runtime > 0)) && (
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                        <Clock size={14} className="text-blue-400" />
                        <span>{movie.media_type === 'tv' ? `${movie.seasons} Phần` : `${movie.runtime} Phút`}</span>
                      </div>
                    )}
                    {movie.rating && movie.rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        <Star size={14} className="text-primary fill-primary" />
                        <span className="text-primary font-bold">{movie.rating}/5</span>
                      </div>
                    )}
                  </div>

                  {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-muted text-sm font-medium">Tiến độ xem</span>
                        {movie.progress.is_completed && <span className="text-green-500 text-xs font-bold">✓ HOÀN THÀNH</span>}
                      </div>
                      <div className="text-text-main font-bold text-xl mb-3">
                        {movie.progress.is_completed ? "Đã xem hết" : `S${movie.progress.current_season}E${movie.progress.current_episode}`}
                        {!movie.progress.is_completed && movie.total_episodes && (
                          <span className="text-text-muted font-normal text-sm ml-2">
                            ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: movie.progress.is_completed ? '100%' : `${(movie.progress.watched_episodes / (movie.total_episodes || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {movie.genres && (
                      <div className="flex items-center gap-2.5 text-text-muted text-sm">
                        <Film size={16} className="shrink-0" />
                        <span className="line-clamp-1">{movie.genres}</span>
                      </div>
                    )}
                    {movie.country && (
                      <div className="flex items-center gap-2.5 text-text-muted text-sm">
                        <Info size={16} className="shrink-0" />
                        <span className="line-clamp-1">{movie.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-text-main">Nội dung</h3>
                    <p className="text-text-muted leading-relaxed text-sm md:text-base">{overview}</p>
                  </div>

                  {credits && (
                    <div className="space-y-4">
                      {credits.cast && credits.cast.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                            <Users size={18} /> Diễn viên
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {credits.cast.slice(0, 8).map(actor => (
                              <button key={actor.id} onClick={() => handlePersonClick(actor.id)} className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main transition-colors border border-white/5 cursor-pointer">
                                {actor.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col gap-3">
                    {movie.status === 'watchlist' ? (
                      <button onClick={handleWatchTrailer} disabled={videos.length === 0} className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${videos.length > 0 ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' : 'bg-white/5 text-text-muted cursor-not-allowed'}`}>
                        <Play size={20} fill="currentColor" /> {videos.length > 0 ? 'XEM TRAILER' : 'KHÔNG CÓ TRAILER'}
                      </button>
                    ) : (
                      <button onClick={handleAddToAlbum} disabled={!canAddToAlbum} className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${canAddToAlbum ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' : 'bg-white/5 text-text-muted cursor-not-allowed'}`}>
                        <FolderPlus size={20} /> THÊM VÀO ALBUM
                      </button>
                    )}
                  </div>

                  {movie.status !== 'watchlist' && (
                    <div className="pt-4 border-t border-white/5 flex justify-between text-[10px] uppercase tracking-widest text-text-muted font-bold">
                      <span>ĐÃ XEM: {formatMovieDate(movie.watched_at)}</span>
                      <span>NGUỒN: {movie.source}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <AlbumSelectorModal isOpen={showAlbumSelector} onClose={() => setShowAlbumSelector(false)} movie={movie} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieDetailModal;
