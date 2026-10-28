import { useEffect, useState } from 'react';
import { Movie, TMDBVideo, TMDBCredits } from '@/types';
import { getMovieVideos, getMovieCredits } from '@/features/search/services/tmdb';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants';

export interface MovieDetailExtras {
  loading: boolean;
  credits: TMDBCredits | null;
  videos: TMDBVideo[];
}

/** Fetch enrichment TMDB: credits luôn, videos chỉ cho watchlist (để hiện trailer). */
export function useMovieDetail(movie: Movie | null): MovieDetailExtras {
  const [loading, setLoading] = useState(false);
  const [creditsState, setCreditsState] = useState<{
    key: string;
    data: TMDBCredits | null;
  } | null>(null);
  const [videosState, setVideosState] = useState<{ key: string; data: TMDBVideo[] } | null>(null);
  const { showToast } = useToastStore();
  const movieId = movie?.id ?? null;
  const movieSource = movie?.source ?? null;
  const mediaType = movie?.media_type || 'movie';
  const movieStatus = movie?.status ?? null;
  const movieKey = movieId ? `${movieId}:${mediaType}` : null;

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!movieId || movieSource !== 'tmdb') {
        setCreditsState(null);
        setVideosState(null);
        setLoading(false);
        return;
      }
      const key = `${movieId}:${mediaType}`;
      setLoading(true);
      try {
        const [movieVideos, movieCredits] = await Promise.all([
          movieStatus === 'watchlist'
            ? getMovieVideos(Number(movieId), mediaType)
            : Promise.resolve<TMDBVideo[]>([]),
          getMovieCredits(Number(movieId), mediaType),
        ]);
        if (!cancelled) {
          setVideosState({ key, data: movieVideos });
          setCreditsState({ key, data: movieCredits });
        }
      } catch {
        if (!cancelled) {
          setVideosState({ key, data: [] });
          setCreditsState(null);
          showToast(MESSAGES.COMMON.LOAD_ERROR, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [movieId, movieSource, mediaType, movieStatus, showToast]);

  return {
    loading,
    credits: creditsState && creditsState.key === movieKey ? creditsState.data : null,
    videos: videosState && videosState.key === movieKey ? videosState.data : [],
  };
}
