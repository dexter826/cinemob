import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Dice5 } from 'lucide-react';
import Lottie from 'lottie-react';
import { useReducedMotion } from 'framer-motion';
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
import useMovieStore from '../stores/movieStore';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
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
  const confettiFetchedRef = useRef(false);
  const reducedMotion = useReducedMotion() ?? false;

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

  // Celebration assets load only when needed (picker open), cached per mount.
  // A fetch failure still shows the selected movie and actions.
  const ensureConfetti = useCallback(() => {
    if (confettiFetchedRef.current) return;
    confettiFetchedRef.current = true;
    fetch('/data/confetti.json')
      .then(res => res.json())
      .then(data => setConfettiData(data))
      .catch((e) => console.warn('Confetti animation failed to load:', e));
  }, []);

  useEffect(() => {
    const audio = new Howl({
      src: [randomAudioFile],
      volume: 0.3,
      preload: true,
    });
    setRandomAudio(audio);

    return () => {
      clearShuffleTimers();
      audio.stop();
    };
  }, [clearShuffleTimers]);

  useEffect(() => {
    if (isOpen) ensureConfetti();
  }, [isOpen, ensureConfetti]);

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
    ensureConfetti();
    setPoolType(source);
    setHasResult(false);

    if (randomAudio) {
      randomAudio.stop();
      randomAudio.play();
    }

    // Reduced motion: skip wheel cycling, land directly on the result.
    if (reducedMotion) {
      setCurrentIndex(Math.floor(Math.random() * pool.length));
      setIsShuffling(false);
      setHasResult(true);
      return;
    }

    setIsShuffling(true);

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
  }, [watchlistMovies, trending, randomAudio, clearShuffleTimers, ensureConfetti, reducedMotion]);

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

  const showConfetti = hasResult && !reducedMotion && confettiData !== null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="random-picker-title"
      descriptionId="random-picker-description"
      presentation="dialog"
    >
      <div className="relative flex flex-col gap-4 p-6">
        {showConfetti && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90">
            <Lottie animationData={confettiData} loop={false} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div aria-hidden="true" className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Dice5 size={18} />
            </div>
            <div className="min-w-0">
              <h2 id="random-picker-title" className="text-lg font-semibold text-text-primary">Không biết xem gì?</h2>
              <p id="random-picker-description" className="text-xs text-text-secondary">Để CineMOB chọn ngẫu nhiên cho bạn</p>
            </div>
          </div>

          <IconButton label="Đóng chọn phim ngẫu nhiên" onClick={onClose} variant="ghost">
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </IconButton>
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
              description="Hiện chưa có phim trong watchlist và không lấy được danh sách thịnh hành để quay ngẫu nhiên."
              compact
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

        <div className="flex flex-col sm:flex-row gap-2 relative z-10">
          <Button
            variant="secondary"
            onClick={handleRespin}
            disabled={!hasPool || isLoadingPool || isShuffling}
            leadingIcon={<Dice5 size={18} aria-hidden="true" />}
            className="flex-1"
          >
            Quay lại
          </Button>

          <Button
            variant="primary"
            onClick={handleWatchNow}
            disabled={!hasPool || isLoadingPool || currentIndex === null || isShuffling}
            className="flex-1"
          >
            Xem ngay
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default RandomPickerModal;
