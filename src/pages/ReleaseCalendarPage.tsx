import React from 'react';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { Tv, CalendarDays, Bell, BellOff, BellRing, Calendar, List } from 'lucide-react';

import { useReleaseCalendar } from '../hooks/useReleaseCalendar';
import CalendarStats from '../components/calendar/CalendarStats';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EpisodeList from '../components/calendar/EpisodeList';
import PageHeader from '../components/ui/PageHeader';

/** Trang Lịch phát sóng các tập phim mới của Series. */
const ReleaseCalendarPage: React.FC = () => {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface rounded-2xl animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-7 w-40 bg-surface rounded-lg animate-pulse" />
              <div className="h-3.5 w-56 bg-surface rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-28 bg-surface rounded-3xl animate-pulse shadow-premium border border-border-default" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-surface rounded-3xl animate-pulse shadow-premium border border-border-default" />
          <div className="h-80 bg-surface rounded-3xl animate-pulse shadow-premium border border-border-default" />
        </div>
      </div>
    );
  }

  return (
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
          <PageHeader 
            icon={CalendarDays}
            title="Lịch phát sóng"
            description="Theo dõi các tập phim mới nhất của series bạn quan tâm"
          >
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* View Mode Toggle */}
              <div className="bg-surface border border-border-default p-1 rounded-2xl flex items-center shadow-premium">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] sm:text-xs ${
                    viewMode === 'calendar' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Calendar size={14} />
                  <span className="hidden xs:inline">Lịch</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] sm:text-xs ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <List size={14} />
                  <span className="hidden xs:inline">Danh sách</span>
                </button>
              </div>

              <button
                onClick={handlePushToggle}
                disabled={pushLoading}
                title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
                className={`flex-1 sm:flex-none px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs shadow-premium ${
                  pushSubscribed
                    ? 'bg-success text-white shadow-lg shadow-success/20'
                    : notificationPermission === 'denied'
                    ? 'bg-error/10 text-error border border-error/20 cursor-not-allowed'
                    : 'bg-surface border border-border-default text-text-main hover:bg-primary/5 hover:border-primary/30'
                } ${pushLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {pushLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : pushSubscribed ? (
                  <BellRing size={16} />
                ) : notificationPermission === 'denied' ? (
                  <BellOff size={16} />
                ) : (
                  <Bell size={16} />
                )}
                <span className="whitespace-nowrap">
                  {pushLoading
                    ? 'Đang xử lý...'
                    : pushSubscribed
                    ? 'Đã bật'
                    : notificationPermission === 'denied'
                    ? 'Bị chặn'
                    : 'Thông báo'}
                </span>
              </button>
            </div>
          </PageHeader>

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
              className="bg-surface border border-border-default rounded-3xl shadow-premium py-6 sm:py-8"
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
        </div>
    </div>
  );
};

export default ReleaseCalendarPage;
