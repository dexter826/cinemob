import React from 'react';
import Navbar from '../layout/Navbar';
import Loading from '../ui/Loading';
import { Tv } from 'lucide-react';

import { useReleaseCalendar } from '../../hooks/useReleaseCalendar';
import CalendarHeader from '../calendar/CalendarHeader';
import CalendarStats from '../calendar/CalendarStats';
import CalendarGrid from '../calendar/CalendarGrid';
import EpisodeList from '../calendar/EpisodeList';

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
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
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
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Tv size={48} className="text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text-main mb-2">
                Chưa có series nào để theo dõi
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Thêm các series TV vào danh sách xem hoặc đang xem để theo dõi lịch phát sóng các tập mới.
              </p>
            </div>
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
      </main>
    </>
  );
};

export default ReleaseCalendarPage;
