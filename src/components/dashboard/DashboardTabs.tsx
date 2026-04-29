import React from 'react';
import { ActiveTab } from '../../hooks/useDashboardFilters';

interface DashboardTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  moviesCount: number;
  tvCount: number;
}

/** Thanh chuyển đổi giữa tab "Đã xem" và "Sẽ xem". */
const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  moviesCount, 
  tvCount 
}) => {
  return (
    <div className="flex items-baseline gap-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 relative border border-border-default overflow-hidden">
          <div
            className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform duration-300 ease-out ${
              activeTab === 'history' ? 'translate-x-0' : 'translate-x-full'
            }`}
          />
          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`px-4 py-1.5 text-sm md:text-base font-bold rounded-full transition-colors cursor-pointer relative z-10 ${
              activeTab === 'history' ? 'text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Đã xem
          </button>
          <button
            type="button"
            onClick={() => onTabChange('watchlist')}
            className={`px-4 py-1.5 text-sm md:text-base font-bold rounded-full transition-colors cursor-pointer relative z-10 ${
              activeTab === 'watchlist' ? 'text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Sẽ xem
          </button>
        </div>
      </div>

      <span className="text-sm text-text-muted">
        ({moviesCount} phim / {tvCount} series)
      </span>
    </div>
  );
};

export default DashboardTabs;
