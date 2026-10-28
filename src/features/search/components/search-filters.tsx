import Spinner from '@/shared/components/ui/spinner';
import LoadingStatus from '@/shared/components/ui/loading-status';
import SearchField from '@/shared/components/ui/search-field';
import { useRef, useEffect } from 'react';
import { Search, FilterX, Star, Calendar, Film, Tv } from 'lucide-react';
import Dropdown from '@/shared/components/ui/dropdown';
import { TMDB_COUNTRY_OPTIONS } from '@/constants';
import { TMDBMovieResult } from '@/types';
import { getTMDBImageUrl, getMainTitleForTMDB } from '@/shared/utils/tmdb';
import type { SearchSortBy, SearchFormFilters } from '../hooks/use-search';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';

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
  isSearchMode: boolean;
}

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
  isSearchMode,
}: SearchFiltersProps) {
  // TMDB search chỉ nhận từ khoá/năm/loại — quốc gia và sắp xếp chỉ có tác dụng khi duyệt.
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.year !== '' ||
    (!isSearchMode && (filters.country !== '' || filters.sortBy !== 'popularity.desc'));
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const panelMotion = getPanelMotion(reducedMotion);

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
      <LoadingStatus>
        {isSuggesting ? 'Đang tìm gợi ý…' : showSuggestions ? `${suggestions.length} gợi ý.` : ''}
      </LoadingStatus>
      <div className="relative w-full" ref={containerRef}>
        <SearchField
          ref={searchInputRef}
          variant="underline"
          name="search-query"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder="Tìm kiếm phim hoặc series…"
          label="Tìm kiếm phim hoặc series"
          leadingIcon={isSuggesting ? <Spinner size={16} /> : undefined}
          value={filters.query}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onChange={(next) => updateFilter('query', next)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          inputClassName="pr-24 sm:pr-28"
          endSlot={
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Tìm kiếm phim"
              className="bg-primary text-on-primary px-4 py-2 sm:px-5 sm:py-2 rounded-control hover:bg-primary/90 transition-colors text-body font-bold cursor-pointer"
            >
              Tìm
            </button>
          }
        />

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              id="search-suggestions"
              role="listbox"
              aria-label="Gợi ý tìm kiếm"
              {...panelMotion}
              className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-card z-50 overflow-hidden"
            >
              <div className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar">
                <div className="px-4 py-2 text-label-caps font-medium text-text-secondary border-b border-border-default dark:border-white/5 mb-1">
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
                      <div className="w-10 h-14 rounded-poster overflow-hidden bg-black/5 shrink-0 border border-border-default dark:border-white/5">
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
                        <h4 className="font-bold text-body text-text-primary group-hover/item:text-primary transition-colors line-clamp-1">
                          {title}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1 text-body-sm text-text-secondary">
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
                            <div className="flex items-center gap-1 text-body-sm text-text-secondary">
                              <Calendar size={12} strokeWidth={1.5} aria-hidden="true" />
                              <span>{year}</span>
                            </div>
                          )}
                          {(movie.vote_average ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-body-sm text-warning font-bold">
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
                  className="w-full py-3 px-4 mt-1 border-t border-border text-primary text-body-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search size={14} strokeWidth={1.5} aria-hidden="true" />
                  Xem tất cả kết quả cho “{filters.query}”
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        <Dropdown
          options={[
            { value: 'all', label: 'Tất cả loại' },
            { value: 'movie', label: 'Phim lẻ' },
            { value: 'tv', label: 'Series' },
          ]}
          value={filters.type}
          onChange={(value) => updateFilter('type', value as SearchFormFilters['type'])}
          placeholder="Chọn loại…"
          className="w-full"
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
          className="w-full"
          searchable={true}
        />

        {!isSearchMode && (
          <Dropdown
            options={TMDB_COUNTRY_OPTIONS}
            value={filters.country}
            onChange={(value) => updateFilter('country', value as string)}
            placeholder="Chọn quốc gia…"
            className="w-full"
            searchable={true}
          />
        )}

        {!isSearchMode && (
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
            placeholder="Sắp xếp theo…"
            className="w-full"
          />
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            aria-label="Đặt lại toàn bộ bộ lọc"
            className="flex items-center justify-center gap-2 px-3 sm:px-4 h-11 rounded-control hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-body-sm font-bold text-text-secondary cursor-pointer border border-border"
          >
            <FilterX size={14} strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchFilters;
