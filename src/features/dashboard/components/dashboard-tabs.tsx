import { motion, useReducedMotion } from 'framer-motion';
import { ActiveTab } from '../hooks/use-dashboard-filters';

interface DashboardTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  watchlistCount: number;
}

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'history', label: 'Đã xem' },
  { key: 'watchlist', label: 'Sẽ xem' },
];

/** Tabs caps + gạch chân vàng trượt (editorial). */
function DashboardTabs({ activeTab, onTabChange, historyCount, watchlistCount }: DashboardTabsProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const counts: Record<ActiveTab, number> = { history: historyCount, watchlist: watchlistCount };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <div role="group" aria-label="Bộ lọc trạng thái xem phim" className="flex items-center">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex items-center h-12 px-3.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 tabular-nums ${isActive ? 'text-primary' : 'opacity-60'}`}
              >
                {String(counts[tab.key]).padStart(2, '0')}
              </span>
              {isActive && (
                <motion.span
                  layoutId={reducedMotion ? undefined : 'dashboard-tab-underline'}
                  className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardTabs;
