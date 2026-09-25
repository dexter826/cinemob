import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Star, Film, FolderPlus, Play, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, TMDBVideo, TMDBCredits } from '@/types';
import { getMovieVideos, getMovieCredits } from '@/services/tmdb';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getMainTitle, getSubTitle, formatMovieDate, getTMDBImageUrl, getTranslatedGenres } from '../utils/movieUtils';
import Loading from '@/shared/components/ui/Loading';
import AlbumSelectorModal from '@/features/albums/components/AlbumSelectorModal';
import useToastStore from '@/shared/stores/toastStore';
import { useNavigate } from 'react-router-dom';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import { MESSAGES, MODAL_VARIANTS, OVERLAY_VARIANTS } from '@/constants';


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
          showToast(MESSAGES.COMMON.LOAD_ERROR, "error");
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
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
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
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-border-default relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors border border-white/10 cursor-pointer active:scale-95 shadow-md"
              aria-label="Đóng chi tiết phim"
            >
              <X size={18} className="sm:w-5 sm:h-5" strokeWidth={1.5} />
            </button>

            <div className="w-full md:w-2/5 h-48 md:h-auto relative shrink-0">
              <img src={posterUrl} alt={mainTitle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:to-surface" />
            </div>

            <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-2xl w-3/4 animate-pulse" />
                    <div className="h-6 bg-black/5 dark:bg-white/5 rounded-xl w-1/2 animate-pulse" />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-black/5 dark:bg-white/5 rounded-full animate-pulse" />
                    <div className="h-8 w-24 bg-black/5 dark:bg-white/5 rounded-full animate-pulse" />
                    <div className="h-8 w-16 bg-black/5 dark:bg-white/5 rounded-full animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-2/3 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    <div className="h-6 bg-black/5 dark:bg-white/5 rounded-lg w-32 animate-pulse" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-24 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main mb-1 tracking-tight font-display">{mainTitle}</h2>
                    {subTitle && movie.title_vi !== mainTitle && <p className="text-text-muted text-base sm:text-lg mb-2 italic">{subTitle}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-text-muted">
                    {movie.release_date && (
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-border-default dark:border-white/5">
                        <Calendar size={14} className="text-info" strokeWidth={1.5} />
                        <span className="font-medium tabular-nums">{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}
                    {(movie.media_type === 'tv' ? (movie.seasons && movie.seasons > 0) : (movie.runtime && movie.runtime > 0)) && (
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-border-default dark:border-white/5">
                        <Clock size={14} className="text-primary" strokeWidth={1.5} />
                        <span className="font-medium tabular-nums">{movie.media_type === 'tv' ? `${movie.seasons} Mùa` : `${movie.runtime} Phút`}</span>
                      </div>
                    )}
                    {!!movie.rating && movie.rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-warning/10 px-3 py-1 rounded-full border border-warning/20 dark:border-warning/10">
                        <Star size={14} className="text-warning fill-warning" strokeWidth={1.5} />
                        <span className="font-bold text-warning tabular-nums">{movie.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-5 border border-border-default dark:border-white/5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-text-muted text-xs font-semibold">Tiến độ xem</span>
                        {movie.progress.is_completed && <span className="text-success text-xs font-semibold tracking-wide px-2 py-0.5 bg-success/10 rounded-md border border-success/20 dark:border-success/10">✓ Hoàn thành</span>}
                      </div>
                      <div className="text-text-main font-bold text-xl sm:text-2xl mb-4 font-display">
                        {movie.progress.is_completed ? "Đã xem hết" : `S${movie.progress.current_season}E${movie.progress.current_episode}`}
                        {!movie.progress.is_completed && movie.total_episodes && (
                          <span className="text-text-muted font-normal text-sm ml-2 tabular-nums">
                            ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-primary transition-[width] duration-700 ease-out rounded-full"
                          style={{
                            width: movie.progress.is_completed ? '100%' : `${(movie.progress.watched_episodes / (movie.total_episodes || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {movie.genres && (
                    <div className="flex items-center gap-2 sm:gap-2.5 text-text-muted text-xs sm:text-sm">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border-default dark:border-white/5">
                        <Film size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </div>
                      <span className="line-clamp-2 font-medium">{getTranslatedGenres(movie.genres)}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-text-main tracking-tight">Nội dung</h3>
                    <p className="text-text-muted leading-relaxed text-xs sm:text-sm md:text-base opacity-90">{overview}</p>
                  </div>

                  {movie.review && (
                    <div className="bg-warning/5 dark:bg-warning/5 rounded-2xl p-4 sm:p-5 border border-warning/20 dark:border-warning/10">
                      <h3 className="text-base sm:text-lg font-bold text-text-main mb-2.5 flex items-center gap-2 tracking-tight">
                        <Star size={16} className="text-warning fill-warning" strokeWidth={1.5} /> 
                        Đánh giá của bạn
                      </h3>
                      <p className="text-text-muted leading-relaxed text-xs sm:text-sm md:text-base">{movie.review}</p>
                    </div>
                  )}

                  {credits && (
                    <div className="space-y-4">
                      {credits.crew && credits.crew.some(c => c.job === 'Director') && (
                        <div className="space-y-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2 tracking-tight">
                            <User size={16} className="sm:w-[18px] sm:h-[18px] text-info" strokeWidth={1.5} /> Đạo diễn
                          </h3>
                          <p className="text-text-muted text-xs sm:text-sm md:text-base">
                            {credits.crew.filter(c => c.job === 'Director').map(d => d.name).join(', ')}
                          </p>
                        </div>
                      )}
                      {credits.cast && credits.cast.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2 tracking-tight">
                            <Users size={16} className="sm:w-[18px] sm:h-[18px] text-primary" strokeWidth={1.5} /> Diễn viên
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {credits.cast.slice(0, 8).map(actor => (
                              <button
                                key={actor.id}
                                onClick={() => handlePersonClick(actor.id)}
                                className="bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 px-3 py-1.5 rounded-xl text-xs font-medium text-text-muted transition-colors border border-border-default dark:border-white/5 cursor-pointer active:scale-95"
                              >
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
                      <button
                        onClick={handleWatchTrailer}
                        disabled={videos.length === 0}
                        aria-label={videos.length > 0 ? "Xem trailer phim trên YouTube" : "Phim không có video trailer"}
                        className={`w-full min-h-[50px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-colors shadow-sm active:scale-[0.98] cursor-pointer ${
                          videos.length > 0
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-text-muted cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Play size={18} fill="currentColor" strokeWidth={1.5} />
                        <span>{videos.length > 0 ? 'Xem Trailer' : 'Không có trailer'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToAlbum}
                        disabled={!canAddToAlbum}
                        aria-label="Thêm phim vào album cá nhân"
                        className={`w-full min-h-[50px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-colors shadow-sm active:scale-[0.98] cursor-pointer ${
                          canAddToAlbum
                            ? 'bg-primary hover:bg-primary/90 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-text-muted cursor-not-allowed opacity-50'
                        }`}
                      >
                        <FolderPlus size={18} strokeWidth={1.5} />
                        <span>Thêm vào Album</span>
                      </button>
                    )}
                  </div>

                  {movie.status !== 'watchlist' && (
                    <div className="pt-2 text-xs uppercase tracking-wider text-text-muted font-medium flex items-center gap-1.5 opacity-80">
                      <Calendar size={13} className="text-text-muted" strokeWidth={1.5} />
                      <span>Đã xem: {formatMovieDate(movie.watched_at)}</span>
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
