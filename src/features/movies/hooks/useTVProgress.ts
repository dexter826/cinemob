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

// Quản lý tiến độ xem phim bộ.
export const useTVProgress = ({ movieToEdit, tmdbId, isTVSeries, isOpen }: TVProgressProps) => {
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [episodesPerSeason, setEpisodesPerSeason] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [seasonDates, setSeasonDates] = useState<Record<number, string>>({});
  // Số mùa đã đồng bộ với TMDB (chỉ tăng so với snapshot); 0 = không áp dụng.
  const [resolvedSeasonCount, setResolvedSeasonCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;

    if (movieToEdit && movieToEdit.media_type === 'tv') {
      const m = movieToEdit;
      if (m.source === 'tmdb' && m.id) {
        const fetchInfo = async () => {
          setIsLoading(true);
          try {
            let seasonCount = m.seasons || 0;
            try {
              const fresh = await getTVShowSeasonCount(Number(m.id));
              if (fresh && fresh > seasonCount) seasonCount = fresh;
            } catch {}
            const info =
              seasonCount > 0
                ? await getTVShowEpisodeInfo(Number(m.id), seasonCount)
                : { total_episodes: 0, episodes_per_season: {} };
            if (!ignore) {
              setTotalEpisodes(info.total_episodes || m.total_episodes || 0);
              setEpisodesPerSeason(info.episodes_per_season);
              setResolvedSeasonCount(seasonCount);
            }
          } catch (error) {
            if (!ignore) {
              setTotalEpisodes(m.total_episodes || 0);
              setResolvedSeasonCount(m.seasons || 0);
            }
          } finally {
            if (!ignore) setIsLoading(false);
          }
        };
        fetchInfo();
      } else {
        setTotalEpisodes(m.total_episodes || 0);
        setResolvedSeasonCount(m.seasons || 0);
      }

      if (m.progress) {
        setCurrentSeason(m.progress.current_season || 1);
        setCurrentEpisode(m.progress.current_episode || 0);
        setIsCompleted(m.progress.is_completed || false);
        setSeasonDates(
          Object.fromEntries(
            Object.entries(m.progress.season_dates || {}).map(([season, iso]) => [
              Number(season),
              iso,
            ]),
          ),
        );
      } else {
        setCurrentSeason(1);
        setCurrentEpisode(0);
        setIsCompleted(false);
        setSeasonDates({});
      }
    } else if (!movieToEdit && !tmdbId) {
      setTotalEpisodes(0);
      setEpisodesPerSeason({});
      setCurrentSeason(1);
      setCurrentEpisode(0);
      setIsCompleted(true);
      setSeasonDates({});
      setResolvedSeasonCount(0);
    } else if (!movieToEdit && isTVSeries && tmdbId) {
      setIsLoading(false);
      setSeasonDates({});
      setResolvedSeasonCount(0);
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, movieToEdit, isTVSeries, tmdbId]);

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
    isLoading,
    calculateWatchedEpisodes,
  };
};
