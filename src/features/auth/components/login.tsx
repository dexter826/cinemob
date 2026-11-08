import Button from '@/shared/components/ui/button';
import CineMobSymbol from '@/shared/components/ui/cinemob-symbol';
import { useEffect, useState, useCallback } from 'react';
import EmailAuthForm from './email-auth-form';
import { useAuth } from '@/features/auth/components/auth-provider';
import { getTrendingMovies } from '@/features/search/services/tmdb';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import type { TMDBMovieResult } from '@/types';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const WALL_COUNT = 6;

function useWallPosters(): TMDBMovieResult[] {
  const [posters, setPosters] = useState<TMDBMovieResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTrendingMovies()
      .then((data) => {
        if (cancelled) return;
        setPosters((data?.results ?? []).filter((m) => m.poster_path).slice(0, WALL_COUNT));
      })
      .catch(() => {
        // Poster trang trí nền: bỏ qua nếu gặp lỗi mạng hoặc rate-limit
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return posters;
}

function PosterTile({ poster }: { poster: TMDBMovieResult }) {
  return (
    <img
      src={getTMDBImageUrl(poster.poster_path, 'w500')}
      alt=""
      aria-hidden="true"
      width={500}
      height={750}
      draggable={false}
      className="w-full h-full object-cover"
    />
  );
}

function Login() {
  const { signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const posters = useWallPosters();

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  const hasWall = posters.length >= WALL_COUNT;

  return (
    <main className="min-h-dvh flex flex-col lg:grid bg-background text-text-primary selection:bg-primary/20 selection:text-primary lg:grid-cols-[11fr_9fr] lg:grid-rows-1">
      <div className="order-1 lg:order-2 flex-1 flex flex-col border-b border-border lg:border-b-0 lg:border-l min-h-0">
        <div className="flex-1 flex flex-col px-4 py-6 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-sm mx-auto my-auto shrink-0">
            <div className="flex items-center gap-3">
              <CineMobSymbol className="h-8 w-8 text-primary shrink-0" />
              <p className="text-display-lg">
                Cine<span className="text-primary">MOB</span>
              </p>
            </div>

            <EmailAuthForm disabled={isGoogleLoading} onBusyChange={setIsEmailLoading} />

            <div className="my-4 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border-default" />
              <span className="text-micro-caps normal-case text-text-secondary">hoặc</span>
              <span className="h-px flex-1 bg-border-default" />
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleGoogleLogin}
              loading={isGoogleLoading}
              disabled={isEmailLoading}
              leadingIcon={<GoogleIcon className="w-5 h-5 shrink-0" />}
              className="w-full"
              aria-label="Đăng nhập bằng tài khoản Google"
            >
              {isGoogleLoading ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}
            </Button>
          </div>
        </div>

        <footer className="px-4 sm:px-10 lg:px-12 xl:px-16 pb-6 text-micro-caps normal-case text-text-secondary shrink-0">
          <div className="w-full max-w-sm mx-auto">&copy; {new Date().getFullYear()} CineMOB</div>
        </footer>
      </div>

      <div className="hidden lg:flex lg:flex-col order-1 min-w-0">
        {hasWall && (
          <div className="relative flex-1 min-h-64 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5">
              {posters.map((poster) => (
                <PosterTile key={poster.id} poster={poster} />
              ))}
            </div>
          </div>
        )}
        <div className="p-8 xl:p-12 border-t border-border mt-auto">
          <h1 className="text-display-xl">Theo dõi mọi bộ phim bạn xem.</h1>
          <p className="mt-3 max-w-md text-body text-text-secondary leading-relaxed">
            Ghi chép danh sách xem, đánh giá và xây dựng bộ sưu tập điện ảnh của riêng bạn.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
