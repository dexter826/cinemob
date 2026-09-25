import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { X, Dice5 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Howl } from 'howler';
import { getTrendingMovies } from '@/features/search/services/tmdb';
import { Movie, TMDBMovieResult } from '@/types';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '../utils/movieUtils';
import useAddMovieStore from '../stores/addMovieStore';
import useMovieDetailStore from '../stores/movieDetailStore';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import randomAudioFile from '@/assets/audio/random.MP3';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import useMovieStore from '../stores/movieStore';
import { MODAL_VARIANTS, OVERLAY_VARIANTS } from '@/constants';
import { PickerWheel } from './random-picker/PickerWheel';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PoolMovie = Movie | TMDBMovieResult;

const getPoolPoster = (movie: PoolMovie | undefined, poolType: 'watchlist' | 'trending' | null): string => {
  if (!movie) return PLACEHOLDER_IMAGE;
  if (poolType === 'watchlist') {
    const m = movie as Movie;
    return m.source === 'tmdb' ? getTMDBImageUrl(m.poster_path) : (m.poster_path || PLACEHOLDER_IMAGE);
  }
  return getTMDBImageUrl((movie as TMDBMovieResult).poster_path);
};

const getWheelMovie = (
  pool: PoolMovie[], currentIndex: number | null, offset: number
): PoolMovie | undefined => {
  if (pool.length === 0 || currentIndex === null) return undefined;
  return pool[(currentIndex + offset + pool.length) % pool.length];
};

function RandomPickerModal({ isOpen, onClose }: RandomPickerModalProps) {
  const { openAddModal } = useAddMovieStore();
  const { openDetailModal } = useMovieDetailStore();

  const { movies } = useMovieStore();
  const [trending, setTrending] = useState<TMDBMovieResult[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolType, setPoolType] = useState<'watchlist' | 'trending' | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [confettiData, setConfettiData] = useState<Record<string, unknown> | null>(null);
  const [randomAudio, setRandomAudio] = useState<Howl | null>(null);
  const shuffleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePreventScroll(isOpen);

  const clearShuffleTimers = useCallback(() => {
    if (shuffleTimeoutRef.current) {
      clearTimeout(shuffleTimeoutRef.current);
      shuffleTimeoutRef.current = null;
    }
    if (audioStopTimeoutRef.current) {
      clearTimeout(audioStopTimeoutRef.current);
      audioStopTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetch('/data/confetti.json')
      .then(res => res.json())
      .then(data => setConfettiData(data))
      .catch((e) => console.warn('Confetti animation failed to load:', e));

    const audio = new Howl({
      src: [randomAudioFile],
      volume: 0.3,
      preload: true,
    });
    setRandomAudio(audio);

    return () => {
      clearShuffleTimers();
      if (audio) {
        audio.stop();
      }
    };
  }, [clearShuffleTimers]);

  const watchlistMovies = useMemo(
    () => movies.filter(m => (m.status || 'history') === 'watchlist'),
    [movies]
  );

  const activePool = useMemo(() => {
    if (poolType === 'watchlist') return watchlistMovies;
    if (poolType === 'trending') return trending;
    return [];
  }, [poolType, watchlistMovies, trending]);

  useEffect(() => {
    if (!isOpen) {
      clearShuffleTimers();
      setPoolType(null);
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);

      if (randomAudio) {
        randomAudio.stop();
      }
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
  }, [isOpen, watchlistMovies.length, trending.length, clearShuffleTimers, randomAudio]);

  const startShuffle = useCallback((source: 'watchlist' | 'trending') => {
    const pool = source === 'watchlist' ? watchlistMovies : trending;
    if (!pool || pool.length === 0) {
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);
      return;
    }

    clearShuffleTimers();
    setPoolType(source);
    setIsShuffling(true);
    setHasResult(false);

    if (randomAudio) {
      randomAudio.stop();
      randomAudio.play();
    }

    const shuffleDuration = 3150;
    const start = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(elapsed / shuffleDuration, 1);

      const effectivePool = source === 'watchlist' ? watchlistMovies : trending;
      if (!effectivePool || effectivePool.length === 0) {
        setIsShuffling(false);
        setHasResult(false);
        return;
      }

      if (elapsed >= shuffleDuration) {
        const finalIndex = Math.floor(Math.random() * effectivePool.length);
        setCurrentIndex(finalIndex);
        setIsShuffling(false);
        setHasResult(true);

        audioStopTimeoutRef.current = setTimeout(() => {
          if (randomAudio) {
            randomAudio.stop();
          }
        }, 1950);
        return;
      }

      setCurrentIndex(prevIndex => {
        if (prevIndex === null) return 0;
        return (prevIndex + 1) % effectivePool.length;
      });

      let nextDelay = 70;
      if (progress < 0.5) {
        nextDelay = 70;
      } else if (progress < 0.75) {
        nextDelay = 130;
      } else if (progress < 0.9) {
        nextDelay = 220;
      } else {
        nextDelay = 380;
      }

      shuffleTimeoutRef.current = setTimeout(tick, nextDelay);
    };

    shuffleTimeoutRef.current = setTimeout(tick, 70);
  }, [watchlistMovies, trending, randomAudio, clearShuffleTimers]);

  useEffect(() => {
    if (!isOpen) return;
    if (!poolType) return;
    if (activePool.length === 0) return;

    startShuffle(poolType);
  }, [isOpen, poolType, activePool.length, startShuffle]);

  const handleRespin = () => {
    if (!activePool || activePool.length === 0) return;
    startShuffle(poolType === 'watchlist' ? 'watchlist' : 'trending');
  };

  const handleWatchNow = () => {
    if (currentIndex === null || !activePool || activePool.length === 0) return;

    if (poolType === 'watchlist') {
      const movie = activePool[currentIndex] as Movie;
      openDetailModal(movie);
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

  return (
    <AnimatePresence>
      {isOpen && (() => {
        return (
        <motion.div
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div 
            className="absolute inset-0 bg-black/75" 
            onClick={onClose} 
          />

          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-surface rounded-3xl max-w-lg w-full p-6 shadow-premium border border-border-default flex flex-col gap-4"
          >
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
              <p className="text-xs text-text-muted">Để CineMOB chọn ngẫu nhiên cho bạn</p>
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
              <Loading fullScreen={false} text="Đang chuẩn bị danh sách đề xuất…" />
            </div>
          )}

          {!isLoadingPool && !hasPool && (
            <EmptyState
              icon={Dice5}
              title="Không tìm thấy phim"
              description='Hiện chưa có phim trong Watchlist và không lấy được danh sách thịnh hành để quay ngẫu nhiên.'
              className="py-10"
            />
          )}

          {!isLoadingPool && hasPool && (
            <PickerWheel
              leftSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, -1), poolType)}
              centerSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 0), poolType)}
              rightSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 1), poolType)}
              poolLabel={poolType === 'watchlist' ? 'Từ Watchlist của bạn' : 'Phim thịnh hành'}
              title={getTitle()}
              isShuffling={isShuffling}
              showTitle={!isShuffling && currentIndex !== null}
              hasResult={hasResult}
            />
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 relative z-10">
          <button
            onClick={handleRespin}
            disabled={!hasPool || isLoadingPool || isShuffling}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-default bg-black/5 dark:bg-white/5 text-text-main text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Dice5 size={18} />
            <span>Quay lại</span>
          </button>

          <button
            onClick={handleWatchNow}
            disabled={!hasPool || isLoadingPool || currentIndex === null || isShuffling}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Xem ngay
          </button>
        </div>
          </motion.div>
        </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};

export default RandomPickerModal;
