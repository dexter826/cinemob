import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Loader2 } from 'lucide-react';
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

/** Lấy poster trending để dựng tường nền login — trang trí thuần, lỗi thì bỏ qua. */
function useWallPosters(): TMDBMovieResult[] {
  const [posters, setPosters] = useState<TMDBMovieResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTrendingMovies().then((data) => {
      if (cancelled) return;
      setPosters((data?.results ?? []).filter((m) => m.poster_path).slice(0, WALL_COUNT));
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
      draggable={false}
      className="w-full h-full object-cover"
    />
  );
}

/** Màn đăng nhập — bìa tạp chí: tường poster bên trái, cột form lệch trục trái bên phải. */
function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const posters = useWallPosters();

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  const hasWall = posters.length >= WALL_COUNT;

  return (
    <main className="min-h-dvh lg:h-dvh lg:overflow-hidden grid bg-background text-text-primary selection:bg-primary/20 selection:text-primary lg:grid-cols-[11fr_9fr] lg:grid-rows-1">
      <div className="order-1 lg:order-2 flex flex-col border-b border-border lg:border-b-0 lg:border-l min-h-0">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 overflow-y-auto">
          <div className="w-full max-w-sm">
            <p aria-hidden="true" className="w-11 h-[3px] bg-primary mb-7" />
            <p className="font-display text-2xl tracking-wide">
              Cine<span className="text-primary">MOB</span>
            </p>

            <h1 className="font-display tracking-wide leading-[1.05] text-3xl sm:text-4xl mt-9">
              Theo dõi mọi bộ phim bạn xem.
            </h1>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Ghi chép danh sách xem, đánh giá và xây dựng bộ sưu tập của riêng bạn.
            </p>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="mt-10 w-full flex items-center justify-center gap-3 h-11 px-6 rounded-control bg-primary text-on-primary border border-transparent hover:bg-primary-hover font-bold tracking-[0.08em] text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Đăng nhập bằng tài khoản Google"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-on-primary" aria-hidden="true" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0" />
              )}
              <span>Tiếp tục với Google</span>
            </button>
          </div>
        </div>

        <footer className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 text-[10px] font-semibold tracking-[0.08em] text-text-secondary shrink-0">
          &copy; {new Date().getFullYear()} CineMOB
        </footer>
      </div>

      {hasWall && (
        <div className="order-2 lg:order-1 overflow-hidden min-h-0 h-full">
          <div
            aria-hidden="true"
            className="grid grid-cols-6 gap-0.5 h-24 sm:h-28 lg:hidden"
          >
            {posters.map((poster) => (
              <PosterTile key={poster.id} poster={poster} />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="hidden lg:grid grid-cols-3 grid-rows-2 gap-0.5 h-full w-full"
          >
            {posters.map((poster) => (
              <PosterTile key={poster.id} poster={poster} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;
