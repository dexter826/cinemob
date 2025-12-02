import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './components/providers/AuthProvider';
import useAddMovieStore from './stores/addMovieStore';
import useMovieDetailStore from './stores/movieDetailStore';
import Login from './components/auth/Login';
const Dashboard = lazy(() => import('./components/pages/Dashboard'));
const SearchPage = lazy(() => import('./components/pages/SearchPage'));
const StatsPage = lazy(() => import('./components/pages/StatsPage'));
const AlbumsPage = lazy(() => import('./components/pages/AlbumsPage'));
const AlbumDetailPage = lazy(() => import('./components/pages/AlbumDetailPage'));
const PersonDetailPage = lazy(() => import('./components/pages/PersonDetailPage'));
const ReleaseCalendarPage = lazy(() => import('./components/pages/ReleaseCalendarPage'));
const AddMovieModal = lazy(() => import('./components/modals/AddMovieModal'));
const MovieDetailModal = lazy(() => import('./components/modals/MovieDetailModal'));
import Layout from './components/layout/Layout';
import SplashScreen from './components/ui/SplashScreen';
import Loading from './components/ui/Loading';
import { ThemeProvider } from './components/providers/ThemeProvider';
import AlbumStoreInitializer from './components/providers/AlbumStoreInitializer';
import RecommendationsStoreInitializer from './components/providers/RecommendationsStoreInitializer';
import ReleaseCalendarStoreInitializer from './components/providers/ReleaseCalendarStoreInitializer';
import PullToRefreshProvider from './components/providers/PullToRefreshProvider';
import ToastContainer from './components/ui/ToastContainer';
import AlertContainer from './components/ui/AlertContainer';

import useInitialLoadStore from './stores/initialLoadStore';

// Page transition variants - chỉ fade opacity, không translate để tránh chớp
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
};

// Animated Routes component to handle page transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
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

const MainApp: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: isDetailModalOpen, movie: selectedMovie, closeDetailModal } = useMovieDetailStore();
  const { isInitialLoadComplete } = useInitialLoadStore();

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
    <PullToRefreshProvider>
      <Layout>
        <AlbumStoreInitializer />
        <RecommendationsStoreInitializer />
        <ReleaseCalendarStoreInitializer />
        <Suspense fallback={<Loading />}>
          <AnimatedRoutes />
          <AddMovieModal />
          <MovieDetailModal
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            movie={selectedMovie}
          />
        </Suspense>
      </Layout>
    </PullToRefreshProvider>
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
      {shouldShowSplash && (
        <SplashScreen 
          onAnimationFinish={() => setAnimationFinished(true)} 
          showLoading={animationFinished && !appReady}
        />
      )}

      {animationFinished && (
        <AuthProvider>
          <ThemeProvider>
            <MainApp onReady={handleAppReady} />
            <ToastContainer />
            <AlertContainer />
          </ThemeProvider>
        </AuthProvider>
      )}
    </Router>
  );
};

export default App;