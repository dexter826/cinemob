import React from 'react';
import Navbar from '../components/layout/Navbar';
import Loading from '../components/ui/Loading';
import { Tv } from 'lucide-react';

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
    viewMode,
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
      <main className="min-h-screen bg-background pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
          <CalendarHeader 
            handlePushToggle={handlePushToggle}
            pushLoading={pushLoading}
            pushSubscribed={pushSubscribed}
            notificationPermission={notificationPermission}
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
            <div className="bg-surface/50 backdrop-blur-xl border border-border-default rounded-[32px] p-16 text-center shadow-premium animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                  <Tv size={48} className="text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-text-main mb-3 tracking-tight">
                Chưa có TV Series nào
              </h3>
              <p className="text-text-muted max-w-md mx-auto text-lg opacity-80 leading-relaxed">
                Thêm các bộ phim bộ vào danh sách <strong>"Đang xem"</strong> hoặc <strong>"Sẽ xem"</strong> để theo dõi lịch phát sóng chi tiết.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
