import Spinner from '@/shared/components/ui/spinner';
import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import EmptyState from '@/shared/components/ui/empty-state';
import { Tv, Bell, BellOff, BellRing } from 'lucide-react';
import { todayISO } from '@/shared/utils/date-format';

import { useReleaseCalendar } from '../hooks/use-release-calendar';
import CalendarStats from '../components/calendar-stats';
import CalendarGrid from '../components/calendar-grid';
import EpisodeList from '../components/episode-list';
import PageHeader from '@/shared/components/ui/page-header';

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
    collectionError,
    retryCollection,
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
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
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-card border transition-colors flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer ${
                pushStatus === 'on'
                  ? 'bg-success text-on-success border-transparent'
                  : pushStatus === 'blocked'
                    ? 'border-transparent text-danger cursor-not-allowed'
                    : 'border-border text-text-secondary hover:border-primary/50 hover:text-primary'
              } ${pushLoading || loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {pushStatus === 'loading' && <Spinner size={14} className="text-current" />}
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

      <LoadingStatus>
        {loading
          ? 'Đang tải series…'
          : loadingEpisodes
            ? 'Đang tải lịch phát sóng…'
            : episodesError || ''}
      </LoadingStatus>
      {collectionError ? (
        <ErrorState
          title="Không tải được danh sách series"
          description="Vui lòng thử lại."
          retry={{ label: 'Thử lại', onClick: retryCollection }}
        />
      ) : loading ? (
        <div className="space-y-6">
          <Skeleton className="h-28  rounded-dialog  border border-border" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-80  rounded-dialog  border border-border" />
            <Skeleton className="h-80  rounded-dialog  border border-border" />
          </div>
        </div>
      ) : (
        <>
          <CalendarStats
            episodesLoading={loadingEpisodes}
            episodesError={episodesError}
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
