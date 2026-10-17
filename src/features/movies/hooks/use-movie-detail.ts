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

/**
 * Fetch dữ liệu enrichment TMDB cho trang chi tiết: credits luôn, videos chỉ cho
 * watchlist (để hiện trailer) — hành vi y như MovieDetailModal cũ.
 */
export function useMovieDetail(movie: Movie | null): MovieDetailExtras {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const { showToast } = useToastStore();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!movie || movie.source !== 'tmdb' || !movie.id) {
        setCredits(null);
        setVideos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (movie.status === 'watchlist') {
          const movieVideos = await getMovieVideos(Number(movie.id), movie.media_type || 'movie');
          if (!cancelled) setVideos(movieVideos);
        } else {
          setVideos([]);
        }
        const movieCredits = await getMovieCredits(Number(movie.id), movie.media_type || 'movie');
        if (!cancelled) setCredits(movieCredits);
      } catch {
        if (!cancelled) {
          setVideos([]);
          setCredits(null);
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
  }, [movie, showToast]);

  return { loading, credits, videos };
}
