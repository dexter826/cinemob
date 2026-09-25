import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import useAddMovieStore from '@/features/movies/stores/addMovieStore';
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
import { useAppInit } from '@/shared/hooks/useAppInit';
import ToastContainer from '@/shared/components/feedback/ToastContainer';
import AlertContainer from '@/shared/components/feedback/AlertContainer';
import { PAGE_VARIANTS, PAGE_TRANSITION } from '@/constants';

import useInitialLoadStore from '@/shared/stores/initialLoadStore';

const REDUCED_PAGE_VARIANTS = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

// Điều hướng trang kèm hỗ trợ giảm chuyển động.
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={shouldReduceMotion ? REDUCED_PAGE_VARIANTS : PAGE_VARIANTS}
        transition={shouldReduceMotion ? { duration: 0.15 } : PAGE_TRANSITION}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
          <Route path="/person/:personId" element={<PersonDetailPage />} />
          <Route path="/calendar" element={<ReleaseCalendarPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const MainApp: React.FC<{ onReady: () => void; appReady: boolean }> = ({ onReady, appReady }) => {
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
      <Suspense fallback={<Loading fullScreen={false} contain={true} />}>
        <AnimatedRoutes />
      </Suspense>
      <Suspense fallback={null}>
        <AddMovieModal />
        <MovieDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          movie={selectedMovie}
        />
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
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
            <Suspense fallback={<Loading fullScreen />}>
              <SharePage />
            </Suspense>
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