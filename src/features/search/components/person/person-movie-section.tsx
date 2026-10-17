import type { RefObject } from 'react';
import { ArrowDown, ArrowUp, Calendar, Film, Filter, Type } from 'lucide-react';
import type { PersonMovie } from '@/types';
import PosterCard from '@/features/movies/components/poster-card';
import Search from '@/shared/components/ui/search';
import { getMainTitleForTMDB } from '@/shared/utils/tmdb';
import Pagination from '@/shared/components/ui/pagination';
import MultiSelectDropdown from '@/shared/components/ui/multi-select-dropdown';
import EmptyState from '@/shared/components/ui/empty-state';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';

interface PersonMovieSectionProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  filterRef: RefObject<HTMLDivElement | null>;
  sortBy: 'title' | 'year';
  onSortByChange: (s: 'title' | 'year') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (o: 'asc' | 'desc') => void;
  availableYears: string[];
  selectedYears: string[];
  onSelectedYearsChange: (years: string[]) => void;
  paginatedMovies: PersonMovie[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Thanh tìm/lọc + lưới phim của nghệ sĩ.
export function PersonMovieSection({
  searchQuery,
  onSearchQueryChange,
  showFilters,
  onShowFiltersChange,
  filterRef,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  availableYears,
  selectedYears,
  onSelectedYearsChange,
  paginatedMovies,
  filteredCount,
  currentPage,
  totalPages,
  onPageChange,
}: PersonMovieSectionProps) {
  const { openAddModal } = useAddMovieStore();

  const handleMovieClick = (movie: PersonMovie) => {
    openAddModal({
      movie: {
        id: movie.id,
        title: movie.title || movie.name || '',
        poster_path: movie.poster_path || '',
        release_date: movie.release_date || movie.first_air_date || '',
        media_type: movie.media_type,
      },
      mediaType: movie.media_type,
    });
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
        <div className="flex items-center gap-3 relative md:flex-1">
          <Search
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder="Tìm phim của nghệ sĩ này…"
            label="Tìm phim của nghệ sĩ này"
            className="flex-1"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowFiltersChange(!showFilters);
            }}
            aria-label={showFilters ? 'Đóng bộ lọc nâng cao' : 'Mở bộ lọc nâng cao'}
            className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-control border transition-colors cursor-pointer ${showFilters ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/50 hover:text-primary'}`}
          >
            <Filter size={18} aria-hidden="true" />
          </button>

          {showFilters && (
            <div
              ref={filterRef}
              className="absolute top-full left-0 right-0 md:right-0 md:left-auto mt-3 z-30 bg-surface-elevated p-6 rounded-dialog border border-border flex flex-col gap-6 md:min-w-[320px]"
            >
              <div className="space-y-3">
                <div className="text-xs font-semibold text-text-secondary">Sắp xếp theo</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSortByChange('year')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors border cursor-pointer ${sortBy === 'year' ? 'bg-primary text-on-primary border-primary' : 'border-transparent text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <Calendar size={14} aria-hidden="true" /> <span>Năm</span>
                  </button>
                  <button
                    onClick={() => onSortByChange('title')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors border cursor-pointer ${sortBy === 'title' ? 'bg-primary text-on-primary border-primary' : 'border-transparent text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <Type size={14} aria-hidden="true" /> <span>Tên</span>
                  </button>
                  <button
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-transparent cursor-pointer ml-auto"
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp size={14} aria-hidden="true" />
                    ) : (
                      <ArrowDown size={14} aria-hidden="true" />
                    )}
                    <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-border-default" />

              <div className="space-y-4">
                <div className="text-xs font-semibold text-text-secondary">Lọc nâng cao</div>
                <div className="space-y-2">
                  <label
                    htmlFor="person-movie-years"
                    id="person-movie-years-label"
                    className="text-xs font-semibold text-text-secondary ml-1"
                  >
                    Năm phát hành
                  </label>
                  <MultiSelectDropdown
                    id="person-movie-years"
                    aria-labelledby="person-movie-years-label"
                    options={availableYears.map((year) => ({ value: year, label: year }))}
                    values={selectedYears}
                    onChange={(values) => onSelectedYearsChange(values.map((v) => v.toString()))}
                    placeholder="Chọn năm…"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {paginatedMovies.length > 0 && (
          <p className="flex items-center justify-end text-[11px] font-semibold tracking-[0.08em] text-text-secondary tabular-nums">
            Hiển thị {paginatedMovies.length} / {filteredCount} mục
          </p>
        )}
      </div>

      {/* Results */}
      {paginatedMovies.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {paginatedMovies.map((movie) => (
              <PosterCard
                key={`${movie.id}-${movie.media_type}`}
                title={getMainTitleForTMDB(movie)}
                posterPath={movie.poster_path}
                mediaType={movie.media_type === 'tv' ? 'tv' : 'movie'}
                meta={(movie.release_date || movie.first_air_date || '').split('-')[0]}
                credit={movie.character || movie.job}
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Film}
          title="Không tìm thấy phim"
          description={
            searchQuery
              ? `Không tìm thấy phim nào của nghệ sĩ này phù hợp với “${searchQuery}”`
              : 'Nghệ sĩ này chưa có thông tin về các bộ phim tham gia.'
          }
        />
      )}
    </>
  );
}
