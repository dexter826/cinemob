import { translateCountries } from '@/constants/countries';
import { Movie, TMDBMovieDetail } from '@/types';
import { getEffectiveSeasons } from '@/features/search/services/tmdb';
import { resolveSeasonRuntime } from './movie-utils';

interface TMDBMovieDraftInput {
  uid: string;
  id: number | string;
  mediaType: 'movie' | 'tv';
  details: TMDBMovieDetail;
  fallbackTitle?: string;
  fallbackPoster?: string;
  fallbackReleaseDate?: string;
  status: 'history' | 'watchlist';
  rating: number;
  watchedAt: Date;
  season?: number;
  seasonEpisodeCount?: number;
  seasonPosterPath?: string | null;
}

export const buildTMDBMovieDraft = ({
  uid,
  id,
  mediaType,
  details,
  fallbackTitle,
  fallbackPoster,
  fallbackReleaseDate,
  status,
  rating,
  watchedAt,
  season,
  seasonEpisodeCount,
  seasonPosterPath,
}: TMDBMovieDraftInput): Omit<Movie, 'docId'> => {
  const isTV = mediaType === 'tv';
  if (isTV && typeof season !== 'number') {
    throw new Error('TV draft requires an explicit season');
  }
  const perEpisodeRuntime = details.runtime || details.episode_run_time?.[0] || 0;
  const runtime = resolveSeasonRuntime(perEpisodeRuntime, seasonEpisodeCount);
  const effectiveSeasonCount = getEffectiveSeasons(details.seasons).length;
  const draft: Omit<Movie, 'docId'> = {
    uid,
    id: Number(id),
    title: details.title || details.name || fallbackTitle || '',
    title_vi: '',
    poster_path: seasonPosterPath || details.poster_path || fallbackPoster || '',
    runtime,
    seasons: effectiveSeasonCount || details.number_of_seasons || 0,
    ...(isTV ? { season } : {}),
    ...(isTV && seasonEpisodeCount ? { total_episodes: seasonEpisodeCount } : {}),
    watched_at: watchedAt,
    status,
    rating,
    review: '',
    tagline: details.tagline || '',
    genres: details.genres?.map((g) => g.name).join(', ') || '',
    release_date: details.release_date || details.first_air_date || fallbackReleaseDate || '',
    country: translateCountries(details.production_countries?.map((c) => c.name).join(', ') || ''),
    content: details.overview || '',
    source: 'tmdb',
    media_type: mediaType,
  };
  return draft;
};
