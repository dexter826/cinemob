import { tmdbFetch } from './tmdbClient';
import { TMDBMovieDetail, TMDBVideo, TMDBCredits, PersonMovie } from '@/types';
import { API_KEY } from './tmdbClient';
import {
  decodeCreditResponse,
  decodeCredits,
  decodeMovieDetail,
  decodeVideoResults,
  type TMDBCreditItem,
} from './tmdbDecoders';

const toPersonMovie = (item: TMDBCreditItem, media_type: 'movie' | 'tv'): PersonMovie => ({
  id: item.id,
  title: item.title,
  name: item.name,
  poster_path: item.poster_path ?? null,
  release_date: item.release_date,
  first_air_date: item.first_air_date,
  media_type,
  character: item.character,
  job: item.job,
  department: item.department,
});

// Lấy thông tin chi tiết phim.
export const getMovieDetails = async (id: number, mediaType: 'movie' | 'tv' = 'movie', signal?: AbortSignal): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch(`${mediaType}/${id}`, {}, decodeMovieDetail, signal);
};

// Lấy thông tin chi tiết phim theo ngôn ngữ.
export const getMovieDetailsWithLanguage = async (id: number, mediaType: 'movie' | 'tv' = 'movie', language: string = 'vi-VN', signal?: AbortSignal): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch(`${mediaType}/${id}`, { language }, decodeMovieDetail, signal);
};

// Lấy danh sách trailer/video.
export const getMovieVideos = async (id: number, mediaType: 'movie' | 'tv' = 'movie', signal?: AbortSignal): Promise<TMDBVideo[]> => {
  const data = await tmdbFetch(`${mediaType}/${id}/videos`, {}, decodeVideoResults, signal);
  return (data?.results || []).filter((video: TMDBVideo) => video.type === 'Trailer' && video.site === 'YouTube');
};

// Lấy danh sách diễn viên và đoàn phim.
export const getMovieCredits = async (id: number, mediaType: 'movie' | 'tv' = 'movie', signal?: AbortSignal): Promise<TMDBCredits | null> => {
  return tmdbFetch(`${mediaType}/${id}/credits`, {}, decodeCredits, signal);
};

// Lấy phim theo diễn viên.
export const getPersonMovieCredits = async (personId: number, signal?: AbortSignal): Promise<PersonMovie[]> => {
  if (!API_KEY) return [];

  try {
    const [movieData, tvData] = await Promise.all([
      tmdbFetch(`person/${personId}/movie_credits`, {}, decodeCreditResponse, signal),
      tmdbFetch(`person/${personId}/tv_credits`, {}, decodeCreditResponse, signal)
    ]);

    const movies: PersonMovie[] = [...(movieData?.cast || []), ...(movieData?.crew || [])].map((item) =>
      toPersonMovie(item, 'movie'));

    const tvShows: PersonMovie[] = [...(tvData?.cast || []), ...(tvData?.crew || [])].map((item) =>
      toPersonMovie(item, 'tv'));

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
