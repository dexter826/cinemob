import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ToastProvider } from './components/Toast.tsx';
import { AlertProvider } from './components/Alert.tsx';
import { AddMovieProvider, useAddMovie } from './components/AddMovieContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import StatsPage from './components/StatsPage';
import AddMovieModal from './components/AddMovieModal';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './components/ThemeProvider.tsx';

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
    return <SplashScreen onAnimationFinish={() => {}} />;
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
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AddMovieModal />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AlertProvider>
              <AddMovieProvider>
                <Layout>
                  <AppContent />
                </Layout>
              </AddMovieProvider>
            </AlertProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;