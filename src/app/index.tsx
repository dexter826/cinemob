import { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/components/auth-provider';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import Login from '@/features/auth/components/login';
const Dashboard = lazy(() => import('@/features/dashboard/pages/dashboard-page'));
const SearchPage = lazy(() => import('@/features/search/pages/search-page'));
const StatsPage = lazy(() => import('@/features/stats/pages/stats-page'));
const AlbumsPage = lazy(() => import('@/features/albums/pages/albums-page'));
const AlbumDetailPage = lazy(() => import('@/features/albums/pages/album-detail-page'));
const MovieDetailPage = lazy(() => import('@/features/movies/pages/movie-detail-page'));
const PersonDetailPage = lazy(() => import('@/features/search/pages/person-detail-page'));
const ReleaseCalendarPage = lazy(() => import('@/features/calendar/pages/release-calendar-page'));
const MemberProfilePage = lazy(() => import('@/features/profile/pages/member-profile-page'));
const NotFoundPage = lazy(() => import('@/shared/pages/not-found-page'));
const loadAddMovieModal = () => import('@/features/movies/components/add-movie-modal');
import Layout from '@/app/components/layout';
import SplashScreen from '@/shared/components/feedback/splash-screen';
import Loading from '@/shared/components/ui/loading';
import ErrorBoundary from '@/shared/components/feedback/error-boundary';
import { useAppInit } from '@/app/use-app-init';
import ToastContainer from '@/shared/components/feedback/toast-container';
import AlertContainer from '@/shared/components/feedback/alert-container';

import LazyDialog from '@/shared/components/ui/lazy-dialog';
import ErrorState from '@/shared/components/ui/error-state';
import useMovieStore from '@/features/movies/stores/movie-store';

// Fade mount 200ms mỗi điều hướng (fallback cho hero transition).
function AnimatedRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // PUSH/REPLACE luôn mở từ đỉnh trang; POP để browser + use-scroll-restore xử lý.
  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname, navigationType]);

  return (
    <div key={location.pathname} className="motion-safe:animate-page-enter">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
        <Route path="/person/:personId" element={<PersonDetailPage />} />
        <Route path="/calendar" element={<ReleaseCalendarPage />} />
        <Route path="/profile/:uid" element={<MemberProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function MainApp() {
  const { user, loading: authLoading, error: authError, retryAuth } = useAuth();
  const { isOpen: isAddMovieOpen, ownerUid: modalOwnerUid, closeAddModal } = useAddMovieStore();
  const collectionUid = useMovieStore((state) => state.activeUid);
  useAppInit();
  if (authLoading) return <SplashScreen />;
  if (authError)
    return (
      <ErrorState
        title={authError}
        description="Thử xác thực lại để tiếp tục."
        retry={{ label: 'Thử lại', onClick: retryAuth }}
      />
    );
  if (!user) return <Login />;
  return (
    <Layout key={user.uid}>
      <ErrorBoundary>
        <Suspense fallback={<Loading fullScreen={false} contain />}>
          {collectionUid === user.uid ? <AnimatedRoutes /> : <Loading text="Đang tải thư viện…" />}
        </Suspense>
      </ErrorBoundary>
      <LazyDialog
        open={isAddMovieOpen && modalOwnerUid === user.uid}
        onClose={closeAddModal}
        title="Thông tin phim"
        loader={loadAddMovieModal}
        componentProps={{}}
        size="4xl"
        presentation="fullscreen-mobile"
      />
    </Layout>
  );
}
function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
        <ToastContainer />
        <AlertContainer />
      </AuthProvider>
    </Router>
  );
}
export default App;
