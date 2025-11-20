import React from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ToastProvider } from './components/Toast.tsx';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import { Loader } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Layout>
          <AppContent />
        </Layout>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;