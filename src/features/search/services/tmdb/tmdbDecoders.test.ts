import { describe, expect, it } from 'vitest';
import {
  decodeCredits,
  decodeMovieDetail,
  decodePersonPage,
  decodeTVDetails,
  decodeTVSeasonEpisodes,
  decodeVideoResults,
} from './tmdbDecoders';

describe('TMDB response decoders', () => {
  it('accepts the fields consumed from movie details', () => {
    expect(decodeMovieDetail({
      id: 1,
      title: 'Movie',
      poster_path: null,
      runtime: 120,
      genres: [{ id: 18, name: 'Drama' }],
      production_countries: [{ iso_3166_1: 'VN', name: 'Vietnam' }],
    })).toMatchObject({ id: 1, runtime: 120 });
    expect(decodeMovieDetail({ title: 'Missing id', poster_path: null })).toBeNull();
  });

  it('rejects a malformed person inside a paged response', () => {
    expect(decodePersonPage({
      results: [{ id: 1, name: 'Actor', profile_path: null, known_for_department: 'Acting', popularity: 1 }],
      total_pages: 1,
    })?.results).toHaveLength(1);
    expect(decodePersonPage({ results: [{ id: 'bad' }], total_pages: 1 })).toBeNull();
  });

  it('validates credits, videos and TV episode payloads', () => {
    const person = { id: 1, name: 'Actor', profile_path: null, known_for_department: 'Acting', popularity: 1 };
    expect(decodeCredits({
      cast: [{ ...person, character: 'Lead', order: 0 }],
      crew: [{ ...person, job: 'Director', department: 'Directing' }],
    })).not.toBeNull();
    expect(decodeCredits({ cast: 'invalid', crew: [] })).toBeNull();

    expect(decodeVideoResults({
      results: [{ id: 'v1', key: 'abc', name: 'Trailer', site: 'YouTube', type: 'Trailer', published_at: '' }],
    })?.results).toHaveLength(1);

    const episode = {
      id: 10,
      name: 'Episode',
      overview: '',
      air_date: '2026-09-30',
      episode_number: 1,
      season_number: 1,
      still_path: null,
      vote_average: 0,
    };
    expect(decodeTVSeasonEpisodes({ episodes: [episode] })?.episodes).toHaveLength(1);
    expect(decodeTVDetails({ number_of_seasons: 1, next_episode_to_air: episode })).not.toBeNull();
    expect(decodeTVSeasonEpisodes({ episodes: [{ ...episode, id: 'bad' }] })).toBeNull();
  });
});
