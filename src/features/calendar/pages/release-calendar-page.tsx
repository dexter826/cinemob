import Spinner from '@/shared/components/ui/spinner';
import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import EmptyState from '@/shared/components/ui/empty-state';
import { Tv, Bell, BellOff, BellRing } from 'lucide-react';
import { todayISO } from '@/shared/utils/date-format';

import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
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
    monthLoaded,
    movies,
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
  const shouldShowSkeleton = loading && movies.length === 0;
  const showSkeleton = useDelayedSkeleton(shouldShowSkeleton);
  const showEpisodesSkeleton = loadingEpisodes && !monthLoaded;
  const calendarCellCount =
    Math.ceil(
      (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() +
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) /
        7,
    ) * 7;

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
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-card border transition-colors flex items-center justify-center gap-2 font-semibold text-body-sm cursor-pointer ${
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
      ) : shouldShowSkeleton ? (
        showSkeleton ? (
          <div aria-busy="true" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 md:border-l md:border-border md:pl-6 md:first:border-l-0 md:first:pl-0"
                >
                  <Skeleton className="mt-1 h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-2 h-10 w-16" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface border border-border p-4 sm:p-6 rounded-dialog flex flex-col">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="mx-auto h-4 w-6" />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {Array.from({ length: calendarCellCount }).map((_, index) => (
                    <Skeleton key={index} className="h-14 sm:h-20 md:h-28" />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
                <Skeleton className="h-6 w-40" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex gap-4 py-3 border-b border-border-default">
                      <Skeleton className="w-12 h-16 sm:w-14 sm:h-20 rounded-poster" />
                      <div className="flex-1 space-y-3 py-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <div aria-busy={loadingEpisodes}>
          <CalendarStats
            episodesLoading={showEpisodesSkeleton}
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
                loadingEpisodes={showEpisodesSkeleton}
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
                loadingEpisodes={showEpisodesSkeleton}
                displayedEpisodes={displayedEpisodes}
                episodesByDate={episodesByDate}
                handleSeriesClick={handleSeriesClick}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReleaseCalendarPage;
