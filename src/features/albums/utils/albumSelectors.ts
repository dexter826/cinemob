import type { Movie } from '@/types';

export function normalizeVietnamese(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterAvailableAlbumMovies(movies: Movie[], selectedIds: string[], query: string): Movie[] {
  const selected = new Set(selectedIds);
  const available = movies.filter(movie => movie.docId && !selected.has(movie.docId));
  const normalizedQuery = normalizeVietnamese(query.trim());
  if (!normalizedQuery) return available;
  return available.filter(movie =>
    normalizeVietnamese(movie.title || '').includes(normalizedQuery) ||
    normalizeVietnamese(movie.title_vi || '').includes(normalizedQuery),
  );
}

export function paginateItems<T>(items: T[], page: number, perPage: number): T[] {
  if (perPage <= 0) return [];
  const start = Math.max(0, page - 1) * perPage;
  return items.slice(start, start + perPage);
}
