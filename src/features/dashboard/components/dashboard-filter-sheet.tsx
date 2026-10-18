import { useId } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { ActiveTab, FilterState, FilterUpdateFn } from '../hooks/use-dashboard-filters';
import { FilterControls } from './dashboard-filter-controls';

export interface DashboardFilterSheetProps {
  isOpen: boolean;
  filters: FilterState;
  updateFilter: FilterUpdateFn;
  activeTab: ActiveTab;
  availableYears: { value: string | number; label: string }[];
  availableCountries: { value: string; label: string }[];
  availableGenres: { value: string; label: string }[];
  hasHiddenFilters: boolean;
  clearFilters: () => void;
  onClose: () => void;
  onExited?: () => void;
}

function DashboardFilterSheet({
  isOpen,
  filters,
  updateFilter,
  activeTab,
  availableYears,
  availableCountries,
  availableGenres,
  hasHiddenFilters,
  clearFilters,
  onClose,
  onExited,
}: DashboardFilterSheetProps) {
  const titleId = useId();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId={titleId}
      presentation="sheet"
      onExitComplete={onExited}
    >
      <DialogHeader titleId={titleId} title="Bộ lọc" onClose={onClose} />
      <DialogBody>
        <FilterControls
          filters={filters}
          updateFilter={updateFilter}
          activeTab={activeTab}
          availableYears={availableYears}
          availableCountries={availableCountries}
          availableGenres={availableGenres}
        />
      </DialogBody>
      <DialogFooter>
        <div className="flex items-center gap-3">
          {hasHiddenFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              Xóa tất cả
            </Button>
          )}
          <Button variant="primary" onClick={onClose} className="flex-1">
            Xong
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export default DashboardFilterSheet;
