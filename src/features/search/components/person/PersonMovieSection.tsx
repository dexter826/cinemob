import type { RefObject } from 'react';
import { ArrowDown, ArrowUp, Calendar, Film, Filter, Search, Type, X } from 'lucide-react';
import type { PersonMovie } from '@/types';
import TMDBMovieCard from '../TMDBMovieCard';
import Pagination from '@/shared/components/ui/Pagination';
import MultiSelectDropdown from '@/shared/components/ui/MultiSelectDropdown';
import EmptyState from '@/shared/components/ui/EmptyState';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';

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
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Tìm phim của nghệ sĩ này…"
              className="w-full h-11 sm:h-12 bg-surface border border-border-default rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-10 text-xs sm:text-sm font-medium text-text-main focus:outline-none focus:border-primary/50 shadow-premium transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange('')}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-muted transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onShowFiltersChange(!showFilters); }}
            aria-label={showFilters ? "Đóng bộ lọc nâng cao" : "Mở bộ lọc nâng cao"}
            className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl border transition-colors shadow-premium cursor-pointer ${showFilters ? 'bg-primary border-primary text-white' : 'bg-surface border-border-default text-text-muted hover:border-primary/50'}`}
          >
            <Filter size={20} />
          </button>

          {showFilters && (
            <div ref={filterRef} className="absolute top-full left-0 right-0 md:right-0 md:left-auto mt-3 z-30 bg-surface-elevated p-6 rounded-3xl border border-border shadow-elevated flex flex-col gap-6 md:min-w-[320px]">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-text-secondary">Sắp xếp theo</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onSortByChange('year')} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${sortBy === 'year' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:bg-black/10 dark:hover:bg-white/10'}`}>
                    <Calendar size={14} /> <span>Năm</span>
                  </button>
                  <button onClick={() => onSortByChange('title')} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${sortBy === 'title' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:bg-black/10 dark:hover:bg-white/10'}`}>
                    <Type size={14} /> <span>Tên</span>
                  </button>
                  <button onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 text-text-muted hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-transparent cursor-pointer ml-auto">
                    {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-border-default" />

              <div className="space-y-4">
                <div className="text-xs font-semibold text-text-secondary">Lọc nâng cao</div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary ml-1">Năm phát hành</label>
                  <MultiSelectDropdown
                    options={availableYears.map(year => ({ value: year, label: year }))}
                    values={selectedYears}
                    onChange={(values) => onSelectedYearsChange(values.map(v => v.toString()))}
                    placeholder="Tất cả các năm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {paginatedMovies.length > 0 && (
          <div className="flex items-center justify-end">
            <span className="text-xs font-semibold text-text-secondary bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-border">
              Hiển thị {paginatedMovies.length} / {filteredCount} mục
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {paginatedMovies.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {paginatedMovies.map((movie) => (
              <TMDBMovieCard
                key={`${movie.id}-${movie.media_type}`}
                movie={movie}
                onClick={() => handleMovieClick(movie)}
                character={movie.character}
                job={movie.job}
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
          description={searchQuery ? `Không tìm thấy phim nào của nghệ sĩ này phù hợp với "${searchQuery}"` : "Nghệ sĩ này chưa có thông tin về các bộ phim tham gia."}
        />
      )}
    </>
  );
}
