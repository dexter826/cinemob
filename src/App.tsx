import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/providers/AuthProvider';
import useAddMovieStore from './stores/addMovieStore';
import Login from './components/auth/Login';
const Dashboard = lazy(() => import('./components/pages/Dashboard'));
const SearchPage = lazy(() => import('./components/pages/SearchPage'));
const StatsPage = lazy(() => import('./components/pages/StatsPage'));
const AlbumsPage = lazy(() => import('./components/pages/AlbumsPage'));
const AlbumDetailPage = lazy(() => import('./components/pages/AlbumDetailPage'));
const AddMovieModal = lazy(() => import('./components/modals/AddMovieModal'));
import Layout from './components/layout/Layout';
import SplashScreen from './components/ui/SplashScreen';
import Loading from './components/ui/Loading';
import { ThemeProvider } from './components/providers/ThemeProvider';
import AlbumStoreInitializer from './components/providers/AlbumStoreInitializer';
import RecommendationsStoreInitializer from './components/providers/RecommendationsStoreInitializer';
import ToastContainer from './components/ui/ToastContainer';
import AlertContainer from './components/ui/AlertContainer';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSplashing, setIsSplashing] = useState(() => !sessionStorage.getItem('splashScreenShown'));

  useEffect(() => {
    if (isSplashing) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('splashScreenShown', 'true');
        setIsSplashing(false);
      }, 2000); // Splash screen minimum time

      return () => clearTimeout(timer);
    }
  }, [isSplashing]);

  // If splash screen is active, show it.
  if (isSplashing) {
    return <SplashScreen onAnimationFinish={() => { }} />;
  }

  // After splash, if auth is still loading, show a blank screen to prevent flashing Login page.
  if (authLoading) {
    return null;
  }

  // Once splash and auth are done, render the appropriate component.
  if (!user) {
    return <Login />;
  }

  return (
    <>
      <AlbumStoreInitializer />
      <RecommendationsStoreInitializer />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <AddMovieModal />
      </Suspense>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <AppContent />
          </Layout>
          <ToastContainer />
          <AlertContainer />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;