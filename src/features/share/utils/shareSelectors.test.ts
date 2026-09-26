import { describe, expect, it } from 'vitest';
import { filterAndSortSharedMovies, getSharedMovieTypeCounts, getVisibleSharedMovies } from './shareSelectors';

describe('share selectors', () => {
  it('filters and sorts shared movies without mutating the source list', () => {
    const movies = [
      { id: 1, title: 'Dune', title_vi: 'Cồn cát', release_date: '2021-01-01', rating: 8 },
      { id: 2, title: 'Arrival', title_vi: 'Cuộc đổ bộ', release_date: '2016-01-01', rating: 9 },
    ];
    expect(filterAndSortSharedMovies(movies, 'con cat', 'rating-desc').map(movie => movie.id)).toEqual([1]);
    expect(movies.map(movie => movie.id)).toEqual([1, 2]);
  });

  it('returns only the requested visible portion for load more rendering', () => {
    const movies = [
      { id: 1, title: 'One' },
      { id: 2, title: 'Two' },
      { id: 3, title: 'Three' },
    ];

    expect(getVisibleSharedMovies(movies, 2).map(movie => movie.id)).toEqual([1, 2]);
    expect(getVisibleSharedMovies(movies, 10)).toEqual(movies);
  });

  it('counts shared movies and TV series separately', () => {
    const movies = [
      { id: 1, title: 'Movie', media_type: 'movie' as const },
      { id: 2, title: 'Series', media_type: 'tv' as const },
      { id: 3, title: 'Legacy movie' },
    ];

    expect(getSharedMovieTypeCounts(movies)).toEqual({ movieCount: 2, tvCount: 1 });
  });
});
