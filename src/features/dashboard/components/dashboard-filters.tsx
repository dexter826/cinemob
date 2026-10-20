import React, { useEffect, useState } from 'react';
import { X, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import LazyDialog from '@/shared/components/ui/lazy-dialog';
import SearchField from '@/shared/components/ui/search-field';
import { classNames } from '@/shared/utils/class-names';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import {
  type ActiveTab,
  type FilterState,
  type FilterUpdateFn,
} from '../hooks/use-dashboard-filters';
import { FilterControls, formatRatingRange } from './dashboard-filter-controls';
import type { DashboardFilterSheetProps } from './dashboard-filter-sheet';

interface DashboardFiltersProps {
  filters: FilterState;
  updateFilter: FilterUpdateFn;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  toggleSortOrder: () => void;
  activeTab: ActiveTab;
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  availableGenres: { value: string; label: string }[];
  clearFilters: () => void;
}

interface ActiveFilterChip {
  key: string;
  label: string;
  clear: () => void;
}

const DESKTOP_QUERY = '(min-width: 1024px)';
const loadFilterSheet = () => import('./dashboard-filter-sheet');

function CapsButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={classNames(
        'group relative h-10 px-2.5 inline-flex items-center text-label-caps font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer',
        active ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={classNames(
          'pointer-events-none absolute inset-x-2 bottom-0 h-0.5 bg-primary transition-opacity duration-200',
          active
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-100',
        )}
      />
    </button>
  );
}

function DashboardFilters({
  filters,
  updateFilter,
  showFilters,
  setShowFilters,
  filterRef,
  toggleRef,
  toggleSortOrder,
  activeTab,
  availableYears,
  availableCountries,
  availableGenres,
  clearFilters,
}: DashboardFiltersProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Đổi breakpoint thì đóng bề mặt đang mở để tránh trạng thái mở "mồ côi".
  useEffect(() => {
    if (isDesktop) setSheetOpen(false);
    else setShowFilters(false);
  }, [isDesktop, setShowFilters]);

  // Escape đóng popover desktop (bỏ qua khi listbox con đã xử lý sự kiện).
  useEffect(() => {
    if (!isDesktop || !showFilters) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setShowFilters(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, showFilters, setShowFilters]);

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
      label: `Trạng thái: ${
        filters.watchStatus === 'watching' ? 'Đang theo dõi' : 'Đã hoàn thành'
      }`,
      clear: () => updateFilter('watchStatus', 'all'),
    });
  }
  if (filters.sourceType !== 'all') {
    chipItems.push({
      key: 'sourceType',
      label: `Nguồn: ${filters.sourceType === 'normal' ? 'Xem trực tiếp' : 'Xem qua review'}`,
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

  const filtersOpen = isDesktop ? showFilters : sheetOpen;
  const toggleLabel = filtersOpen
    ? 'Đóng bộ lọc nâng cao'
    : chipItems.length > 0
      ? `Mở bộ lọc nâng cao (${chipItems.length} điều kiện đang bật)`
      : 'Mở bộ lọc nâng cao';

  const handleToggle = () => {
    if (isDesktop) setShowFilters(!showFilters);
    else setSheetOpen((open) => !open);
  };

  return (
    <div ref={filterRef} className="relative flex flex-col items-end gap-2.5 w-full lg:w-auto">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 w-full lg:w-auto lg:flex-nowrap justify-end">
        <SearchField
          variant="underline"
          name="library-search"
          value={filters.searchQuery}
          onChange={(next) => updateFilter('searchQuery', next)}
          placeholder="Tìm kiếm phim…"
          label="Lọc phim trong thư viện"
          className="flex-1 lg:flex-none lg:w-72 min-w-0"
        />

        <span aria-hidden="true" className="hidden lg:block w-px h-5 bg-border-default" />

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 w-full lg:w-auto max-lg:order-last">
          <div role="group" aria-label="Sắp xếp" className="flex items-center">
            <CapsButton
              active={filters.sortBy === 'date'}
              onClick={() => updateFilter('sortBy', 'date')}
            >
              Ngày
            </CapsButton>
            <CapsButton
              active={filters.sortBy === 'title'}
              onClick={() => updateFilter('sortBy', 'title')}
            >
              Tên
            </CapsButton>
            <button
              type="button"
              onClick={toggleSortOrder}
              title={filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              aria-label={
                filters.sortOrder === 'asc'
                  ? 'Đang sắp xếp tăng dần, bấm để đổi chiều'
                  : 'Đang sắp xếp giảm dần, bấm để đổi chiều'
              }
              className="ml-0.5 inline-flex items-center justify-center w-10 h-10 rounded-control text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {filters.sortOrder === 'asc' ? (
                <ArrowUp size={15} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <ArrowDown size={15} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>

          <span aria-hidden="true" className="hidden sm:block w-px h-5 bg-border-default" />

          <div role="group" aria-label="Loại nội dung" className="flex items-center">
            <CapsButton
              active={filters.contentType === 'all'}
              onClick={() => updateFilter('contentType', 'all')}
            >
              Tất cả
            </CapsButton>
            <CapsButton
              active={filters.contentType === 'movie'}
              onClick={() => updateFilter('contentType', 'movie')}
            >
              Phim lẻ
            </CapsButton>
            <CapsButton
              active={filters.contentType === 'tv'}
              onClick={() => updateFilter('contentType', 'tv')}
            >
              Series
            </CapsButton>
          </div>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          aria-expanded={filtersOpen}
          aria-label={toggleLabel}
          className={classNames(
            'group relative w-11 h-12 shrink-0 flex items-center justify-center transition-colors duration-200 cursor-pointer',
            filtersOpen ? 'text-primary' : 'text-text-secondary hover:text-primary',
          )}
        >
          {filtersOpen ? (
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Filter size={18} strokeWidth={1.5} aria-hidden="true" />
          )}
          {!filtersOpen && chipItems.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-0.5 min-w-[15px] h-[15px] px-0.5 inline-flex items-center justify-center rounded-[4px] bg-primary text-on-primary text-micro-caps font-bold leading-none tabular-nums"
            >
              {chipItems.length}
            </span>
          )}
          <span
            aria-hidden="true"
            className={classNames(
              'pointer-events-none absolute inset-x-0 bottom-[-1px] h-0.5 bg-primary transition-opacity duration-200',
              filtersOpen
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-100',
            )}
          />
        </button>
      </div>

      {chipItems.length > 0 && (
        <div
          role="group"
          aria-label="Bộ lọc đang áp dụng"
          className="flex flex-wrap items-center justify-end gap-1.5 w-full"
        >
          {chipItems.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              aria-label={`Gỡ lọc ${chip.label}`}
              className="group inline-flex items-center gap-1 px-2 py-1.5 rounded-poster border border-border-default text-micro-caps font-bold uppercase tracking-[0.06em] text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors cursor-pointer whitespace-nowrap"
            >
              {chip.label}
              <X
                size={10}
                strokeWidth={2}
                aria-hidden="true"
                className="text-text-muted group-hover:text-primary"
              />
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="px-2 py-1.5 text-micro-caps font-bold uppercase tracking-[0.06em] text-primary hover:underline cursor-pointer whitespace-nowrap"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {showFilters && isDesktop && (
        <div
          role="dialog"
          aria-label="Bộ lọc"
          className="absolute top-full right-0 mt-2 z-50 bg-surface-elevated p-5 rounded-dialog border border-border flex flex-col gap-5 w-80 max-w-[calc(100vw-2rem)] max-h-[70dvh] overflow-y-auto overscroll-contain"
        >
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-semibold text-text-secondary">Bộ lọc</span>
            {chipItems.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-body-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>
          <FilterControls
            filters={filters}
            updateFilter={updateFilter}
            activeTab={activeTab}
            availableYears={availableYears}
            availableCountries={availableCountries}
            availableGenres={availableGenres}
          />
        </div>
      )}

      <LazyDialog<DashboardFilterSheetProps>
        open={!isDesktop && sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Bộ lọc"
        presentation="sheet"
        loader={loadFilterSheet}
        componentProps={{
          isOpen: !isDesktop && sheetOpen,
          filters,
          updateFilter,
          activeTab,
          availableYears,
          availableCountries,
          availableGenres,
          hasHiddenFilters: chipItems.length > 0,
          clearFilters,
          onClose: () => setSheetOpen(false),
        }}
      />
    </div>
  );
}

export default DashboardFilters;
