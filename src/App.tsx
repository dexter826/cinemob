import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ToastProvider } from './components/Toast.tsx';
import { AlertProvider } from './components/Alert.tsx';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
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
  return user ? <Dashboard /> : <Login />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AlertProvider>
            <Layout>
              <AppContent />
            </Layout>
          </AlertProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;