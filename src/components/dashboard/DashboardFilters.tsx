import React from 'react';
import { Search, X, Filter, Calendar, Type, ArrowUp, ArrowDown, Star } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import { SortOption, SortOrder } from '../../hooks/useDashboardFilters';

interface DashboardFiltersProps {
  filters: {
    sortBy: SortOption;
    sortOrder: SortOrder;
    searchQuery: string;
    rating: number | null;
    year: number | null;
    country: string;
    contentType: 'all' | 'movie' | 'tv';
    watchStatus: 'all' | 'watching' | 'completed';
  };
  updateFilter: (key: any, value: any) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  toggleSortOrder: () => void;
  activeTab: 'history' | 'watchlist';
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  clearFilters: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  updateFilter,
  showFilters,
  setShowFilters,
  filterRef,
  toggleSortOrder,
  activeTab,
  availableYears,
  availableCountries,
  clearFilters
}) => {
  const hasActiveFilters = filters.rating !== null || filters.year !== null || filters.country || filters.contentType !== 'all' || filters.watchStatus !== 'all';

  return (
    <div className="flex flex-col items-end gap-3 relative">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={15} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Lọc phim..."
            className="w-full sm:w-64 bg-surface border-border-default border rounded-xl py-2 pl-9 pr-8 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-premium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
          className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer shadow-premium ${
            showFilters 
              ? 'bg-primary/10 border-primary/30 text-primary' 
              : 'bg-surface border-border-default text-text-muted hover:text-text-main hover:border-primary/30'
          }`}
        >
          {showFilters ? <X size={18} /> : <Filter size={18} />}
        </button>
      </div>

      {showFilters && (
        <div ref={filterRef as any} className="absolute top-full right-0 mt-2 z-50 bg-surface/95 backdrop-blur-2xl p-5 rounded-2xl border border-border-default shadow-2xl flex flex-col gap-5 min-w-[300px] animate-fade-in">
          
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Sắp xếp</div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('sortBy', 'date')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filters.sortBy === 'date' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <Calendar size={13} />
                <span>Ngày</span>
              </button>
              <button
                onClick={() => updateFilter('sortBy', 'title')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filters.sortBy === 'title' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <Type size={13} />
                <span>Tên</span>
              </button>
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-center p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent text-text-muted hover:text-text-main hover:bg-black/10 transition-all cursor-pointer"
                title={filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {filters.sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </div>
          </div>

          <div className="h-px bg-border-default" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Bộ lọc</div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block opacity-60">Loại nội dung</label>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'Tất cả nội dung' },
                    { value: 'movie', label: 'Phim điện ảnh' },
                    { value: 'tv', label: 'TV Series' },
                  ]}
                  value={filters.contentType}
                  onChange={(value) => updateFilter('contentType', value as any)}
                  placeholder="Chọn loại"
                />
              </div>

              {activeTab === 'history' && (
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block opacity-60">Trạng thái</label>
                  <CustomDropdown
                    options={[
                      { value: 'all', label: 'Tất cả trạng thái' },
                      { value: 'watching', label: 'Đang theo dõi' },
                      { value: 'completed', label: 'Đã hoàn thành' },
                    ]}
                    value={filters.watchStatus}
                    onChange={(value) => updateFilter('watchStatus', value as any)}
                    placeholder="Chọn trạng thái"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block opacity-60">Đánh giá tối thiểu</label>
                <div className="flex gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 rounded-xl border border-border-default">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateFilter('rating', filters.rating === star ? null : star)}
                      className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                        (filters.rating || 0) >= star ? 'text-warning bg-warning/10 shadow-sm' : 'text-text-muted/40 hover:text-text-muted hover:bg-black/5'
                      }`}
                    >
                      <Star size={15} fill={(filters.rating || 0) >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block opacity-60">Năm xem</label>
                  <CustomDropdown
                    options={[{ value: '', label: 'Tất cả năm' }, ...availableYears]}
                    value={filters.year || ''}
                    onChange={(value) => updateFilter('year', value === '' ? null : Number(value))}
                    placeholder="Chọn năm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block opacity-60">Quốc gia</label>
                  <CustomDropdown
                    options={[{ value: '', label: 'Tất cả quốc gia' }, ...availableCountries]}
                    value={filters.country}
                    onChange={(value) => updateFilter('country', value as string)}
                    placeholder="Chọn quốc gia"
                    searchable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
