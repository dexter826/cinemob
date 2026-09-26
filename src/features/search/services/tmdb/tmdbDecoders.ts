import type {
  TMDBCredits,
  TMDBEpisode,
  TMDBMovieDetail,
  TMDBMovieResult,
  TMDBPerson,
  TMDBVideo,
} from '@/types';

export type Decoder<T> = (value: unknown) => T | null;

export const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const isOptionalString = (value: unknown): value is string | undefined => (
  value === undefined || typeof value === 'string'
);

const isOptionalNumber = (value: unknown): value is number | undefined => (
  value === undefined || typeof value === 'number'
);

const isNullableString = (value: unknown): value is string | null => (
  value === null || typeof value === 'string'
);

const isStringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every(item => typeof item === 'string')
);

const decodeArray = <T>(value: unknown, decode: Decoder<T>): T[] | null => {
  if (!Array.isArray(value)) return null;
  const decoded = value.map(decode);
  return decoded.some(item => item === null) ? null : decoded as T[];
};

export const decodeMovieResult: Decoder<TMDBMovieResult> = (value) => {
  if (!isRecord(value) || typeof value.id !== 'number' || !isNullableString(value.poster_path)) {
    return null;
  }
  if (!isOptionalString(value.title) || !isOptionalString(value.name)) return null;
  if (!isOptionalNumber(value.vote_average) || !isOptionalNumber(value.popularity)) return null;
  return value as unknown as TMDBMovieResult;
};

export const decodeMovieResultPage: Decoder<{
  results: TMDBMovieResult[];
  total_pages: number;
}> = (value) => {
  if (!isRecord(value) || !Array.isArray(value.results) || typeof value.total_pages !== 'number') {
    return null;
  }
  const results = value.results.map(decodeMovieResult);
  if (results.some(result => result === null)) return null;
  return { results: results as TMDBMovieResult[], total_pages: value.total_pages };
};

export const decodeMovieDetail: Decoder<TMDBMovieDetail> = (value) => {
  if (!isRecord(value) || typeof value.id !== 'number' || !isNullableString(value.poster_path)) return null;
  if (!isOptionalString(value.title) || !isOptionalString(value.name)) return null;
  if (!isOptionalString(value.overview) || !isOptionalString(value.tagline)) return null;
  if (!isOptionalString(value.release_date) || !isOptionalString(value.first_air_date)) return null;
  if (!isOptionalNumber(value.runtime) || !isOptionalNumber(value.number_of_seasons)) return null;
  if (value.episode_run_time !== undefined && (!Array.isArray(value.episode_run_time) || !value.episode_run_time.every(item => typeof item === 'number'))) return null;
  if (value.genres !== undefined && (!Array.isArray(value.genres) || !value.genres.every(item => isRecord(item) && typeof item.id === 'number' && typeof item.name === 'string'))) return null;
  if (value.production_countries !== undefined && (!Array.isArray(value.production_countries) || !value.production_countries.every(item => isRecord(item) && typeof item.iso_3166_1 === 'string' && typeof item.name === 'string'))) return null;
  return value as unknown as TMDBMovieDetail;
};

export const decodePerson: Decoder<TMDBPerson> = (value) => {
  if (!isRecord(value) || typeof value.id !== 'number' || typeof value.name !== 'string') return null;
  if (!isNullableString(value.profile_path) || typeof value.known_for_department !== 'string' || typeof value.popularity !== 'number') return null;
  if (!isOptionalString(value.biography) || !isOptionalString(value.birthday) || !isOptionalString(value.deathday)) return null;
  if (value.known_for !== undefined && decodeArray(value.known_for, decodeMovieResult) === null) return null;
  return value as unknown as TMDBPerson;
};

export const decodePersonPage: Decoder<{ results: TMDBPerson[]; total_pages: number }> = (value) => {
  if (!isRecord(value) || typeof value.total_pages !== 'number') return null;
  const results = decodeArray(value.results, decodePerson);
  return results ? { results, total_pages: value.total_pages } : null;
};

