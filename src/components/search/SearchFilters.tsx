import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';

interface SearchFiltersProps {
  filters: {
    query: string;
    type: 'all' | 'movie' | 'tv';
    year: string;
    sortBy: string;
  };
  updateFilter: (key: any, value: any) => void;
  handleSearch: () => void;
  handleClear: () => void;
}

/** Bộ lọc và tìm kiếm cho trang Khám phá. */
const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  updateFilter,
  handleSearch,
  handleClear,
}) => {
  const isSearchMode = filters.query.trim().length > 2;
  const hasActiveFilters = filters.type !== 'all' || filters.year !== '' || (!isSearchMode && filters.sortBy !== 'popularity.desc');

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Nhập tên phim hoặc series..."
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          className="w-full bg-surface border-2 border-border-default rounded-2xl py-3 sm:py-3 pl-11 sm:pl-12 pr-24 sm:pr-28 focus:outline-none focus:border-primary/50 transition-all shadow-sm text-sm sm:text-base md:text-lg text-text-main placeholder-text-muted"
          autoFocus
        />

        <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-text-muted transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2 sm:px-5 sm:py-2 rounded-xl hover:bg-primary/90 transition-all text-sm sm:text-sm font-bold shadow-lg shadow-primary/20 active:scale-95"
          >
            Tìm
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-border-default rounded-xl px-3 py-2">
          <Filter size={16} className="text-text-muted" />
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Lọc theo</span>
        </div>

        <CustomDropdown
          options={[
            { value: 'all', label: 'Tất cả loại' },
            { value: 'movie', label: 'Phim lẻ' },
            { value: 'tv', label: 'TV Series' },
          ]}
          value={filters.type}
          onChange={(value) => updateFilter('type', value as any)}
          placeholder="Chọn loại"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
        />

        <CustomDropdown
          options={[
            { value: '', label: 'Tất cả năm' },
            ...Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return { value: String(year), label: String(year) };
            }),
          ]}
          value={filters.year}
          onChange={(value) => updateFilter('year', value as string)}
          placeholder="Chọn năm"
          className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
          searchable={true}
        />

        {!isSearchMode && (
          <CustomDropdown
            options={[
              { value: 'popularity.desc', label: 'Phổ biến' },
              { value: 'vote_average.desc', label: 'Đánh giá cao' },
              { value: 'primary_release_date.desc', label: 'Mới nhất' },
              { value: 'primary_release_date.asc', label: 'Cũ nhất' },
              { value: 'title.asc', label: 'Tên A-Z' },
              { value: 'title.desc', label: 'Tên Z-A' },
            ]}
            value={filters.sortBy}
            onChange={(value) => updateFilter('sortBy', value as string)}
            placeholder="Sắp xếp"
            className="flex-1 md:flex-none min-w-[140px] sm:min-w-40"
          />
        )}

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer border border-transparent hover:border-border-default"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
