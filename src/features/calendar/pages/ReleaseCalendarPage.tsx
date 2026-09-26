import EmptyState from '@/shared/components/ui/EmptyState';
import { Tv, Bell, BellOff, BellRing, Calendar, List } from 'lucide-react';

import { useReleaseCalendar } from '../hooks/useReleaseCalendar';
import CalendarStats from '../components/CalendarStats';
import CalendarGrid from '../components/CalendarGrid';
import EpisodeList from '../components/EpisodeList';
import PageHeader from '@/shared/components/ui/PageHeader';

/** Trang Lịch phát sóng các tập phim mới của Series. */
type PushStatus = 'loading' | 'on' | 'blocked' | 'off';

const getPushStatus = (pushLoading: boolean, pushSubscribed: boolean, permission: string): PushStatus => {
  if (pushLoading) return 'loading';
  if (pushSubscribed) return 'on';
  if (permission === 'denied') return 'blocked';
  return 'off';
};

const PUSH_LABEL: Record<PushStatus, string> = {
  loading: 'Đang xử lý...',
  on: 'Đã bật',
  blocked: 'Bị chặn',
  off: 'Thông báo',
};

function ReleaseCalendarPage() {
  const {
    loading,
    loadingEpisodes,
    tvSeries,
    upcomingEpisodes,
    currentDate,
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
    pushLoading,
    pushSubscribed,
    notificationPermission,
    handlePushToggle,
    navigateMonth,
    goToToday,
    getEpisodesForDate,
    displayedEpisodes,
    episodesByDate,
    handleSeriesClick
  } = useReleaseCalendar();

  const pushStatus = getPushStatus(pushLoading, pushSubscribed, notificationPermission);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
          <PageHeader
            title="Lịch phát sóng"
            description="Theo dõi các tập phim mới nhất của series bạn quan tâm"
            className="flex-col sm:flex-row items-stretch sm:items-center"
            actions={(
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div role="tablist" aria-label="Chế độ hiển thị lịch chiếu" className="bg-surface border border-border p-1 rounded-2xl flex items-center">
                  <button
                    disabled={loading}
                    role="tab"
                    aria-selected={viewMode === 'calendar'}
                    aria-label="Xem theo lịch tháng"
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 sm:p-2.5 rounded-xl transition-colors flex items-center gap-2 font-semibold text-xs cursor-pointer ${
                      viewMode === 'calendar'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Calendar size={14} strokeWidth={1.5} aria-hidden="true" />
                    <span>Lịch</span>
                  </button>
                  <button
                    disabled={loading}
                    role="tab"
                    aria-selected={viewMode === 'list'}
                    aria-label="Xem theo danh sách"
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-2.5 rounded-xl transition-colors flex items-center gap-2 font-semibold text-xs cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <List size={14} strokeWidth={1.5} aria-hidden="true" />
                    <span>Danh sách</span>
                  </button>
                </div>

                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading || loading}
                  title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
                  aria-label={pushSubscribed ? 'Tắt thông báo tập phim mới' : 'Bật thông báo tập phim mới'}
                  className={`flex-1 sm:flex-none px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl transition-colors flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer ${
                    pushStatus === 'on'
                      ? 'bg-success text-white'
                      : pushStatus === 'blocked'
                      ? 'bg-danger/10 text-danger border border-danger/20 cursor-not-allowed'
                      : 'bg-surface border border-border text-text-primary hover:border-primary/30'
                  } ${pushLoading || loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {pushStatus === 'loading' && (
                    <div aria-hidden="true" className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {pushStatus === 'on' && <BellRing size={16} strokeWidth={1.5} aria-hidden="true" />}
                  {pushStatus === 'blocked' && <BellOff size={16} strokeWidth={1.5} aria-hidden="true" />}
                  {pushStatus === 'off' && <Bell size={16} strokeWidth={1.5} aria-hidden="true" />}
                  <span className="whitespace-nowrap">
                    {PUSH_LABEL[pushStatus]}
                  </span>
                </button>
              </div>
            )}
          />

          {loading ? (
            <div className="space-y-6">
              <div className="h-28 bg-surface rounded-3xl animate-pulse border border-border" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80 bg-surface rounded-3xl animate-pulse border border-border" />
                <div className="h-80 bg-surface rounded-3xl animate-pulse border border-border" />
              </div>
            </div>
          ) : (
            <>
              <CalendarStats 
                tvSeriesCount={tvSeries.length}
                upcomingEpisodesCount={upcomingEpisodes.length}
                todayEpisodesCount={getEpisodesForDate(new Date()).length}
                thisWeekEpisodesCount={upcomingEpisodes.filter(ep => {
                  const airDate = new Date(ep.episode.air_date);
                  const weekFromNow = new Date();
                  weekFromNow.setDate(weekFromNow.getDate() + 7);
                  return airDate <= weekFromNow;
                }).length}
              />

              {tvSeries.length === 0 ? (
                <EmptyState
                  icon={Tv}
                  title="Chưa có TV Series nào"
                  description='Thêm các phim bộ vào danh sách "Đang xem" hoặc "Sẽ xem" để theo dõi lịch phát sóng chi tiết.'
                  className="bg-surface border border-border rounded-3xl py-6 sm:py-8"
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {viewMode === 'calendar' && (
                    <CalendarGrid 
                      currentDate={currentDate}
                      navigateMonth={navigateMonth}
                      goToToday={goToToday}
                      loadingEpisodes={loadingEpisodes}
                      getEpisodesForDate={getEpisodesForDate}
                      setSelectedDate={setSelectedDate}
                      selectedDate={selectedDate}
                    />
                  )}

                  <EpisodeList 
                    viewMode={viewMode}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    loadingEpisodes={loadingEpisodes}
                    displayedEpisodes={displayedEpisodes}
                    episodesByDate={episodesByDate}
                    handleSeriesClick={handleSeriesClick}
                  />
                </div>
              )}
            </>
          )}

    </main>
  );
};

export default ReleaseCalendarPage;
