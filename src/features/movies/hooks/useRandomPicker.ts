import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Howl } from 'howler';
import randomAudioFile from '@/assets/audio/random.MP3';
import { getTrendingMovies } from '@/features/search/services/tmdb';
import type { Movie, TMDBMovieResult } from '@/types';
import useAddMovieStore from '../stores/addMovieStore';
import useMovieDetailStore from '../stores/movieDetailStore';
import useMovieStore from '../stores/movieStore';

export type PoolMovie = Movie | TMDBMovieResult;
export type PoolType = 'watchlist' | 'trending' | null;

interface UseRandomPickerOptions {
  isOpen: boolean;
  onClose: () => void;
}

export function useRandomPicker({ isOpen, onClose }: UseRandomPickerOptions) {
  const { openAddModal } = useAddMovieStore();
  const { openDetailModal } = useMovieDetailStore();
  const { movies } = useMovieStore();
  const [trending, setTrending] = useState<TMDBMovieResult[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolType, setPoolType] = useState<PoolType>(null);
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
    if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    if (audioStopTimeoutRef.current) clearTimeout(audioStopTimeoutRef.current);
    shuffleTimeoutRef.current = null;
    audioStopTimeoutRef.current = null;
  }, []);

  const ensureConfetti = useCallback(() => {
    if (confettiFetchedRef.current) return;
    confettiFetchedRef.current = true;
    fetch('/data/confetti.json')
      .then(response => response.json())
      .then(data => setConfettiData(data))
      .catch(error => console.warn('Confetti animation failed to load:', error));
  }, []);

  useEffect(() => {
    const audio = new Howl({ src: [randomAudioFile], volume: 0.3, preload: true });
    setRandomAudio(audio);
    return () => {
      clearShuffleTimers();
      audio.stop();
      audio.unload();
    };
  }, [clearShuffleTimers]);

  useEffect(() => {
    if (isOpen) ensureConfetti();
  }, [ensureConfetti, isOpen]);

  const watchlistMovies = useMemo(
    () => movies.filter(movie => (movie.status || 'history') === 'watchlist'),
    [movies],
  );
  const activePool = useMemo(() => {
    if (poolType === 'watchlist') return watchlistMovies;
    if (poolType === 'trending') return trending;
    return [];
  }, [poolType, trending, watchlistMovies]);

  useEffect(() => {
    const controller = new AbortController();
    if (!isOpen) {
      clearShuffleTimers();
      setPoolType(null);
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);
      randomAudio?.stop();
      return () => controller.abort();
    }

    if (watchlistMovies.length > 0) {
      setPoolType('watchlist');
      setIsLoadingPool(false);
      return () => controller.abort();
    }

    setPoolType('trending');
    if (trending.length === 0) {
      setIsLoadingPool(true);
      getTrendingMovies(1, controller.signal)
        .then(({ results }) => {
          if (!controller.signal.aborted) setTrending(results);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!controller.signal.aborted) setIsLoadingPool(false);
        });
    } else {
      setIsLoadingPool(false);
    }
    return () => controller.abort();
  }, [clearShuffleTimers, isOpen, randomAudio, trending.length, watchlistMovies.length]);

  const startShuffle = useCallback((source: Exclude<PoolType, null>) => {
    const pool = source === 'watchlist' ? watchlistMovies : trending;
    if (pool.length === 0) {
      setCurrentIndex(null);
      setIsShuffling(false);
      setHasResult(false);
      return;
    }

    clearShuffleTimers();
    ensureConfetti();
    setPoolType(source);
    setHasResult(false);
    randomAudio?.stop();
    randomAudio?.play();

    if (reducedMotion) {
      setCurrentIndex(Math.floor(Math.random() * pool.length));
      setIsShuffling(false);
      setHasResult(true);
      return;
    }

    setIsShuffling(true);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 3150, 1);
      const effectivePool = source === 'watchlist' ? watchlistMovies : trending;
      if (effectivePool.length === 0) {
        setIsShuffling(false);
        setHasResult(false);
        return;
      }
      if (elapsed >= 3150) {
        setCurrentIndex(Math.floor(Math.random() * effectivePool.length));
        setIsShuffling(false);
        setHasResult(true);
        audioStopTimeoutRef.current = setTimeout(() => randomAudio?.stop(), 1950);
        return;
      }
      setCurrentIndex(index => index === null ? 0 : (index + 1) % effectivePool.length);
      const nextDelay = progress < 0.5 ? 70 : progress < 0.75 ? 130 : progress < 0.9 ? 220 : 380;
      shuffleTimeoutRef.current = setTimeout(tick, nextDelay);
    };
    shuffleTimeoutRef.current = setTimeout(tick, 70);
  }, [clearShuffleTimers, ensureConfetti, randomAudio, reducedMotion, trending, watchlistMovies]);

  useEffect(() => {
    if (isOpen && poolType && activePool.length > 0) startShuffle(poolType);
  }, [activePool.length, isOpen, poolType, startShuffle]);

  const handleWatchNow = () => {
    if (currentIndex === null || activePool.length === 0) return;
    const currentItem = activePool[currentIndex];
    if (poolType === 'watchlist') openDetailModal(currentItem as Movie);
    if (poolType === 'trending') {
      const movie = currentItem as TMDBMovieResult;
      openAddModal({ movie, mediaType: movie.media_type === 'tv' || movie.media_type === 'movie' ? movie.media_type : 'movie' });
    }
    onClose();
  };

  return {
    activePool, poolType, currentIndex, isLoadingPool, isShuffling, hasResult,
    confettiData, reducedMotion, startShuffle,
    handleRespin: () => poolType && startShuffle(poolType),
    handleWatchNow,
  };
}
