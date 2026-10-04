import React from 'react';
import { Search, X, Filter, Calendar, Type, ArrowUp, ArrowDown, Star } from 'lucide-react';
import Dropdown from '@/shared/components/ui/Dropdown';
import {
  SortOption,
  SortOrder,
  SourceType,
  type FilterUpdateFn,
} from '../hooks/useDashboardFilters';

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
  updateFilter: FilterUpdateFn;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  toggleSortOrder: () => void;
  activeTab: 'history' | 'watchlist';
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  clearFilters: () => void;
}

function DashboardFilters({
  filters,
  updateFilter,
  showFilters,
  setShowFilters,
  filterRef,
  toggleSortOrder,
  activeTab,
  availableYears,
  availableCountries,
  clearFilters,
}: DashboardFiltersProps) {
  const hasActiveFilters =
    filters.ratingRange !== null ||
    filters.year !== null ||
    filters.country ||
    filters.contentType !== 'all' ||
    filters.watchStatus !== 'all' ||
    filters.sourceType !== 'all';

  const handleRatingSelect = (star: number) => {
    if (!filters.ratingRange) {
      updateFilter('ratingRange', [star, star]);
      return;
    }
    const [currMin, currMax] = filters.ratingRange;
    if (star === currMin && star === currMax) updateFilter('ratingRange', null);
    else if (star < currMin) updateFilter('ratingRange', [star, currMax]);
    else if (star > currMax) updateFilter('ratingRange', [currMin, star]);
    else updateFilter('ratingRange', [star, star]);
  };

  return (
    <div className="flex flex-col items-end gap-3 relative">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            type="text"
            name="library-search"
            autoComplete="off"
            spellCheck={false}
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Lọc phim…"
            aria-label="Lọc phim trong thư viện"
            className="w-full sm:w-64 h-11 bg-surface border border-border-default dark:border-white/5 rounded-card pl-10 pr-8 text-sm text-text-primary placeholder-text-secondary/40 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-colors shadow-premium ring-1 ring-black/5 dark:ring-white/5"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              aria-label="Xóa từ khóa lọc"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-1"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFilters(!showFilters);
          }}
          aria-label={showFilters ? 'Đóng bộ lọc nâng cao' : 'Mở bộ lọc nâng cao'}
          className={`w-11 h-11 flex items-center justify-center rounded-card border transition-colors duration-200 cursor-pointer ${
            showFilters
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-surface border-border-default dark:border-white/5 text-text-secondary hover:text-text-primary hover:border-primary/40 dark:hover:border-white/10'
          }`}
        >
          {showFilters ? (
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Filter size={18} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>

      {showFilters && (
        <div
          ref={filterRef}
          className="absolute top-full right-0 mt-2 z-50 bg-surface-elevated p-5 rounded-dialog border border-border shadow-elevated flex flex-col gap-5 min-w-[320px]"
        >
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary">Sắp xếp</div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('sortBy', 'date')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-control text-xs font-bold transition-colors cursor-pointer border ${
                  filters.sortBy === 'date'
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Calendar size={13} strokeWidth={1.5} aria-hidden="true" />
                <span>Ngày</span>
              </button>
              <button
                onClick={() => updateFilter('sortBy', 'title')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-control text-xs font-bold transition-colors cursor-pointer border ${
                  filters.sortBy === 'title'
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Type size={13} strokeWidth={1.5} aria-hidden="true" />
                <span>Tên</span>
              </button>
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-center p-2.5 rounded-control bg-black/5 dark:bg-white/5 border border-transparent text-text-secondary hover:text-text-primary hover:bg-black/10 transition-colors cursor-pointer"
                title={filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                aria-label={filters.sortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
              >
                {filters.sortOrder === 'asc' ? (
                  <ArrowUp size={16} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-border-default" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-text-secondary">Bộ lọc</div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="df-content-type"
                  id="df-content-type-label"
                  className="text-xs font-medium text-text-secondary mb-2 block"
                >
                  Loại nội dung
                </label>
                <Dropdown
                  id="df-content-type"
                  aria-labelledby="df-content-type-label"
                  options={[
                    { value: 'all', label: 'Tất cả nội dung' },
                    { value: 'movie', label: 'Phim lẻ' },
                    { value: 'tv', label: 'Series' },
                  ]}
                  value={filters.contentType}
                  onChange={(value) => updateFilter('contentType', value as 'all' | 'movie' | 'tv')}
                  placeholder="Chọn loại…"
                />
              </div>

              {activeTab === 'history' && (
                <div>
                  <label
                    htmlFor="df-watch-status"
                    id="df-watch-status-label"
                    className="text-xs font-medium text-text-secondary mb-2 block"
                  >
                    Trạng thái
                  </label>
                  <Dropdown
                    id="df-watch-status"
                    aria-labelledby="df-watch-status-label"
                    options={[
                      { value: 'all', label: 'Tất cả trạng thái' },
                      { value: 'watching', label: 'Đang theo dõi' },
                      { value: 'completed', label: 'Đã hoàn thành' },
                    ]}
                    value={filters.watchStatus}
                    onChange={(value) =>
                      updateFilter('watchStatus', value as 'all' | 'watching' | 'completed')
                    }
                    placeholder="Chọn trạng thái…"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    id="df-rating-label"
                    className="text-xs font-medium text-text-secondary block"
                  >
                    Khoảng đánh giá
                  </span>
                  {filters.ratingRange && (
                    <span className="text-xs font-semibold text-primary tabular-nums">
                      {filters.ratingRange[0]} - {filters.ratingRange[1]} sao
                    </span>
                  )}
                </div>
                <div
                  role="group"
                  aria-labelledby="df-rating-label"
                  className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-control border border-border-default dark:border-white/5"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                    const [min, max] = filters.ratingRange || [0, 0];
                    const isActive = filters.ratingRange && star >= min && star <= max;
                    const isEdge = filters.ratingRange && (star === min || star === max);

                    return (
                      <button
                        key={star}
                        onClick={() => handleRatingSelect(star)}
                        aria-label={`Chọn ${star} sao`}
                        aria-pressed={Boolean(isActive)}
                        className={`flex-1 flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer  ${
                          isActive
                            ? 'text-warning bg-warning/15 shadow-sm'
                            : 'text-text-secondary/40 hover:text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                        } ${isEdge ? 'ring-1 ring-warning/30' : ''}`}
                      >
                        <Star
                          size={14}
                          fill={isActive ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-text-secondary mt-2 opacity-60 text-center">
                  Nhấn hai điểm khác nhau để chọn khoảng
                </p>
              </div>

              <div>
                <label
                  htmlFor="df-source-type"
                  id="df-source-type-label"
                  className="text-xs font-medium text-text-secondary mb-2 block"
                >
                  Nguồn nội dung
                </label>
                <Dropdown
                  id="df-source-type"
                  aria-labelledby="df-source-type-label"
                  options={[
                    { value: 'all', label: 'Tất cả nguồn' },
                    { value: 'normal', label: 'Xem trực tiếp' },
                    { value: 'review', label: 'Xem qua review' },
                  ]}
                  value={filters.sourceType}
                  onChange={(value) => updateFilter('sourceType', value as SourceType)}
                  placeholder="Chọn nguồn…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label
                    htmlFor="df-year"
                    id="df-year-label"
                    className="text-xs font-medium text-text-secondary block"
                  >
                    Năm xem
                  </label>
                  <Dropdown
                    id="df-year"
                    aria-labelledby="df-year-label"
                    options={[{ value: '', label: 'Tất cả năm' }, ...availableYears]}
                    value={filters.year || ''}
                    onChange={(value) => updateFilter('year', value === '' ? null : Number(value))}
                    placeholder="Chọn năm…"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="df-country"
                    id="df-country-label"
                    className="text-xs font-medium text-text-secondary block"
                  >
                    Quốc gia
                  </label>
                  <Dropdown
                    id="df-country"
                    aria-labelledby="df-country-label"
                    options={[{ value: '', label: 'Tất cả quốc gia' }, ...availableCountries]}
                    value={filters.country}
                    onChange={(value) => updateFilter('country', value as string)}
                    placeholder="Chọn quốc gia…"
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
}

export default DashboardFilters;
