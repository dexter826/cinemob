import React, { useEffect, useState } from 'react';
import { X, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import LazyDialog from '@/shared/components/ui/lazy-dialog';
import SearchField from '@/shared/components/ui/search-field';
import { classNames } from '@/shared/utils/class-names';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import { type FilterState, type FilterUpdateFn } from '../hooks/use-dashboard-filters';
import { FilterControls } from './dashboard-filter-controls';
import { buildActiveFilterChips } from './dashboard-active-filters';
import type { DashboardFilterSheetProps } from './dashboard-filter-sheet';

interface DashboardSearchProps {
  filters: FilterState;
  updateFilter: FilterUpdateFn;
}

/** Hàng 1 (phải): tìm trong thư viện. */
export function DashboardSearch({ filters, updateFilter }: DashboardSearchProps) {
  return (
    <SearchField
      variant="underline"
      name="library-search"
      value={filters.searchQuery}
      onChange={(next) => updateFilter('searchQuery', next)}
      placeholder="Tìm trong thư viện của bạn…"
      label="Lọc phim trong thư viện"
      className="w-full md:flex-none md:w-72 min-w-0"
    />
  );
}

interface DashboardRefinementsProps {
  filters: FilterState;
  updateFilter: FilterUpdateFn;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  toggleSortOrder: () => void;
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  availableGenres: { value: string; label: string }[];
  clearFilters: () => void;
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
        'group relative h-10 px-2 sm:px-2.5 inline-flex items-center text-label-caps font-bold transition-colors cursor-pointer',
        active ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={classNames(
          'pointer-events-none absolute inset-x-1.5 sm:inset-x-2 bottom-[-1px] h-0.5 bg-primary transition-opacity duration-150',
          active
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-100',
        )}
      />
    </button>
  );
}

/** Hàng 2: loại nội dung, sắp xếp, nút bộ lọc và bề mặt bộ lọc (popover/sheet). */
export function DashboardRefinements({
  filters,
  updateFilter,
  showFilters,
  setShowFilters,
  filterRef,
  toggleRef,
  toggleSortOrder,
  availableYears,
  availableCountries,
  availableGenres,
  clearFilters,
}: DashboardRefinementsProps) {
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

  const chipItems = buildActiveFilterChips(
    filters,
    updateFilter,
    availableGenres,
    availableCountries,
  );

  const filtersOpen = isDesktop ? showFilters : sheetOpen;
  const toggleLabel = filtersOpen
    ? 'Đóng bảng lọc phim'
    : chipItems.length > 0
      ? `Mở bảng lọc phim (${chipItems.length} điều kiện đang bật)`
      : 'Mở bảng lọc phim';

  const handleToggle = () => {
    if (isDesktop) setShowFilters(!showFilters);
    else setSheetOpen((open) => !open);
  };

  return (
    <div
      ref={filterRef}
      className="relative flex items-center justify-between lg:justify-end gap-x-1 sm:gap-x-2 lg:gap-x-3 w-full lg:w-auto"
    >
      <div role="group" aria-label="Loại nội dung" className="flex items-center shrink-0">
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
          Movie
        </CapsButton>
        <CapsButton
          active={filters.contentType === 'tv'}
          onClick={() => updateFilter('contentType', 'tv')}
        >
          Series
        </CapsButton>
      </div>

      <span aria-hidden="true" className="hidden lg:block w-px h-5 bg-border-default" />

      <div role="group" aria-label="Sắp xếp" className="flex items-center shrink-0">
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
          className="ml-0.5 inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-control text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {filters.sortOrder === 'asc' ? (
            <ArrowUp size={15} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <ArrowDown size={15} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
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
          'group relative w-11 h-10 shrink-0 flex items-center justify-center transition-colors duration-150 cursor-pointer border-b border-border lg:border-b-0',
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
            className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 inline-flex items-center justify-center rounded-poster bg-primary text-on-primary text-micro-caps font-bold leading-none tabular-nums"
          >
            {chipItems.length}
          </span>
        )}
        <span
          aria-hidden="true"
          className={classNames(
            'pointer-events-none absolute inset-x-0 bottom-[-1px] h-0.5 bg-primary transition-opacity duration-150',
            filtersOpen
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-100',
          )}
        />
      </button>

      {showFilters && isDesktop && (
        <div
          role="dialog"
          aria-label="Bộ lọc"
          className="absolute top-full right-0 mt-2 z-50 bg-surface-elevated p-5 rounded-dialog border border-border flex flex-col gap-5 w-80 max-w-[calc(100vw-2rem)] max-h-[70dvh] overflow-y-auto overscroll-contain"
        >
          {chipItems.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-body-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          <FilterControls
            filters={filters}
            updateFilter={updateFilter}
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
