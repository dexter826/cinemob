import EmptyState from '@/shared/components/ui/EmptyState';
import { Tv, Bell, BellOff, BellRing } from 'lucide-react';
import { todayISO } from '@/shared/utils/dateFormat';

import { useReleaseCalendar } from '../hooks/useReleaseCalendar';
import CalendarStats from '../components/CalendarStats';
import CalendarGrid from '../components/CalendarGrid';
import EpisodeList from '../components/EpisodeList';
import PageHeader from '@/shared/components/ui/PageHeader';

/** Trang Lịch phát sóng các tập phim mới của Series. */
type PushStatus = 'loading' | 'on' | 'blocked' | 'off';

const getPushStatus = (
  pushLoading: boolean,
  pushSubscribed: boolean,
  permission: string,
): PushStatus => {
  if (pushLoading) return 'loading';
  if (pushSubscribed) return 'on';
  if (permission === 'denied') return 'blocked';
  return 'off';
};

const PUSH_LABEL: Record<PushStatus, string> = {
  loading: 'Đang xử lý…',
  on: 'Đã bật',
  blocked: 'Bị chặn',
  off: 'Thông báo',
};

function ReleaseCalendarPage() {
  const {
    loading,
    loadingEpisodes,
    tvSeries,
    monthEpisodes,
    currentDate,
    selectedDate,
    setSelectedDate,
    episodesError,
    retryEpisodes,
    pushLoading,
    pushSubscribed,
    notificationPermission,
    handlePushToggle,
    navigateMonth,
    goToToday,
    getEpisodesForDate,
    displayedEpisodes,
    episodesByDate,
    handleSeriesClick,
  } = useReleaseCalendar();

  const pushStatus = getPushStatus(pushLoading, pushSubscribed, notificationPermission);
  const today = todayISO();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader
        title="Lịch phát sóng"
        className="flex-col sm:flex-row items-stretch sm:items-center"
        actions={
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePushToggle}
              disabled={pushLoading || loading}
              title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
              aria-label={
                pushSubscribed ? 'Tắt thông báo tập phim mới' : 'Bật thông báo tập phim mới'
              }
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-card transition-colors flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer ${
                pushStatus === 'on'
                  ? 'bg-success text-on-success'
                  : pushStatus === 'blocked'
                    ? 'bg-danger/10 text-danger border border-danger/20 cursor-not-allowed'
                    : 'bg-surface border border-border text-text-primary hover:border-primary/30'
              } ${pushLoading || loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {pushStatus === 'loading' && (
                <div
                  aria-hidden="true"
                  className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
              )}
              {pushStatus === 'on' && <BellRing size={16} strokeWidth={1.5} aria-hidden="true" />}
              {pushStatus === 'blocked' && (
                <BellOff size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
              {pushStatus === 'off' && <Bell size={16} strokeWidth={1.5} aria-hidden="true" />}
              <span className="whitespace-nowrap">{PUSH_LABEL[pushStatus]}</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="h-28 bg-surface rounded-dialog animate-pulse border border-border" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-surface rounded-dialog animate-pulse border border-border" />
            <div className="h-80 bg-surface rounded-dialog animate-pulse border border-border" />
          </div>
        </div>
      ) : (
        <>
          <CalendarStats
            tvSeriesCount={tvSeries.length}
            monthEpisodesCount={monthEpisodes.length}
            airedEpisodesCount={monthEpisodes.filter((ep) => ep.episode.air_date < today).length}
            upcomingEpisodesCount={
              monthEpisodes.filter((ep) => ep.episode.air_date >= today).length
            }
          />

          {tvSeries.length === 0 ? (
            <EmptyState
              icon={Tv}
              title="Chưa có series nào"
              description="Thêm series vào danh sách “Đã xem” hoặc “Sẽ xem” để theo dõi lịch phát sóng."
              className="bg-surface border border-border rounded-dialog py-6 sm:py-8"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CalendarGrid
                currentDate={currentDate}
                navigateMonth={navigateMonth}
                goToToday={goToToday}
                loadingEpisodes={loadingEpisodes}
                getEpisodesForDate={getEpisodesForDate}
                setSelectedDate={setSelectedDate}
                selectedDate={selectedDate}
              />

              <EpisodeList
                currentDate={currentDate}
                episodesError={episodesError}
                retryEpisodes={retryEpisodes}
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
    </div>
  );
}

export default ReleaseCalendarPage;
