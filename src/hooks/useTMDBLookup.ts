import { useState, useCallback } from 'react';
import { getMovieDetails, getMovieDetailsWithLanguage, getTVShowEpisodeInfo } from '../services/tmdb';
import { checkMovieExists } from '../services/movieService';
import { translateCountries } from '../constants/countries';
import { MESSAGES } from '../constants/messages';
import useToastStore from '../stores/toastStore';
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

  const fetchDetails = useCallback(async (
    id: number | string, 
    type: 'movie' | 'tv', 
    user: User | null
  ): Promise<TMDBLookupResult | null> => {
    setIsLoading(true);
    try {
      if (user && id) {
        setMovieExists(await checkMovieExists(user.uid, id));
      }

      const details = await getMovieDetails(Number(id), type);
      if (!details) return null;

      const originalTitle = details.title || details.name || '';
      let viTitle = '', viOverview = '';
      
      try {
        const vi = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN');
        const hasVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
        if (vi && hasVietnamese.test(vi.title || vi.name || '')) {
          viTitle = vi.title || vi.name || '';
          viOverview = vi.overview || '';
        }
      } catch (e) {
      }

      const runtime = details.runtime || (details.episode_run_time?.[0]) || 0;
      const seasons = details.number_of_seasons || 0;
      
      let tvInfo;
      if (type === 'tv' && seasons > 0) {
        const info = await getTVShowEpisodeInfo(Number(id), seasons);
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
      showToast(MESSAGES.COMMON.LOAD_ERROR, "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return { fetchDetails, isLoading, movieExists, setMovieExists };
};
