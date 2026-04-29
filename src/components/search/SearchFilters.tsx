import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';

interface SearchFiltersProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
  handleClear: () => void;
  filterType: 'all' | 'movie' | 'tv';
  setFilterType: (type: 'all' | 'movie' | 'tv') => void;
  filterYear: string;
  setFilterYear: (year: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  query,
  setQuery,
  handleSearch,
  handleClear,
  filterType,
  setFilterType,
  filterYear,
  setFilterYear,
  sortBy,
  setSortBy
}) => {
  const isSearchMode = query.trim().length > 2;
  const hasActiveFilters = filterType !== 'all' || filterYear || (!isSearchMode && sortBy !== 'popularity.desc');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input
          type="text"
          placeholder="Nhập tên phim ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-32 focus:outline-none focus:border-primary/50 transition-all shadow-sm text-lg"
          autoFocus
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-text-muted transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
          >
            Tìm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-muted">Lọc theo:</span>
        </div>

          <CustomDropdown
            options={[
              { value: 'all', label: 'Tất cả loại' },
              { value: 'movie', label: 'Phim lẻ' },
              { value: 'tv', label: 'TV Series' },
            ]}
            value={filterType}
            onChange={(value) => setFilterType(value as any)}
            placeholder="Chọn loại"
            className="flex-1 sm:flex-none"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'Tất cả năm' },
              ...Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return { value: String(year), label: String(year) };
              }),
            ]}
            value={filterYear}
            onChange={(value) => setFilterYear(value as string)}
            placeholder="Chọn năm"
            className="flex-1 sm:flex-none min-w-[120px]"
            searchable={true}
          />

          {!isSearchMode && (
            <CustomDropdown
              options={[
                { value: 'popularity.desc', label: 'Phổ biến nhất' },
                { value: 'vote_average.desc', label: 'Đánh giá cao' },
                { value: 'primary_release_date.desc', label: 'Mới nhất' },
                { value: 'primary_release_date.asc', label: 'Cũ nhất' },
                { value: 'title.asc', label: 'Tên A-Z' },
                { value: 'title.desc', label: 'Tên Z-A' },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as string)}
              placeholder="Sắp xếp"
              className="flex-1 sm:flex-none min-w-[140px]"
            />
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    );
};


export default SearchFilters;
