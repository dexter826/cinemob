import { Chip, Button } from '@/shared/components/ui';
import {
  type ActiveTab,
  type FilterState,
  type FilterUpdateFn,
} from '../hooks/use-dashboard-filters';
import { formatRatingRange } from './dashboard-filter-controls';

export interface ActiveFilterChip {
  key: string;
  label: string;
  clear: () => void;
}

export function buildActiveFilterChips(
  filters: FilterState,
  activeTab: ActiveTab,
  updateFilter: FilterUpdateFn,
  availableGenres: { value: string; label: string }[],
  availableCountries: { value: string; label: string }[],
): ActiveFilterChip[] {
  const chipItems: ActiveFilterChip[] = [];

  if (filters.genre) {
    const genreLabel =
      availableGenres.find((option) => option.value === filters.genre)?.label ?? filters.genre;
    chipItems.push({
      key: 'genre',
      label: `Thể loại: ${genreLabel}`,
      clear: () => updateFilter('genre', ''),
    });
  }
  if (filters.year !== null) {
    chipItems.push({
      key: 'year',
      label: `Năm: ${filters.year}`,
      clear: () => updateFilter('year', null),
    });
  }
  if (filters.country) {
    const countryLabel =
      availableCountries.find((option) => option.value === filters.country)?.label ??
      filters.country;
    chipItems.push({
      key: 'country',
      label: `Quốc gia: ${countryLabel}`,
      clear: () => updateFilter('country', ''),
    });
  }
  if (activeTab === 'history' && filters.watchStatus !== 'all') {
    chipItems.push({
      key: 'watchStatus',
      label: `Trạng thái: ${filters.watchStatus === 'watching' ? 'Đang theo dõi' : 'Đã xem'}`,
      clear: () => updateFilter('watchStatus', 'all'),
    });
  }
  if (filters.sourceType !== 'all') {
    chipItems.push({
      key: 'sourceType',
      label: `Nguồn: ${filters.sourceType === 'normal' ? 'Xem trực tiếp' : 'Xem qua đánh giá'}`,
      clear: () => updateFilter('sourceType', 'all'),
    });
  }
  const ratingChipLabel = formatRatingRange(filters.ratingRange, 'compact');
  if (ratingChipLabel) {
    chipItems.push({
      key: 'rating',
      label: ratingChipLabel,
      clear: () => updateFilter('ratingRange', null),
    });
  }

  return chipItems;
}

interface DashboardActiveFiltersProps {
  filters: FilterState;
  updateFilter: FilterUpdateFn;
  activeTab: ActiveTab;
  availableGenres: { value: string; label: string }[];
  availableCountries: { value: string; label: string }[];
  clearFilters: () => void;
}

function DashboardActiveFilters({
  filters,
  updateFilter,
  activeTab,
  availableGenres,
  availableCountries,
  clearFilters,
}: DashboardActiveFiltersProps) {
  const chipItems = buildActiveFilterChips(
    filters,
    activeTab,
    updateFilter,
    availableGenres,
    availableCountries,
  );

  if (chipItems.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Bộ lọc đang áp dụng"
      className="flex flex-wrap items-center gap-1.5 py-2"
    >
      {chipItems.map((chip) => (
        <Chip
          key={chip.key}
          tone="muted"
          onRemove={chip.clear}
          removeAriaLabel={`Gỡ lọc ${chip.label}`}
        >
          {chip.label}
        </Chip>
      ))}
      <Button
        variant="link"
        size="sm"
        onClick={clearFilters}
        className="px-2 py-1 text-micro-caps font-bold whitespace-nowrap"
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}

export default DashboardActiveFilters;
