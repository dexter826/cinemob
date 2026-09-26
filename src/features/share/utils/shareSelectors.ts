import type { PublicShareMovie } from '@/types';

export type ShareSortOption = 'default' | 'rating-desc' | 'year-desc' | 'year-asc';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export function filterAndSortSharedMovies(movies: PublicShareMovie[], query: string, sortBy: ShareSortOption): PublicShareMovie[] {
  const normalizedQuery = normalize(query.trim());
  const result = movies.filter(movie => {
    if (!normalizedQuery) return true;
    return normalize(movie.title).includes(normalizedQuery) ||
      Boolean(movie.title_vi && normalize(movie.title_vi).includes(normalizedQuery));
  });

  return [...result].sort((a, b) => {
    if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'year-desc') return (b.release_date || '').localeCompare(a.release_date || '');
    if (sortBy === 'year-asc') return (a.release_date || '').localeCompare(b.release_date || '');
    return 0;
  });
}
