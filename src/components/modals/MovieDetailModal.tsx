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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-border-default relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/10"
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
                    <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-1 tracking-tight">{mainTitle}</h2>
                    {subTitle && <p className="text-text-muted text-lg mb-2 italic">{subTitle}</p>}
                    {movie.tagline && <p className="text-text-muted italic opacity-80">"{movie.tagline}"</p>}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                    {movie.release_date && (
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-border-default">
                        <Calendar size={14} className="text-info" />
                        <span className="font-medium">{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}
                    {(movie.media_type === 'tv' ? (movie.seasons && movie.seasons > 0) : (movie.runtime && movie.runtime > 0)) && (
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-border-default">
                        <Clock size={14} className="text-primary" />
                        <span className="font-medium">{movie.media_type === 'tv' ? `${movie.seasons} Phần` : `${movie.runtime} Phút`}</span>
                      </div>
                    )}
                    {movie.rating && movie.rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                        <Star size={14} className="text-warning fill-warning" />
                        <span className="text-warning font-bold">{movie.rating.toFixed(1)}/5.0</span>
                      </div>
                    )}
                  </div>

                  {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-border-default">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Tiến độ xem</span>
                        {movie.progress.is_completed && <span className="text-success text-[10px] font-bold tracking-widest px-2 py-0.5 bg-success/10 rounded-md border border-success/20">✓ HOÀN THÀNH</span>}
                      </div>
                      <div className="text-text-main font-bold text-2xl mb-4">
                        {movie.progress.is_completed ? "Đã xem hết" : `S${movie.progress.current_season}E${movie.progress.current_episode}`}
                        {!movie.progress.is_completed && movie.total_episodes && (
                          <span className="text-text-muted font-normal text-sm ml-2">
                            ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
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
                        <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border-default">
                          <Film size={16} />
                        </div>
                        <span className="line-clamp-1 font-medium">{movie.genres}</span>
                      </div>
                    )}
                    {movie.country && (
                      <div className="flex items-center gap-2.5 text-text-muted text-sm">
                        <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border-default">
                          <Info size={16} />
                        </div>
                        <span className="line-clamp-1 font-medium">{movie.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-lg font-bold text-text-main tracking-tight">Nội dung</h3>
                    <p className="text-text-muted leading-relaxed text-sm md:text-base opacity-90">{overview}</p>
                  </div>

                  {credits && (
                    <div className="space-y-4">
                      {credits.cast && credits.cast.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-lg font-bold text-text-main flex items-center gap-2 tracking-tight">
                            <Users size={18} className="text-primary" /> Diễn viên
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {credits.cast.slice(0, 8).map(actor => (
                              <button key={actor.id} onClick={() => handlePersonClick(actor.id)} className="bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary px-3 py-2 rounded-xl text-xs font-medium text-text-muted transition-all border border-border-default cursor-pointer">
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
                      <button onClick={handleWatchTrailer} disabled={videos.length === 0} className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-premium hover:shadow-premium-hover ${videos.length > 0 ? 'bg-error text-white' : 'bg-black/5 dark:bg-white/5 text-text-muted cursor-not-allowed opacity-50'}`}>
                        <Play size={18} fill="currentColor" /> {videos.length > 0 ? 'XEM TRAILER' : 'KHÔNG CÓ TRAILER'}
                      </button>
                    ) : (
                      <button onClick={handleAddToAlbum} disabled={!canAddToAlbum} className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-premium hover:shadow-premium-hover ${canAddToAlbum ? 'bg-primary text-white' : 'bg-black/5 dark:bg-white/5 text-text-muted cursor-not-allowed opacity-50'}`}>
                        <FolderPlus size={18} /> THÊM VÀO ALBUM
                      </button>
                    )}
                  </div>

                  {movie.status !== 'watchlist' && (
                    <div className="pt-6 border-t border-border-default flex justify-between text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold opacity-60">
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
