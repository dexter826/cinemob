import { describe, expect, it } from 'vitest';
import { filterAndSortSharedMovies } from './shareSelectors';

describe('share selectors', () => {
  it('filters and sorts shared movies without mutating the source list', () => {
    const movies = [
      { id: 1, title: 'Dune', title_vi: 'Cồn cát', release_date: '2021-01-01', rating: 8 },
      { id: 2, title: 'Arrival', title_vi: 'Cuộc đổ bộ', release_date: '2016-01-01', rating: 9 },
    ];
    expect(filterAndSortSharedMovies(movies, 'con cat', 'rating-desc').map(movie => movie.id)).toEqual([1]);
    expect(movies.map(movie => movie.id)).toEqual([1, 2]);
  });
});
