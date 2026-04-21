import { tmdbFetch } from './tmdbClient';
import { TMDBMovieDetail, TMDBVideo, TMDBCredits, PersonMovie } from '../../types';
import { API_KEY, BASE_URL } from './tmdbClient';

/** Lấy thông tin chi tiết của phim. */
export const getMovieDetails = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch<TMDBMovieDetail>(`${mediaType}/${id}`);
};

/** Lấy thông tin chi tiết phim với ngôn ngữ cụ thể. */
export const getMovieDetailsWithLanguage = async (id: number, mediaType: 'movie' | 'tv' = 'movie', language: string = 'vi-VN'): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch<TMDBMovieDetail>(`${mediaType}/${id}`, { language });
};

/** Lấy danh sách trailer/video của phim. */
export const getMovieVideos = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBVideo[]> => {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(`${mediaType}/${id}/videos`);
  return (data?.results || []).filter((video: TMDBVideo) => video.type === 'Trailer' && video.site === 'YouTube');
};

/** Lấy danh sách diễn viên và đoàn làm phim. */
export const getMovieCredits = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBCredits | null> => {
  return tmdbFetch<TMDBCredits>(`${mediaType}/${id}/credits`);
};

/** Lấy danh sách phim mà một diễn viên đã tham gia. */
export const getPersonMovieCredits = async (personId: number): Promise<PersonMovie[]> => {
  if (!API_KEY) return [];

  try {
    const [movieData, tvData] = await Promise.all([
      tmdbFetch<{ cast: any[]; crew: any[] }>(`person/${personId}/movie_credits`),
      tmdbFetch<{ cast: any[]; crew: any[] }>(`person/${personId}/tv_credits`)
    ]);

    const movies: PersonMovie[] = [...(movieData?.cast || []), ...(movieData?.crew || [])].map((item: any) => ({
      ...item,
      media_type: 'movie' as const,
    }));

    const tvShows: PersonMovie[] = [...(tvData?.cast || []), ...(tvData?.crew || [])].map((item: any) => ({
      ...item,
      media_type: 'tv' as const,
    }));

    const combined = [...movies, ...tvShows];
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
    );

    return unique.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
      const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Failed to get person movie credits:", error);
    return [];
  }
};