const decodeVideo: Decoder<TMDBVideo> = (value) => {
  if (!isRecord(value)) return null;
  const fields = ['id', 'key', 'name', 'site', 'type', 'published_at'] as const;
  return fields.every(field => typeof value[field] === 'string') ? value as unknown as TMDBVideo : null;
};

export const decodeVideoResults: Decoder<{ results: TMDBVideo[] }> = (value) => {
  if (!isRecord(value)) return null;
  const results = decodeArray(value.results, decodeVideo);
  return results ? { results } : null;
};

const decodeCast = (value: unknown) => {
  const person = decodePerson(value);
  if (!person || !isRecord(value) || typeof value.character !== 'string' || typeof value.order !== 'number') return null;
  return value as unknown as TMDBCredits['cast'][number];
};

const decodeCrew = (value: unknown) => {
  const person = decodePerson(value);
  if (!person || !isRecord(value) || typeof value.job !== 'string' || typeof value.department !== 'string') return null;
  return value as unknown as TMDBCredits['crew'][number];
};

export const decodeCredits: Decoder<TMDBCredits> = (value) => {
  if (!isRecord(value)) return null;
  const cast = decodeArray(value.cast, decodeCast);
  const crew = decodeArray(value.crew, decodeCrew);
  return cast && crew ? { cast, crew } : null;
};

export interface TMDBCreditItem {
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

const decodeCreditItem: Decoder<TMDBCreditItem> = (value) => {
  if (!isRecord(value) || typeof value.id !== 'number') return null;
  if (!isOptionalString(value.title) || !isOptionalString(value.name)) return null;
  if (value.poster_path !== undefined && !isNullableString(value.poster_path)) return null;
  return value as unknown as TMDBCreditItem;
};

export const decodeCreditResponse: Decoder<{ cast?: TMDBCreditItem[]; crew?: TMDBCreditItem[] }> = (value) => {
  if (!isRecord(value)) return null;
  const cast = value.cast === undefined ? undefined : decodeArray(value.cast, decodeCreditItem);
  const crew = value.crew === undefined ? undefined : decodeArray(value.crew, decodeCreditItem);
  if (cast === null || crew === null) return null;
  return { cast, crew };
};

export const decodeTVSeason: Decoder<{ episodes?: Array<{ id: number }> }> = (value) => {
  if (!isRecord(value)) return null;
  if (value.episodes !== undefined && (!Array.isArray(value.episodes) || !value.episodes.every(item => isRecord(item) && typeof item.id === 'number'))) return null;
  return value as { episodes?: Array<{ id: number }> };
};

const decodeEpisode: Decoder<TMDBEpisode> = (value) => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'number' || typeof value.name !== 'string' || typeof value.overview !== 'string') return null;
  if (typeof value.air_date !== 'string' || typeof value.episode_number !== 'number' || typeof value.season_number !== 'number') return null;
  if (!isNullableString(value.still_path) || (value.vote_average !== undefined && typeof value.vote_average !== 'number')) return null;
  if (!isOptionalNumber(value.runtime)) return null;
  return { ...value, vote_average: typeof value.vote_average === 'number' ? value.vote_average : 0 } as TMDBEpisode;
};

export const decodeTVSeasonEpisodes: Decoder<{ episodes?: TMDBEpisode[] }> = (value) => {
  if (!isRecord(value)) return null;
  if (value.episodes === undefined) return {};
  const episodes = decodeArray(value.episodes, decodeEpisode);
  return episodes ? { episodes } : null;
};

export const decodeTVDetails: Decoder<{
  status?: string;
  origin_country?: string[];
  number_of_seasons?: number;
  next_episode_to_air?: TMDBEpisode;
}> = (value) => {
  if (!isRecord(value) || !isOptionalString(value.status) || !isOptionalNumber(value.number_of_seasons)) return null;
  if (value.origin_country !== undefined && !isStringArray(value.origin_country)) return null;
  const nextEpisode = value.next_episode_to_air === undefined ? undefined : decodeEpisode(value.next_episode_to_air);
  if (nextEpisode === null) return null;
  return {
    status: value.status,
    origin_country: value.origin_country as string[] | undefined,
    number_of_seasons: value.number_of_seasons,
    next_episode_to_air: nextEpisode,
  };
};
