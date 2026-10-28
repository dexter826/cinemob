import type { PersonMovie } from '@/types';

export type PersonSortBy = 'title' | 'year';
export type SortOrder = 'asc' | 'desc';

// Ngày TMDB là `YYYY-MM-DD`; cắt chuỗi để không lệch năm theo múi giờ.
const getReleaseDate = (movie: PersonMovie): string =>
  movie.release_date || movie.first_air_date || '';

export function getPersonAvailableYears(movies: PersonMovie[]): string[] {
  const years = new Set<string>();
  movies.forEach((movie) => {
    const year = getReleaseDate(movie).slice(0, 4);
    if (/^\d{4}$/.test(year)) years.add(year);
  });
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export function filterAndSortPersonMovies(
  movies: PersonMovie[],
  query: string,
  selectedYears: string[],
  sortBy: PersonSortBy,
  sortOrder: SortOrder,
): PersonMovie[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const result = movies.filter((movie) => {
    const title = (movie.title || movie.name || '').toLocaleLowerCase();
    const date = getReleaseDate(movie);
    return (
      (!normalizedQuery || title.includes(normalizedQuery)) &&
      (selectedYears.length === 0 || selectedYears.some((year) => date.startsWith(year)))
    );
  });

  return [...result].sort((a, b) => {
    const comparison =
      sortBy === 'title'
        ? (a.title || a.name || '').localeCompare(b.title || b.name || '')
        : (getReleaseDate(a) || '1900-01-01').localeCompare(getReleaseDate(b) || '1900-01-01');
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export function paginatePersonMovies(
  movies: PersonMovie[],
  page: number,
  perPage: number,
): PersonMovie[] {
  return movies.slice(Math.max(0, page - 1) * perPage, Math.max(0, page) * perPage);
}
