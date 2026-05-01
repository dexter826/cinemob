import React from 'react';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { Tv, Search } from 'lucide-react';

import { useReleaseCalendar } from '../hooks/useReleaseCalendar';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarStats from '../components/calendar/CalendarStats';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EpisodeList from '../components/calendar/EpisodeList';

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
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="h-40 bg-surface rounded-4xl animate-pulse" />
        <div className="h-32 bg-surface rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-surface rounded-4xl animate-pulse" />
          <div className="h-96 bg-surface rounded-4xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <main className="text-text-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12">
          <CalendarHeader 
            handlePushToggle={handlePushToggle}
            pushLoading={pushLoading}
            pushSubscribed={pushSubscribed}
            notificationPermission={notificationPermission}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

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
              action={{
                label: "Khám phá ngay",
                onClick: () => navigateMonth('next')
              }}
              className="bg-surface/50 backdrop-blur-xl border border-border-default rounded-4xl"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
      </main>
  );
};

export default ReleaseCalendarPage;
