import { tmdbFetch } from './tmdbClient';
import { TMDBMovieDetail, TMDBVideo, TMDBCredits, PersonMovie } from '@/types';
import { API_KEY } from './tmdbClient';

interface TMDBCreditItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  character?: string;
  job?: string;
  department?: string;
}

interface TMDBCreditResponse {
  cast?: TMDBCreditItem[];
  crew?: TMDBCreditItem[];
}

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
export const getMovieDetails = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch<TMDBMovieDetail>(`${mediaType}/${id}`);
};

// Lấy thông tin chi tiết phim theo ngôn ngữ.
export const getMovieDetailsWithLanguage = async (id: number, mediaType: 'movie' | 'tv' = 'movie', language: string = 'vi-VN'): Promise<TMDBMovieDetail | null> => {
  return tmdbFetch<TMDBMovieDetail>(`${mediaType}/${id}`, { language });
};

// Lấy danh sách trailer/video.
export const getMovieVideos = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBVideo[]> => {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(`${mediaType}/${id}/videos`);
  return (data?.results || []).filter((video: TMDBVideo) => video.type === 'Trailer' && video.site === 'YouTube');
};

// Lấy danh sách diễn viên và đoàn phim.
export const getMovieCredits = async (id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBCredits | null> => {
  return tmdbFetch<TMDBCredits>(`${mediaType}/${id}/credits`);
};

// Lấy phim theo diễn viên.
export const getPersonMovieCredits = async (personId: number): Promise<PersonMovie[]> => {
  if (!API_KEY) return [];

  try {
    const [movieData, tvData] = await Promise.all([
      tmdbFetch<TMDBCreditResponse>(`person/${personId}/movie_credits`),
      tmdbFetch<TMDBCreditResponse>(`person/${personId}/tv_credits`)
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
