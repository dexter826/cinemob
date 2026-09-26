import { useState, useCallback, useRef } from 'react';
import { getMovieDetails, getMovieDetailsWithLanguage, getTVShowEpisodeInfo } from '../services/tmdb';
import { checkMovieExists } from '@/features/movies/services/movieService';
import { translateCountries } from '@/constants/countries';
import { MESSAGES } from '@/constants/messages';
import useToastStore from '@/shared/stores/toastStore';
import { User } from 'firebase/auth';

interface TMDBLookupResult {
  title: string;
  title_vi: string;
  runtime: string;
  seasons: string;
  poster: string;
  tagline: string;
  genres: string;
  releaseDate: string;
  country: string;
  content: string;
  genreIds: number[];
  tvInfo?: {
    totalEpisodes: number;
    episodesPerSeason: Record<number, number>;
  };
}

// Xử lý tra cứu thông tin phim từ TMDB.
export const useTMDBLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [movieExists, setMovieExists] = useState(false);
  const { showToast } = useToastStore();
  const requestRef = useRef<{ id: number; controller: AbortController } | null>(null);

  const fetchDetails = useCallback(async (
    id: number | string, 
    type: 'movie' | 'tv', 
    user: User | null,
    signal?: AbortSignal,
  ): Promise<TMDBLookupResult | null> => {
    requestRef.current?.controller.abort();
    const requestId = (requestRef.current?.id ?? 0) + 1;
    const controller = new AbortController();
    requestRef.current = { id: requestId, controller };
    const abortFromCaller = () => controller.abort(signal?.reason);
    if (signal?.aborted) abortFromCaller();
    else signal?.addEventListener('abort', abortFromCaller, { once: true });
    const isCurrent = () => requestRef.current?.id === requestId && !controller.signal.aborted;

    setIsLoading(true);
    try {
      if (user && id) {
        const exists = await checkMovieExists(user.uid, id);
        if (!isCurrent()) return null;
        setMovieExists(exists);
      }

      const details = await getMovieDetails(Number(id), type, controller.signal);
      if (!details) return null;
      if (!isCurrent()) return null;

      const originalTitle = details.title || details.name || '';
      let viTitle = '', viOverview = '';
      
      try {
        const vi = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN', controller.signal);
        if (!isCurrent()) return null;
        const hasVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
        if (vi && hasVietnamese.test(vi.title || vi.name || '')) {
          viTitle = vi.title || vi.name || '';
          viOverview = vi.overview || '';
        }
      } catch (e) {
        console.warn('Vietnamese title lookup failed:', e);
      }

      const runtime = details.runtime || (details.episode_run_time?.[0]) || 0;
      const seasons = details.number_of_seasons || 0;
      
      let tvInfo;
      if (type === 'tv' && seasons > 0) {
        const info = await getTVShowEpisodeInfo(Number(id), seasons, controller.signal);
        if (!isCurrent()) return null;
        tvInfo = {
          totalEpisodes: info.total_episodes,
          episodesPerSeason: info.episodes_per_season
        };
      }

      return {
        title: originalTitle,
        title_vi: viTitle,
        runtime: runtime.toString(),
        seasons: seasons ? seasons.toString() : '',
        poster: details.poster_path || '',
        tagline: details.tagline || '',
        genres: details.genres?.map(g => g.name).join(', ') || '',
        releaseDate: details.release_date || details.first_air_date || '',
        country: translateCountries(details.production_countries?.map(c => c.name).join(', ') || ''),
        content: viOverview || details.overview || '',
        genreIds: details.genres?.map(g => g.id) || [],
        tvInfo
      };
    } catch (error) {
      if (isCurrent()) showToast(MESSAGES.COMMON.LOAD_ERROR, "error");
      return null;
    } finally {
      signal?.removeEventListener('abort', abortFromCaller);
      if (requestRef.current?.id === requestId) {
        setIsLoading(false);
      }
    }
  }, [showToast]);

  return { fetchDetails, isLoading, movieExists, setMovieExists };
};
