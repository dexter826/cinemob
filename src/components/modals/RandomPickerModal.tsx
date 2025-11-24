import React, { useEffect, useMemo, useState } from 'react';
import { X, Dice5 } from 'lucide-react';
import Lottie from 'lottie-react';
import { useAuth } from '../providers/AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import { getTrendingMovies } from '../../services/tmdbService';
import { Movie, TMDBMovieResult } from '../../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import useAddMovieStore from '../../stores/addMovieStore';
import { Timestamp } from 'firebase/firestore';
import Loading from '../ui/Loading';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RandomPickerModal: React.FC<RandomPickerModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { openAddModal } = useAddMovieStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<TMDBMovieResult[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolType, setPoolType] = useState<'watchlist' | 'trending' | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [confettiData, setConfettiData] = useState<any | null>(null);

  // Subscribe to user's movies only when modal is open
  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setMovies(data);
    });

    return () => {
      unsubscribe();
    };
  }, [user, isOpen]);

  // Load confetti animation once
  useEffect(() => {
    fetch('/confetti.json')
      .then(res => res.json())
      .then(data => setConfettiData(data))
      .catch(() => {
        // Silent fail if file not found
      });
  }, []);

  const watchlistMovies = useMemo(
    () => movies.filter(m => (m.status || 'history') === 'watchlist'),
    [movies]
  );

  const activePool = useMemo(() => {
    if (poolType === 'watchlist') return watchlistMovies;
    if (poolType === 'trending') return trending;
    return [];
  }, [poolType, watchlistMovies, trending]);

  // Reset and prepare pool when modal opens
  useEffect(() => {
    if (!isOpen) {
      setPoolType(null);
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);
      return;
    }

    const preparePool = async () => {
      if (watchlistMovies.length > 0) {
        setPoolType('watchlist');
        setIsLoadingPool(false);
      } else {
        setPoolType('trending');
        if (trending.length === 0) {
          setIsLoadingPool(true);
          try {
            const { results } = await getTrendingMovies();
            setTrending(results);
          } finally {
            setIsLoadingPool(false);
          }
        }
      }
    };

    preparePool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, watchlistMovies.length]);

  // Start shuffle once pool is ready
  useEffect(() => {
    if (!isOpen) return;
    if (!poolType) return;
    if (activePool.length === 0) return;

    startShuffle(poolType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, poolType, activePool.length]);

  const startShuffle = (source: 'watchlist' | 'trending') => {
    const pool = source === 'watchlist' ? watchlistMovies : trending;
    if (!pool || pool.length === 0) {
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);
      return;
    }

    setPoolType(source);
    setIsShuffling(true);
    setHasResult(false);

    const duration = 2200;
    const intervalMs = 90;
    const start = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - start;

      const effectivePool = source === 'watchlist' ? watchlistMovies : trending;
      if (!effectivePool || effectivePool.length === 0) {
        clearInterval(interval);
        setIsShuffling(false);
        setHasResult(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * effectivePool.length);
      setCurrentIndex(randomIndex);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsShuffling(false);
        setHasResult(true);
      }
    }, intervalMs);
  };

  const handleRespin = () => {
    if (!activePool || activePool.length === 0) return;
    startShuffle(poolType === 'watchlist' ? 'watchlist' : 'trending');
  };

  const handleWatchNow = () => {
    if (currentIndex === null || !activePool || activePool.length === 0) return;

    if (poolType === 'watchlist') {
      const movie = activePool[currentIndex] as Movie;
      const now = new Date();
      const existingDate = movie.watched_at instanceof Timestamp
        ? movie.watched_at.toDate()
        : (movie.watched_at as Date | undefined);

      openAddModal({
        movieToEdit: {
          ...movie,
          status: 'history',
          watched_at: existingDate || now,
        },
      });
    } else if (poolType === 'trending') {
      const tmdbMovie = activePool[currentIndex] as TMDBMovieResult;
      openAddModal({
        movie: tmdbMovie,
        mediaType:
          tmdbMovie.media_type === 'tv' || tmdbMovie.media_type === 'movie'
            ? tmdbMovie.media_type
            : 'movie',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const hasPool = activePool && activePool.length > 0;
  const currentItem = hasPool && currentIndex !== null ? activePool[currentIndex] : null;

  const getTitle = () => {
    if (!currentItem) return '';
    if (poolType === 'watchlist') {
      return (currentItem as Movie).title;
    }
    const m = currentItem as TMDBMovieResult;
    return m.title || m.name || '';
  };

  const getPoster = () => {
    if (!currentItem) return PLACEHOLDER_IMAGE;
    if (poolType === 'watchlist') {
      const m = currentItem as Movie;
      if (!m.poster_path) return PLACEHOLDER_IMAGE;
      return m.source === 'tmdb'
        ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}`
        : m.poster_path;
    }
    const m = currentItem as TMDBMovieResult;
    if (!m.poster_path) return PLACEHOLDER_IMAGE;
    return `${TMDB_IMAGE_BASE_URL}${m.poster_path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-black/10 dark:border-white/10 flex flex-col gap-4">
        {/* Confetti Layer */}
        {hasResult && confettiData && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90">
            <Lottie animationData={confettiData} loop={false} />
          </div>
        )}

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Dice5 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Không biết xem gì?</h2>
              <p className="text-xs text-text-muted">Để Cinemetrics chọn ngẫu nhiên cho bạn</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted cursor-pointer z-10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10">
          {isLoadingPool && (
            <div className="py-10">
              <Loading fullScreen={false} text="Đang chuẩn bị danh sách đề xuất..." />
            </div>
          )}

          {!isLoadingPool && !hasPool && (
            <div className="py-10 text-center text-text-muted text-sm">
              <p className="mb-2">
                Hiện chưa có phim trong Watchlist và không lấy được danh sách thịnh hành.
              </p>
              <p>Hãy thử thêm vài phim vào Watchlist hoặc kiểm tra TMDB API Key.</p>
            </div>
          )}

          {!isLoadingPool && hasPool && (
            <div className="flex flex-col items-center gap-4">
              <div className={`relative w-40 h-60 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg ${isShuffling ? 'animate-pulse-soft' : ''}`}>
                {currentItem ? (
                  <img
                    src={getPoster()}
                    alt={getTitle()}
                    className={`w-full h-full object-cover transition-transform duration-300 ${isShuffling ? 'scale-105' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/5 dark:bg-white/5 text-text-muted text-xs px-4 text-center">
                    Đang trộn danh sách phim...
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                  {poolType === 'watchlist' ? 'Từ Watchlist của bạn' : 'Phim thịnh hành'}
                </p>
                <h3 className="text-lg font-bold text-text-main line-clamp-2" title={getTitle()}>
                  {getTitle() || 'Đang quay...'}
                </h3>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 relative z-10">
          <button
            onClick={handleRespin}
            disabled={!hasPool || isLoadingPool}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-text-main text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Dice5 size={18} />
            <span>Quay lại</span>
          </button>

          <button
            onClick={handleWatchNow}
            disabled={!hasPool || isLoadingPool || currentIndex === null}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Xem ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomPickerModal;
