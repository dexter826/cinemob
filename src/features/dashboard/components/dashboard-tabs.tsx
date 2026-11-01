import { ActiveTab } from '../hooks/use-dashboard-filters';
import { MOVIE_STATUS_TAB_LABEL } from '@/constants/movie-status';
import { Tabs, type TabItem } from '@/shared/components/ui';

interface DashboardTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  watchlistCount: number;
  droppedCount: number;
  loading?: boolean;
}

function DashboardTabs({
  activeTab,
  onTabChange,
  historyCount,
  watchlistCount,
  droppedCount,
  loading = false,
}: DashboardTabsProps) {
  const counts: Record<ActiveTab, number> = {
    history: historyCount,
    watchlist: watchlistCount,
    dropped: droppedCount,
  };

  const items: TabItem<ActiveTab>[] = [
    {
      key: 'history',
      label: MOVIE_STATUS_TAB_LABEL.history,
      count: loading ? undefined : String(counts.history).padStart(2, '0'),
      loadingCount: loading,
    },
    {
      key: 'watchlist',
      label: MOVIE_STATUS_TAB_LABEL.watchlist,
      count: loading ? undefined : String(counts.watchlist).padStart(2, '0'),
      loadingCount: loading,
    },
    {
      key: 'dropped',
      label: MOVIE_STATUS_TAB_LABEL.dropped,
      count: loading ? undefined : String(counts.dropped).padStart(2, '0'),
      loadingCount: loading,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Tabs
        items={items}
        activeKey={activeTab}
        onChange={onTabChange}
        label="Trạng thái xem phim"
        layoutId="dashboard-tab-underline"
        tabClassName="h-12 text-body-sm font-bold uppercase tracking-[0.08em]"
      />
    </div>
  );
}

export default DashboardTabs;
