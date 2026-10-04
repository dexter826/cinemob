import { useRef, useEffect } from 'react';
import { Search, X, Filter, RotateCcw, Loader2, Star, Calendar, Film, Tv } from 'lucide-react';
import Dropdown from '@/shared/components/ui/Dropdown';
import { TMDB_COUNTRY_OPTIONS } from '@/constants';
import { TMDBMovieResult } from '@/types';
import { getTMDBImageUrl, getMainTitleForTMDB } from '@/features/movies/utils/movieUtils';
import type { SearchSortBy, SearchFormFilters } from '../hooks/useSearch';

interface SearchFiltersProps {
  filters: SearchFormFilters;
  updateFilter: <K extends keyof SearchFormFilters>(key: K, value: SearchFormFilters[K]) => void;
  handleSearch: () => void;
  handleClear: () => void;
  suggestions: TMDBMovieResult[];
  isSuggesting: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSelectMovie: (movie: TMDBMovieResult) => void;
}

/** Bộ lọc và tìm kiếm cho trang Khám phá. */
function SearchFilters({
  filters,
  updateFilter,
  handleSearch,
  handleClear,
  suggestions,
  isSuggesting,
  showSuggestions,
  setShowSuggestions,
  handleSelectMovie,
}: SearchFiltersProps) {
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.year !== '' ||
    filters.country !== '' ||
    filters.sortBy !== 'popularity.desc';
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Chỉ focus sẵn ô tìm kiếm trên desktop; mobile tránh bật keyboard ngay khi mở trang.
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) {
      searchInputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full group" ref={containerRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSuggesting ? (
            <Loader2
              className="text-primary animate-spin"
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : (
            <Search
              className="text-text-secondary group-focus-within:text-primary transition-colors"
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </div>
        <input
          type="text"
          name="search-query"
          aria-label="Tìm kiếm phim hoặc series"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder="Nhập tên phim hoặc series…"
          value={filters.query}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onChange={(e) => updateFilter('query', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          className="w-full h-11 sm:h-12 bg-surface border border-border-default dark:border-white/5 rounded-card pl-11 sm:pl-12 pr-24 sm:pr-28 focus-visible:outline-none focus-visible:border-primary transition-colors shadow-premium ring-1 ring-black/5 dark:ring-white/5 text-sm sm:text-base md:text-lg text-text-primary placeholder-text-secondary/40"
          ref={searchInputRef}
        />

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            id="search-suggestions"
            role="listbox"
            aria-label="Gợi ý tìm kiếm"
            className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-card shadow-elevated z-50 overflow-hidden"
          >
            <div className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar">
              <div className="px-4 py-2 text-xs font-medium text-text-secondary border-b border-border-default dark:border-white/5 mb-1">
                Gợi ý tìm kiếm
              </div>
              {suggestions.map((movie) => {
                const title = getMainTitleForTMDB(movie);
                const year = (movie.release_date || movie.first_air_date)?.split('-')[0];
                const isTV =
                  movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);

                return (
                  <button
                    key={movie.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelectMovie(movie)}
                    aria-label={`Chọn phim ${title}`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group/item cursor-pointer"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-border-default dark:border-white/5">
                      <img
                        src={getTMDBImageUrl(movie.poster_path, 'w92')}
                        alt=""
                        width={80}
                        height={112}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-text-primary group-hover/item:text-primary transition-colors line-clamp-1">
                        {title}
                      </h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          {isTV ? (
                            <Tv
                              size={12}
                              className="text-info"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          ) : (
                            <Film
                              size={12}
                              className="text-success"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          )}
                          <span>{isTV ? 'Series' : 'Phim lẻ'}</span>
                        </div>
                        {year && (
                          <div className="flex items-center gap-1 text-xs text-text-secondary">
                            <Calendar size={12} strokeWidth={1.5} aria-hidden="true" />
                            <span>{year}</span>
                          </div>
                        )}
                        {(movie.vote_average ?? 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-warning font-bold">
                            <Star
                              size={12}
                              fill="currentColor"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            <span>{(movie.vote_average ?? 0).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={handleSearch}
                className="w-full py-3 px-4 mt-1 border-t border-border text-primary text-xs font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={14} strokeWidth={1.5} aria-hidden="true" />
                Xem tất cả kết quả cho “{filters.query}”
              </button>
            </div>
          </div>
        )}

        <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              aria-label="Xóa nội dung tìm kiếm"
              className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-text-secondary transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={handleSearch}
            aria-label="Tìm kiếm phim"
            className="bg-primary text-white px-4 py-2 sm:px-5 sm:py-2 rounded-control hover:bg-primary/90 transition-colors text-sm font-bold shadow-lg shadow-primary/20 cursor-pointer"
          >
            Tìm
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-border-default dark:border-white/5 rounded-card px-3 h-11">
          <Filter size={16} className="text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-xs font-bold text-text-secondary">Lọc theo</span>
        </div>

        <Dropdown
          options={[
            { value: 'all', label: 'Tất cả loại' },
            { value: 'movie', label: 'Phim lẻ' },
            { value: 'tv', label: 'Series' },
          ]}
          value={filters.type}
          onChange={(value) => updateFilter('type', value as SearchFormFilters['type'])}
          placeholder="Chọn loại…"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
        />

        <Dropdown
          options={[
            { value: '', label: 'Tất cả năm' },
            ...Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return { value: String(year), label: String(year) };
            }),
          ]}
          value={filters.year}
          onChange={(value) => updateFilter('year', value as string)}
          placeholder="Chọn năm…"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
          searchable={true}
        />

        <Dropdown
          options={TMDB_COUNTRY_OPTIONS}
          value={filters.country}
          onChange={(value) => updateFilter('country', value as string)}
          placeholder="Quốc gia…"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
          searchable={true}
        />

        <Dropdown
          options={[
            { value: 'popularity.desc', label: 'Phổ biến' },
            { value: 'vote_average.desc', label: 'Đánh giá cao' },
            { value: 'primary_release_date.desc', label: 'Mới nhất' },
            { value: 'primary_release_date.asc', label: 'Cũ nhất' },
            { value: 'title.asc', label: 'Tên A-Z' },
            { value: 'title.desc', label: 'Tên Z-A' },
          ]}
          value={filters.sortBy}
          onChange={(value) => updateFilter('sortBy', value as SearchSortBy)}
          placeholder="Phù hợp…"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
        />

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            aria-label="Đặt lại toàn bộ bộ lọc"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-11 rounded-card bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-bold text-text-secondary cursor-pointer border border-transparent hover:border-border"
          >
            <RotateCcw size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFilters;
