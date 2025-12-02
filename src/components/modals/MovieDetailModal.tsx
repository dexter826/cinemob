import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Star, Film, Info, FolderPlus, Play, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, TMDBVideo, TMDBCredits } from '../../types';
import { getMovieVideos, getMovieCredits } from '../../services/tmdbService';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import { getDisplayTitle } from '../../utils/movieUtils';
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
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.2
    }
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

  // Prevent body scroll when modal is open
  usePreventScroll(isOpen);

  useEffect(() => {
    const fetchData = async () => {
      if (movie && movie.source === 'tmdb' && movie.id) {
        setLoading(true);
        try {
          // Fetch videos for watchlist movies
          if (movie.status === 'watchlist') {
            const movieVideos = await getMovieVideos(Number(movie.id), movie.media_type || 'movie');
            setVideos(movieVideos);
          }

          // Fetch credits for all TMDB movies
          const movieCredits = await getMovieCredits(Number(movie.id), movie.media_type || 'movie');
          setCredits(movieCredits);
        } catch (error) {
          console.error("Failed to fetch data", error);
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

  // Early return for type safety - these vars are only used when modal is open
  const title = movie ? getDisplayTitle(movie) : '';
  const overview = movie?.content || movie?.review || "Chưa có mô tả.";
  const backdropUrl = movie?.poster_path && movie?.source === 'tmdb' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE;

  const posterUrl = movie?.poster_path && movie?.source === 'tmdb' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE;

  const genres = movie?.genres;
  const rating = null;
  const releaseDate = movie?.release_date;
  const country = movie?.country;

  const canAddToAlbum = (movie?.status || 'history') === 'history' && movie?.docId;

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
      {isOpen && movie && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Poster Section */}
        <div className="w-full md:w-1/3 h-64 md:h-auto relative shrink-0">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:to-surface" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {loading ? (
            <Loading fullScreen={false} size={48} />
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-2">{title}</h2>
                {movie.tagline && (
                  <p className="text-text-muted italic text-lg">"{movie.tagline}"</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                {releaseDate && (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <Calendar size={16} className="text-primary" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                {(movie.media_type === 'tv' ? (movie.seasons && movie.seasons > 0) : (movie.runtime && movie.runtime > 0)) ? (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <Clock size={16} className="text-blue-400" />
                    <span>{movie.media_type === 'tv' ? `${movie.seasons} phần` : `${movie.runtime} phút`}</span>
                  </div>
                ) : null}
                {rating ? (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span>{rating}/10 (TMDB)</span>
                  </div>
                ) : null}
                {(movie.rating && movie.rating > 0) ? (
                  <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <Star size={16} className="text-primary fill-primary" />
                    <span className="text-primary font-medium">{movie.rating}/5 (Của bạn)</span>
                  </div>
                ) : null}
              </div>

              {/* Progress Info for TV Series */}
              {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Tiến độ xem</span>
                    {movie.progress.is_completed && (
                      <span className="text-green-500 text-xs font-medium">✓ Hoàn thành</span>
                    )}
                  </div>
                  <div className="text-text-main font-semibold text-lg mb-3">
                    {movie.progress.is_completed ? (
                      <span>Đã xem hết</span>
                    ) : (
                      <>
                        S{movie.progress.current_season}E{movie.progress.current_episode}
                        {movie.total_episodes && movie.total_episodes > 0 && (
                          <span className="text-text-muted font-normal text-sm ml-2">
                            ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: movie.progress.is_completed
                          ? '100%'
                          : movie.total_episodes && movie.total_episodes > 0
                            ? `${Math.min(100, Math.max(0, (movie.progress.watched_episodes / movie.total_episodes) * 100))}%`
                            : '0%'
                      }}
                    />
                  </div>
                </div>
              )}

              {genres && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Film size={16} />
                  <span>{genres}</span>
                </div>
              )}

              {country && (
                <div className="flex items-center gap-2 text-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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

              {credits && (
                <>
                  {credits.cast && credits.cast.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                        <Users size={20} />
                        Diễn viên chính
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {credits.cast.slice(0, 10).map((actor) => (
                          <button
                            key={actor.id}
                            onClick={() => handlePersonClick(actor.id)}
                            className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main transition-colors cursor-pointer border border-white/10 hover:border-white/20"
                          >
                            {actor.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {credits.crew && credits.crew.filter(person => person.job === 'Director').length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                        <User size={20} />
                        Đạo diễn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {credits.crew.filter(person => person.job === 'Director').slice(0, 5).map((director) => (
                          <button
                            key={director.id}
                            onClick={() => handlePersonClick(director.id)}
                            className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main transition-colors cursor-pointer border border-white/10 hover:border-white/20"
                          >
                            {director.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {movie.review && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-text-main mb-2">Đánh giá của bạn</h3>
                  <p className="text-text-muted italic">"{movie.review}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                {movie.status === 'watchlist' ? (
                  <button
                    onClick={handleWatchTrailer}
                    disabled={videos.length === 0}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${videos.length > 0
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Play size={20} />
                    <span>{videos.length > 0 ? 'Xem trailer' : 'Không có trailer'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToAlbum}
                    disabled={!canAddToAlbum}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${canAddToAlbum
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <FolderPlus size={20} />
                    <span>{canAddToAlbum ? 'Thêm vào album' : 'Không thể thêm vào album'}</span>
                  </button>
                )}
                {movie.status !== 'watchlist' && !canAddToAlbum && (
                  <p className="text-xs text-text-muted text-center mt-2">
                    Chỉ có thể thêm phim đã xem vào album
                  </p>
                )}
              </div>

              {movie.status !== 'watchlist' && (
                <div className="pt-4 border-t border-white/10 text-xs text-text-muted flex justify-between">
                  <span>Đã xem: {movie.watched_at instanceof Object && 'toDate' in movie.watched_at ? movie.watched_at.toDate().toLocaleDateString('vi-VN') : new Date(movie.watched_at as any).toLocaleDateString('vi-VN')}</span>
                  <span>Nguồn: {movie.source === 'tmdb' ? 'TMDB' : 'Thủ công'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Album Selector Modal */}
        <AlbumSelectorModal
          isOpen={showAlbumSelector}
          onClose={() => setShowAlbumSelector(false)}
          movie={movie}
        />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieDetailModal;
