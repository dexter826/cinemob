import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import Login from '@/features/auth/components/Login';
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'));
const StatsPage = lazy(() => import('@/features/stats/pages/StatsPage'));
const AlbumsPage = lazy(() => import('@/features/albums/pages/AlbumsPage'));
const AlbumDetailPage = lazy(() => import('@/features/albums/pages/AlbumDetailPage'));
const PersonDetailPage = lazy(() => import('@/features/search/pages/PersonDetailPage'));
const ReleaseCalendarPage = lazy(() => import('@/features/calendar/pages/ReleaseCalendarPage'));
const SharePage = lazy(() => import('@/features/share/pages/SharePage'));
const AddMovieModal = lazy(() => import('@/features/movies/components/AddMovieModal'));
const MovieDetailModal = lazy(() => import('@/features/movies/components/MovieDetailModal'));
import Layout from '@/shared/components/layout/Layout';
import SplashScreen from '@/shared/components/feedback/SplashScreen';
import Loading from '@/shared/components/ui/Loading';
import ErrorBoundary from '@/shared/components/feedback/ErrorBoundary';
import { useAppInit } from '@/shared/hooks/useAppInit';
import ToastContainer from '@/shared/components/feedback/ToastContainer';
import AlertContainer from '@/shared/components/feedback/AlertContainer';

import useInitialLoadStore from '@/shared/stores/initialLoadStore';

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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function MainApp({ onReady, appReady }: { onReady: () => void; appReady: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: isDetailModalOpen, movie: selectedMovie, closeDetailModal } = useMovieDetailStore();
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
          <AddMovieModal />
          <MovieDetailModal
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            movie={selectedMovie}
          />
        </ErrorBoundary>
      </Suspense>
    </Layout>
  );
};

function App() {
  const [shouldShowSplash, setShouldShowSplash] = useState(() => !sessionStorage.getItem('splashScreenShown'));
  const [animationFinished, setAnimationFinished] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!shouldShowSplash) {
      setAnimationFinished(true);
    }
  }, [shouldShowSplash]);

  const handleAppReady = () => {
    setAppReady(true);
    if (shouldShowSplash) {
      setShouldShowSplash(false);
      sessionStorage.setItem('splashScreenShown', 'true');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/share/:uid"
          element={
            <ErrorBoundary>
              <Suspense fallback={<Loading fullScreen />}>
                <SharePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/*"
          element={
            <>
              {shouldShowSplash && (
                <SplashScreen 
                  onAnimationFinish={() => setAnimationFinished(true)} 
                  showLoading={animationFinished && !appReady}
                />
              )}

              {animationFinished && (
                <AuthProvider>
                  <MainApp onReady={handleAppReady} appReady={appReady} />
                  <ToastContainer />
                  <AlertContainer />
                </AuthProvider>
              )}
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
