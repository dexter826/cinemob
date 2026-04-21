import { tmdbFetch, withLimit, API_KEY } from './tmdbClient';
import { TMDBEpisode } from '../../types';

/** Lấy thông tin chi tiết của một mùa phim (TV Season). */
export const getTVSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ episode_count: number } | null> => {
  const data = await tmdbFetch<{ episodes?: any[] }>(`tv/${tvId}/season/${seasonNumber}`);
  return data ? { episode_count: data.episodes?.length || 0 } : null;
};

/** Lấy thông tin tổng hợp về các tập phim của một TV Show. */
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

/** Lấy danh sách các tập phim sắp phát hành. */
export const getTVShowUpcomingEpisodes = async (tvId: number): Promise<TMDBEpisode[]> => {
  const details = await tmdbFetch<any>(`tv/${tvId}`);
  if (!details || details.status === 'Ended' || details.status === 'Canceled') return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEpisodes: TMDBEpisode[] = [];

  const numberOfSeasons = details.number_of_seasons || 0;
  const seasonsToCheck = numberOfSeasons > 0 ? (numberOfSeasons > 1 ? [numberOfSeasons, numberOfSeasons - 1] : [numberOfSeasons]) : [];

  for (const seasonNum of seasonsToCheck) {
    const seasonData = await tmdbFetch<{ episodes?: any[] }>(`tv/${tvId}/season/${seasonNum}`);
    const episodes = seasonData?.episodes || [];

    for (const ep of episodes) {
      if (ep.air_date) {
        const airDate = new Date(ep.air_date);
        airDate.setHours(0, 0, 0, 0);
        
        const sixtyDaysFromNow = new Date(today);
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        
        if (airDate >= today && airDate <= sixtyDaysFromNow) {
          upcomingEpisodes.push({
            id: ep.id,
            name: ep.name,
            overview: ep.overview || '',
            air_date: ep.air_date,
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

/** Lấy thông tin tập phim tiếp theo sẽ phát hành. */
export const getTVShowNextEpisode = async (tvId: number): Promise<TMDBEpisode | null> => {
  const data = await tmdbFetch<any>(`tv/${tvId}`, { append_to_response: 'next_episode_to_air' });
  
  if (data?.next_episode_to_air) {
    const ep = data.next_episode_to_air;
    return {
      id: ep.id,
      name: ep.name,
      overview: ep.overview || '',
      air_date: ep.air_date,
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      still_path: ep.still_path,
      vote_average: ep.vote_average || 0,
      runtime: ep.runtime
    };
  }

  return null;
};
