import { useState, useEffect } from 'react';
import { getTVShowEpisodeInfo, getTVShowSeasonCount } from '@/features/search/services/tmdb';
import { Movie } from '@/types';
interface TVProgressProps {
  movieToEdit?: Movie;
  tmdbId?: number | string;
  mediaType?: 'movie' | 'tv';
  isTVSeries: boolean;
  isOpen: boolean;
}
export const useTVProgress = ({ movieToEdit, tmdbId, isTVSeries, isOpen }: TVProgressProps) => {
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [episodesPerSeason, setEpisodesPerSeason] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [seasonDates, setSeasonDates] = useState<Record<number, string>>({});
  const [resolvedSeasonCount, setResolvedSeasonCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [resolvedMovie, setResolvedMovie] = useState<Movie | undefined>();
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setEpisodesPerSeason({});
    setTotalEpisodes(movieToEdit?.total_episodes ?? 0);
    setResolvedSeasonCount(movieToEdit?.seasons ?? 0);
    const progress = movieToEdit?.progress;
    setCurrentSeason(progress?.current_season ?? 1);
    setCurrentEpisode(progress?.current_episode ?? 0);
    setIsCompleted(progress?.is_completed ?? !movieToEdit);
    setSeasonDates(
      Object.fromEntries(
        Object.entries(progress?.season_dates ?? {}).map(([season, date]) => [
          Number(season),
          date,
        ]),
      ),
    );
  }, [isOpen, movieToEdit, tmdbId, isTVSeries]);
  useEffect(() => {
    if (!isOpen || movieToEdit?.media_type !== 'tv' || movieToEdit.source !== 'tmdb') {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const fetchInfo = async () => {
      try {
        const fresh = await getTVShowSeasonCount(Number(movieToEdit.id));
        if (fresh === null) throw new Error('TV season count unavailable');
        const seasons = Math.max(fresh || 0, movieToEdit.seasons || 0);
        const info = await getTVShowEpisodeInfo(Number(movieToEdit.id), seasons);
        if (Object.keys(info.episodes_per_season).length < seasons)
          throw new Error('Incomplete TV episode data');
        if (!cancelled) {
          setTotalEpisodes(info.total_episodes || movieToEdit.total_episodes || 0);
          setEpisodesPerSeason(info.episodes_per_season);
          setResolvedSeasonCount(seasons);
        }
      } catch {
        if (!cancelled) setError('Không cập nhật được tiến độ TV. Bạn có thể thử lại.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setResolvedMovie(movieToEdit);
        }
      }
    };
    void fetchInfo();
    return () => {
      cancelled = true;
    };
  }, [isOpen, movieToEdit, retryNonce]);
  const refreshing =
    isOpen &&
    movieToEdit?.source === 'tmdb' &&
    movieToEdit.media_type === 'tv' &&
    (isLoading || resolvedMovie !== movieToEdit);
  const hasUsableSnapshot = isCompleted
    ? totalEpisodes > 0
    : totalEpisodes > 0 &&
      Array.from({ length: currentSeason }, (_, i) => i + 1).every(
        (season) => (episodesPerSeason[season] ?? 0) > 0,
      );
  const calculateWatchedEpisodes = (season: number, episode: number, completed: boolean) => {
    if (completed) return totalEpisodes;
    let watched = 0;
    for (let s = 1; s < season; s++) {
      watched += episodesPerSeason[s] || 0;
    }
    watched += episode;
    return watched;
  };

  const setSeasonDate = (season: number, isoDate: string) => {
    setSeasonDates((prev) => ({ ...prev, [season]: isoDate }));
  };

  return {
    currentSeason,
    setCurrentSeason,
    currentEpisode,
    setCurrentEpisode,
    totalEpisodes,
    setTotalEpisodes,
    episodesPerSeason,
    setEpisodesPerSeason,
    isCompleted,
    setIsCompleted,
    seasonDates,
    setSeasonDate,
    resolvedSeasonCount,
    isLoading: refreshing,
    error,
    retry: () => setRetryNonce((n) => n + 1),
    hasUsableSnapshot,
    calculateWatchedEpisodes,
  };
};
