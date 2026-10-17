import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/components/auth-provider';
import useMovieDetailStore from '@/features/movies/stores/movie-detail-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import Login from '@/features/auth/components/login';
const Dashboard = lazy(() => import('@/features/dashboard/pages/dashboard-page'));
const SearchPage = lazy(() => import('@/features/search/pages/search-page'));
const StatsPage = lazy(() => import('@/features/stats/pages/stats-page'));
const AlbumsPage = lazy(() => import('@/features/albums/pages/albums-page'));
const AlbumDetailPage = lazy(() => import('@/features/albums/pages/album-detail-page'));
const PersonDetailPage = lazy(() => import('@/features/search/pages/person-detail-page'));
const ReleaseCalendarPage = lazy(() => import('@/features/calendar/pages/release-calendar-page'));
const MemberProfilePage = lazy(() => import('@/features/profile/pages/member-profile-page'));
const NotFoundPage = lazy(() => import('@/shared/pages/not-found-page'));
const AddMovieModal = lazy(() => import('@/features/movies/components/add-movie-modal'));
const MovieDetailModal = lazy(() => import('@/features/movies/components/movie-detail-modal'));
import Layout from '@/app/components/layout';
import SplashScreen from '@/shared/components/feedback/splash-screen';
import Loading from '@/shared/components/ui/loading';
import ErrorBoundary from '@/shared/components/feedback/error-boundary';
import { useAppInit } from '@/app/use-app-init';
import ToastContainer from '@/shared/components/feedback/toast-container';
import AlertContainer from '@/shared/components/feedback/alert-container';

import useInitialLoadStore from '@/shared/stores/initial-load-store';
import { getSplashMode, SplashMode } from '@/shared/utils/splash-policy';

// Điều hướng trang không animate toàn màn hình để tránh nháy composite layer.
function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/albums" element={<AlbumsPage />} />
      <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
      <Route path="/person/:personId" element={<PersonDetailPage />} />
      <Route path="/calendar" element={<ReleaseCalendarPage />} />
      <Route path="/profile/:uid" element={<MemberProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function MainApp({ onReady, appReady }: { onReady: () => void; appReady: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const {
    isOpen: isDetailModalOpen,
    movie: selectedMovie,
    closeDetailModal,
  } = useMovieDetailStore();
  const { isOpen: isAddMovieOpen } = useAddMovieStore();
  const { isInitialLoadComplete } = useInitialLoadStore();

  useAppInit();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        onReady();
      } else if (isInitialLoadComplete) {
        onReady();
      }
    }
  }, [authLoading, user, isInitialLoadComplete, onReady]);

  if (authLoading) return null;

  if (!user) {
    return <Login />;
  }

  return (
    <Layout appReady={appReady}>
      <ErrorBoundary>
        <Suspense fallback={<Loading fullScreen={false} contain={true} />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ErrorBoundary>
          {isAddMovieOpen && <AddMovieModal />}
          {isDetailModalOpen && (
            <MovieDetailModal isOpen onClose={closeDetailModal} movie={selectedMovie} />
          )}
        </ErrorBoundary>
      </Suspense>
    </Layout>
  );
}

function App() {
  // Splash mode is decided once at startup: full splash on app start/reload,
  // static when reduced motion is requested.
  const [splashMode] = useState<SplashMode>(() =>
    getSplashMode(window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  );
  const [shouldShowSplash, setShouldShowSplash] = useState(() => splashMode !== 'none');
  const [appReady, setAppReady] = useState(false);

  const handleAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShouldShowSplash(false);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            <AuthProvider>
              {shouldShowSplash && (
                <SplashScreen
                  onAnimationFinish={handleSplashFinish}
                  staticMode={splashMode === 'static'}
                />
              )}

              <MainApp onReady={handleAppReady} appReady={appReady} />
              <ToastContainer />
              <AlertContainer />
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
