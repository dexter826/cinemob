import type { PersonMovie } from '@/types';

export type PersonSortBy = 'title' | 'year';
export type SortOrder = 'asc' | 'desc';

export function getPersonAvailableYears(movies: PersonMovie[]): string[] {
  const years = new Set<string>();
  movies.forEach(movie => {
    const date = movie.release_date || movie.first_air_date;
    if (date) years.add(new Date(date).getFullYear().toString());
  });
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
}

export function filterAndSortPersonMovies(
  movies: PersonMovie[],
  query: string,
  selectedYears: string[],
  sortBy: PersonSortBy,
  sortOrder: SortOrder,
): PersonMovie[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const result = movies.filter(movie => {
    const title = (movie.title || movie.name || '').toLocaleLowerCase();
    const date = movie.release_date || movie.first_air_date || '';
    return (!normalizedQuery || title.includes(normalizedQuery)) &&
      (selectedYears.length === 0 || selectedYears.some(year => date.startsWith(year)));
  });

  return [...result].sort((a, b) => {
    const comparison = sortBy === 'title'
      ? (a.title || a.name || '').localeCompare(b.title || b.name || '')
      : new Date(a.release_date || a.first_air_date || '1900-01-01').getFullYear() -
        new Date(b.release_date || b.first_air_date || '1900-01-01').getFullYear();
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export function paginatePersonMovies(movies: PersonMovie[], page: number, perPage: number): PersonMovie[] {
  return movies.slice(Math.max(0, page - 1) * perPage, Math.max(0, page) * perPage);
}
