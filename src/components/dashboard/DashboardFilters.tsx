import React from 'react';
import { Search, X, Filter, Calendar, Type, ArrowUp, ArrowDown, Star } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import { SortOption, SortOrder } from '../../hooks/useDashboardFilters';

interface DashboardFiltersProps {
  filters: {
    sortBy: SortOption;
    sortOrder: SortOrder;
    searchQuery: string;
    ratingRange: [number, number] | null;
    year: number | null;
    country: string;
    contentType: 'all' | 'movie' | 'tv';
    watchStatus: 'all' | 'watching' | 'completed';
    sourceType: 'all' | 'normal' | 'review';
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
  const hasActiveFilters = filters.ratingRange !== null || filters.year !== null || filters.country || filters.contentType !== 'all' || filters.watchStatus !== 'all' || filters.sourceType !== 'all';

  return (
    <div className="flex flex-col items-end gap-3 relative">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} strokeWidth={1.5} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Lọc phim..."
            className="w-full sm:w-64 h-11 bg-surface border border-border-default dark:border-white/5 rounded-2xl pl-10 pr-8 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-premium ring-1 ring-black/5 dark:ring-white/5"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer active:scale-90"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
          className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer shadow-premium active:scale-95 ${
            showFilters 
              ? 'bg-primary/15 border-primary/40 text-primary' 
              : 'bg-surface border-border-default dark:border-white/5 text-text-muted hover:text-text-main hover:border-primary/40 dark:hover:border-white/10'
          }`}
        >
          {showFilters ? <X size={18} strokeWidth={1.5} /> : <Filter size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {showFilters && (
        <div ref={filterRef as any} className="absolute top-full right-0 mt-2 z-50 bg-surface/90 backdrop-blur-3xl p-5 rounded-3xl border border-border-default dark:border-white/5 shadow-2xl flex flex-col gap-5 min-w-[320px] animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
          
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Sắp xếp</div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('sortBy', 'date')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-[0.98] ${
                  filters.sortBy === 'date' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <Calendar size={13} strokeWidth={1.5} />
                <span>Ngày</span>
              </button>
              <button
                onClick={() => updateFilter('sortBy', 'title')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-[0.98] ${
                  filters.sortBy === 'title' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <Type size={13} strokeWidth={1.5} />
                <span>Tên</span>
              </button>
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-center p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent text-text-muted hover:text-text-main hover:bg-black/10 transition-all cursor-pointer active:scale-90"
                title={filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {filters.sortOrder === 'asc' ? <ArrowUp size={16} strokeWidth={1.5} /> : <ArrowDown size={16} strokeWidth={1.5} />}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block opacity-60">
                    Khoảng đánh giá
                  </label>
                  {filters.ratingRange && (
                    <span className="text-[10px] font-bold text-primary">
                      {filters.ratingRange[0]} - {filters.ratingRange[1]} sao
                    </span>
                  )}
                </div>
                <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-xl border border-border-default dark:border-white/5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                    const [min, max] = filters.ratingRange || [0, 0];
                    const isActive = filters.ratingRange && star >= min && star <= max;
                    const isEdge = filters.ratingRange && (star === min || star === max);

                    return (
                      <button
                        key={star}
                        onClick={() => {
                          if (!filters.ratingRange) {
                            updateFilter('ratingRange', [star, star]);
                          } else {
                            const [currMin, currMax] = filters.ratingRange;
                            if (star === currMin && star === currMax) {
                              updateFilter('ratingRange', null);
                            } else if (star < currMin) {
                              updateFilter('ratingRange', [star, currMax]);
                            } else if (star > currMax) {
                              updateFilter('ratingRange', [currMin, star]);
                            } else {
                              updateFilter('ratingRange', [star, star]);
                            }
                          }
                        }}
                        className={`flex-1 flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 ${
                          isActive 
                            ? 'text-warning bg-warning/15 shadow-sm' 
                            : 'text-text-muted/40 hover:text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
                        } ${isEdge ? 'ring-1 ring-warning/30' : ''}`}
                      >
                        <Star size={14} fill={isActive ? "currentColor" : "none"} strokeWidth={1.5} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-text-muted mt-2 opacity-50 text-center">
                  Nhấn hai điểm khác nhau để chọn khoảng
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block opacity-60">Nguồn nội dung</label>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'Tất cả nguồn' },
                    { value: 'normal', label: 'Xem trực tiếp' },
                    { value: 'review', label: 'Xem qua review' },
                  ]}
                  value={filters.sourceType}
                  onChange={(value) => updateFilter('sourceType', value as any)}
                  placeholder="Chọn nguồn"
                />
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
