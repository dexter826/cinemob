import { ActiveTab } from '../hooks/use-dashboard-filters';
import { MOVIE_STATUS_TAB_LABEL } from '@/constants/movie-status';
import { Tabs, type TabItem } from '@/shared/components/ui';

interface DashboardTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  watchingCount: number;
  watchlistCount: number;
  droppedCount: number;
  loading?: boolean;
}

function DashboardTabs({
  activeTab,
  onTabChange,
  historyCount,
  watchingCount,
  watchlistCount,
  droppedCount,
  loading = false,
}: DashboardTabsProps) {
  const counts: Record<ActiveTab, number> = {
    history: historyCount,
    watching: watchingCount,
    watchlist: watchlistCount,
    dropped: droppedCount,
  };

  const items: TabItem<ActiveTab>[] = (
    ['history', 'watching', 'watchlist', 'dropped'] as const
  ).map((key) => ({
    key,
    label: MOVIE_STATUS_TAB_LABEL[key],
    count: loading ? undefined : String(counts[key]).padStart(2, '0'),
    loadingCount: loading,
  }));

  return (
    // 4 tab có thể tràn trên màn nhỏ: cuộn ngang 1 dòng, ẩn scrollbar cho gọn.
    <div className="flex flex-nowrap items-center gap-x-4 overflow-x-auto scrollbar-none">
      <Tabs
        items={items}
        activeKey={activeTab}
        onChange={onTabChange}
        label="Trạng thái xem phim"
        layoutId="dashboard-tab-underline"
        tabClassName="h-12 shrink-0 text-body-sm font-bold uppercase tracking-[0.08em]"
      />
    </div>
  );
}

export default DashboardTabs;
