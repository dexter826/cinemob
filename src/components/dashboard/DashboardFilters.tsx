import React from 'react';
import { Search, X, Filter, Calendar, Type, ArrowUp, ArrowDown, Star } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import { SortOption, SortOrder } from '../../hooks/useDashboard';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortOrder: SortOrder;
  toggleSortOrder: () => void;
  filterRating: number | null;
  setFilterRating: (rating: number | null) => void;
  filterYear: number | null;
  setFilterYear: (year: number | null) => void;
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  filterContentType: 'all' | 'movie' | 'tv';
  setFilterContentType: (type: 'all' | 'movie' | 'tv') => void;
  filterWatchStatus: 'all' | 'watching' | 'completed';
  setFilterWatchStatus: (status: 'all' | 'watching' | 'completed') => void;
  activeTab: 'history' | 'watchlist';
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  clearFilters: () => void;
}

/** Thanh tìm kiếm và bộ lọc nâng cao cho Dashboard. */
const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  filterRef,
  sortBy,
  setSortBy,
  sortOrder,
  toggleSortOrder,
  filterRating,
  setFilterRating,
  filterYear,
  setFilterYear,
  filterCountry,
  setFilterCountry,
  filterContentType,
  setFilterContentType,
  filterWatchStatus,
  setFilterWatchStatus,
  activeTab,
  availableYears,
  availableCountries,
  clearFilters
}) => {
  const hasActiveFilters = filterRating !== null || filterYear !== null || filterCountry || filterContentType !== 'all' || filterWatchStatus !== 'all';

  return (
    <div className="flex flex-col items-end gap-3 relative">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lọc phim..."
            className="w-full sm:w-64 bg-surface border-2 border-black/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-8 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
          className={`p-2 rounded-xl border-2 transition-colors cursor-pointer ${
            showFilters 
              ? 'bg-primary/10 border-primary/20 text-primary' 
              : 'bg-surface border-black/10 dark:border-white/10 text-text-muted hover:text-text-main hover:border-primary/30'
          }`}
        >
          {showFilters ? <X size={20} /> : <Filter size={20} />}
        </button>
      </div>

      {showFilters && (
        <div ref={filterRef as any} className="absolute top-full right-0 mt-2 z-50 bg-surface p-4 rounded-xl border border-black/5 dark:border-white/10 shadow-xl flex flex-col gap-4 min-w-[280px] animate-fade-in">
          
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sắp xếp</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('date')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  sortBy === 'date' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'
                }`}
              >
                <Calendar size={14} />
                <span>Ngày</span>
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  sortBy === 'title' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'
                }`}
              >
                <Type size={14} />
                <span>Tên</span>
              </button>
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-black/10 dark:bg-white/10" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lọc</div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Loại nội dung</label>
              <CustomDropdown
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'movie', label: 'Phim' },
                  { value: 'tv', label: 'TV Series' },
                ]}
                value={filterContentType}
                onChange={(value) => setFilterContentType(value as any)}
                placeholder="Chọn loại nội dung"
              />
            </div>

            {activeTab === 'history' && (
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Trạng thái xem</label>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'watching', label: 'Đang xem' },
                    { value: 'completed', label: 'Đã xem xong' },
                  ]}
                  value={filterWatchStatus}
                  onChange={(value) => setFilterWatchStatus(value as any)}
                  placeholder="Chọn trạng thái"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Đánh giá tối thiểu</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      (filterRating || 0) >= star ? 'text-yellow-500 bg-yellow-500/10' : 'text-text-muted bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <Star size={16} fill={(filterRating || 0) >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Năm xem</label>
              <CustomDropdown
                options={[{ value: '', label: 'Tất cả các năm' }, ...availableYears]}
                value={filterYear || ''}
                onChange={(value) => setFilterYear(value === '' ? null : Number(value))}
                placeholder="Chọn năm"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Quốc gia</label>
              <CustomDropdown
                options={[{ value: '', label: 'Tất cả quốc gia' }, ...availableCountries]}
                value={filterCountry}
                onChange={(value) => setFilterCountry(value as string)}
                placeholder="Chọn quốc gia"
                searchable={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
