import { describe, expect, it } from 'vitest';
import type { Movie } from '@/types';
import { filterAvailableAlbumMovies, paginateItems } from './albumSelectors';

const movie = (docId: string, title: string, title_vi?: string): Movie => ({
  docId, uid: 'u', id: docId, title, title_vi, poster_path: '', runtime: 1,
  watched_at: new Date(), source: 'manual', status: 'history',
});

describe('album selectors', () => {
  it('filters by Vietnamese text without accents and excludes selected movies', () => {
    expect(filterAvailableAlbumMovies(
      [movie('1', 'The Bear', 'Gấu'), movie('2', 'Dune', 'Cồn cát')],
      ['1'],
      'con cat',
    ).map(item => item.docId)).toEqual(['2']);
  });

  it('paginates safely and returns empty result for invalid page size', () => {
    expect(paginateItems([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
    expect(paginateItems([1], 1, 0)).toEqual([]);
  });
});
