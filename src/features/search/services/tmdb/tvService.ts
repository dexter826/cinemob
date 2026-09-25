import { tmdbFetch, withLimit } from './tmdbClient';
import { TMDBEpisode } from '@/types';

interface TVSeasonResponse {
  episodes?: Array<{ id: number }>;
}

interface TVDetailsResponse {
  status?: string;
  origin_country?: string[];
  number_of_seasons?: number;
  next_episode_to_air?: TMDBEpisode & { season_number: number; episode_number: number };
}

interface TVSeasonEpisodesResponse {
  episodes?: Array<{
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    vote_average?: number;
    runtime?: number;
  }>;
}

// Lấy thông tin mùa phim.
export const getTVSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ episode_count: number } | null> => {
  const data = await tmdbFetch<TVSeasonResponse>(`tv/${tvId}/season/${seasonNumber}`);
  return data ? { episode_count: data.episodes?.length || 0 } : null;
};

// Lấy tổng số tập phim theo mùa.
export const getTVShowEpisodeInfo = async (tvId: number, numberOfSeasons: number): Promise<{
  total_episodes: number;
  episodes_per_season: { [season: number]: number };
}> => {
  try {
    const seasonPromises: (() => Promise<{ episode_count: number } | null>)[] = [];
    for (let i = 1; i <= numberOfSeasons; i++) {
      seasonPromises.push(() => getTVSeasonDetails(tvId, i));
    }

    const seasons = await withLimit(seasonPromises, 3);

    let totalEpisodes = 0;
    const episodesPerSeason: { [season: number]: number } = {};

    seasons.forEach((season, index) => {
      if (season) {
        const seasonNumber = index + 1;
        const episodeCount = season.episode_count;
        episodesPerSeason[seasonNumber] = episodeCount;
        totalEpisodes += episodeCount;
      }
    });

    return { total_episodes: totalEpisodes, episodes_per_season: episodesPerSeason };
  } catch (error) {
    console.error("Failed to get TV show episode info:", error);
    return { total_episodes: 0, episodes_per_season: {} };
  }
};

// Điều chỉnh ngày chiếu theo múi giờ Việt Nam.
export const adjustAirDate = (airDateStr: string): string => {
  if (!airDateStr) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(airDateStr)) return airDateStr;
  return airDateStr.slice(0, 10);
};

// Parse YYYY-MM-DD thành local midnight để so sánh ngày.
export const parseLocalDate = (dateStr: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
};

// Lấy danh sách tập phim sắp chiếu.
export const getTVShowUpcomingEpisodes = async (tvId: number): Promise<TMDBEpisode[]> => {
  const details = await tmdbFetch<TVDetailsResponse>(`tv/${tvId}`);
  if (!details || details.status === 'Ended' || details.status === 'Canceled') return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEpisodes: TMDBEpisode[] = [];

  const numberOfSeasons = details.number_of_seasons || 0;
  const seasonsToCheck = numberOfSeasons > 0 ? (numberOfSeasons > 1 ? [numberOfSeasons, numberOfSeasons - 1] : [numberOfSeasons]) : [];

  for (const seasonNum of seasonsToCheck) {
    const seasonData = await tmdbFetch<TVSeasonEpisodesResponse>(`tv/${tvId}/season/${seasonNum}`);
    const episodes = seasonData?.episodes || [];

    for (const ep of episodes) {
      if (ep.air_date) {
        const adjustedDate = adjustAirDate(ep.air_date);
        const airDate = parseLocalDate(adjustedDate);
        if (!airDate) continue;
        
        const sixtyDaysFromNow = new Date(today);
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        
        if (airDate >= today && airDate <= sixtyDaysFromNow) {
          upcomingEpisodes.push({
            id: ep.id,
            name: ep.name,
            overview: ep.overview || '',
            air_date: adjustedDate,
            episode_number: ep.episode_number,
            season_number: ep.season_number,
            still_path: ep.still_path,
            vote_average: ep.vote_average || 0,
            runtime: ep.runtime
          });
        }
      }
    }
  }

  return upcomingEpisodes.sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime());
};

// Lấy thông tin tập phim tiếp theo.
export const getTVShowNextEpisode = async (tvId: number): Promise<TMDBEpisode | null> => {
  const data = await tmdbFetch<TVDetailsResponse>(`tv/${tvId}`, { append_to_response: 'next_episode_to_air' });
  
  if (data?.next_episode_to_air) {
    const ep = data.next_episode_to_air;
    return {
      id: ep.id,
      name: ep.name,
      overview: ep.overview || '',
      air_date: adjustAirDate(ep.air_date),
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      still_path: ep.still_path,
      vote_average: ep.vote_average || 0,
      runtime: ep.runtime
    };
  }

  return null;
};
