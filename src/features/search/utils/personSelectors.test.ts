import { describe, expect, it } from 'vitest';
import type { PersonMovie } from '@/types';
import { filterAndSortPersonMovies, getPersonAvailableYears, paginatePersonMovies } from './personSelectors';

const movie = (id: number, title: string, date: string): PersonMovie => ({
  id, title, media_type: 'movie', release_date: date, poster_path: null,
});

describe('person selectors', () => {
  it('filters, sorts and paginates person credits', () => {
    const movies = [movie(1, 'Dune', '2021-01-01'), movie(2, 'Arrival', '2016-01-01')];
    expect(getPersonAvailableYears(movies)).toEqual(['2021', '2016']);
    expect(filterAndSortPersonMovies(movies, 'arr', [], 'title', 'asc').map(item => item.id)).toEqual([2]);
    expect(paginatePersonMovies(movies, 2, 1).map(item => item.id)).toEqual([2]);
  });
});
