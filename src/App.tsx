import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';
import Login from '@/features/auth/components/Login';
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'));
const StatsPage = lazy(() => import('@/features/stats/pages/StatsPage'));
const AlbumsPage = lazy(() => import('@/features/albums/pages/AlbumsPage'));
const AlbumDetailPage = lazy(() => import('@/features/albums/pages/AlbumDetailPage'));
const PersonDetailPage = lazy(() => import('@/features/search/pages/PersonDetailPage'));
const ReleaseCalendarPage = lazy(() => import('@/features/calendar/pages/ReleaseCalendarPage'));
const MemberProfilePage = lazy(() => import('@/features/profile/pages/MemberProfilePage'));
const NotFoundPage = lazy(() => import('@/shared/pages/NotFoundPage'));
const AddMovieModal = lazy(() => import('@/features/movies/components/AddMovieModal'));
const MovieDetailModal = lazy(() => import('@/features/movies/components/MovieDetailModal'));
import Layout from '@/app/components/Layout';
import SplashScreen from '@/shared/components/feedback/SplashScreen';
import Loading from '@/shared/components/ui/Loading';
import ErrorBoundary from '@/shared/components/feedback/ErrorBoundary';
import { useAppInit } from '@/app/useAppInit';
import ToastContainer from '@/shared/components/feedback/ToastContainer';
import AlertContainer from '@/shared/components/feedback/AlertContainer';

import useInitialLoadStore from '@/shared/stores/initialLoadStore';
import { getSplashMode, SplashMode } from '@/shared/utils/splashPolicy';

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
