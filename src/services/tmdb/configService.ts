import { tmdbFetch } from './tmdbClient';

/** Lấy danh sách các thể loại phim. */
export const getGenres = async (): Promise<{ id: number; name: string }[]> => {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>(`genre/movie/list`);
  return data?.genres || [];
};

/** Lấy danh sách các quốc gia. */
export const getCountries = async (): Promise<{ iso_3166_1: string; english_name: string; native_name: string }[]> => {
  const data = await tmdbFetch<any[]>(`configuration/countries`);
  return data || [];
};
