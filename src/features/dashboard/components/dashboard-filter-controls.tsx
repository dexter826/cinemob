import React from 'react';
import { Star } from 'lucide-react';
import Dropdown from '@/shared/components/ui/dropdown';
import { classNames } from '@/shared/utils/class-names';
import {
  type ActiveTab,
  type FilterState,
  type FilterUpdateFn,
  type SourceType,
} from '../hooks/use-dashboard-filters';

export interface FilterControlsProps {
  filters: FilterState;
  updateFilter: FilterUpdateFn;
  activeTab: ActiveTab;
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  availableGenres: { value: string; label: string }[];
}

const RATING_STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Nhãn khoảng đánh giá dùng chung: đầy đủ cho panel, rút gọn cho chip. */
export function formatRatingRange(
  ratingRange: [number, number] | null,
  variant: 'full' | 'compact' = 'full',
): string | null {
  if (!ratingRange) return null;
  const [min, max] = ratingRange;
  const isFull = variant === 'full';
  if (min === max) return isFull ? `Đúng ${min}★` : `${min}★`;
  if (max === 10) return isFull ? `Từ ${min}★ trở lên` : `Từ ${min}★`;
  return isFull ? `${min}★–${max}★` : `${min}–${max}★`;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
      {children}
    </div>
  );
}

/** Nội dung bộ lọc dùng chung cho popover (desktop) và bottom sheet (mobile). */
export function FilterControls({
  filters,
  updateFilter,
  activeTab,
  availableYears,
  availableCountries,
  availableGenres,
}: FilterControlsProps) {
  const ratingStatus = formatRatingRange(filters.ratingRange);

  const handleStarClick = (star: number) => {
    const [min, max] = filters.ratingRange ?? [0, 0];
    // Một chạm = lọc "từ mốc sao đó trở lên"; chạm lại đúng mốc đang bật để bỏ.
    const isThresholdClick = filters.ratingRange !== null && star === min && max === 10;
    updateFilter('ratingRange', isThresholdClick ? null : ([star, 10] as [number, number]));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <GroupLabel>Nội dung</GroupLabel>
        <Dropdown
          id="df-genre"
          aria-label="Thể loại"
          options={[{ value: '', label: 'Tất cả thể loại' }, ...availableGenres]}
          value={filters.genre}
          onChange={(value) => updateFilter('genre', value as string)}
          placeholder="Chọn thể loại…"
          searchable={true}
        />
        <Dropdown
          id="df-year"
          aria-label="Năm xem"
          options={[{ value: '', label: 'Tất cả năm' }, ...availableYears]}
          value={filters.year || ''}
          onChange={(value) => updateFilter('year', value === '' ? null : Number(value))}
          placeholder="Chọn năm…"
        />
        <Dropdown
          id="df-country"
          aria-label="Quốc gia"
          options={[{ value: '', label: 'Tất cả quốc gia' }, ...availableCountries]}
          value={filters.country}
          onChange={(value) => updateFilter('country', value as string)}
          placeholder="Chọn quốc gia…"
          searchable={true}
        />
      </div>

      <div className="h-px bg-border-default" />

      <div className="space-y-3">
        <GroupLabel>Lần xem</GroupLabel>
        {activeTab === 'history' && (
          <Dropdown
            id="df-watch-status"
            aria-label="Trạng thái"
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
        )}
        <Dropdown
          id="df-source-type"
          aria-label="Nguồn nội dung"
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

      <div className="h-px bg-border-default" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <GroupLabel>Đánh giá</GroupLabel>
          {ratingStatus && (
            <span className="text-xs font-semibold text-primary tabular-nums">{ratingStatus}</span>
          )}
        </div>
        <div
          role="group"
          aria-label="Mức đánh giá tối thiểu"
          className="flex gap-0.5 p-1.5 rounded-control border border-border-default dark:border-white/5"
        >
          {RATING_STARS.map((star) => {
            const [min, max] = filters.ratingRange ?? [0, 0];
            const isActive = filters.ratingRange !== null && star >= min && star <= max;
            const isThreshold = filters.ratingRange !== null && star === min;
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                aria-label={
                  star === 10 ? 'Lọc phim đúng 10 sao' : `Lọc phim từ ${star} sao trở lên`
                }
                aria-pressed={isActive}
                className={classNames(
                  'flex-1 min-w-0 flex items-center justify-center px-1 py-1.5 rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'text-warning bg-warning/15'
                    : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5',
                  isThreshold ? 'ring-1 ring-warning/30' : '',
                )}
              >
                <Star
                  size={14}
                  strokeWidth={1.5}
                  fill={isActive ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FilterControls;
