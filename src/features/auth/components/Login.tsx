import React, { useState, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Shield, Loader2, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import logoText from '@/assets/images/logo_text.png';

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const SHOWCASE_FILMS = [
  {
    title: 'Vùng Đất Linh Hồn',
    year: '2001',
    rating: '9.5',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    tiltClass: '-rotate-6 -translate-y-1 sm:-translate-y-2',
    zIndex: 'z-10',
    scaleClass: 'scale-90 sm:scale-95',
  },
  {
    title: 'Interstellar',
    year: '2014',
    rating: '9.3',
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    tiltClass: 'rotate-0 translate-y-0',
    zIndex: 'z-20',
    scaleClass: 'scale-100 sm:scale-105 shadow-primary/20',
    featuredBadge: 'Kiệt tác điện ảnh',
  },
  {
    title: 'Dune: Part Two',
    year: '2024',
    rating: '9.0',
    poster: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    tiltClass: 'rotate-6 translate-y-1 sm:translate-y-2',
    zIndex: 'z-10',
    scaleClass: 'scale-90 sm:scale-95',
  },
];

/** Màn hình đăng nhập tài khoản CineMOB. */
const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="h-dvh max-h-dvh overflow-hidden flex flex-col lg:flex-row bg-background text-text-main relative selection:bg-primary/20 selection:text-primary">
      {/* Brand & Showcase Panel */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 border-b lg:border-b-0 lg:border-r border-border-default bg-surface/20 overflow-y-auto lg:overflow-hidden">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-3">
            <img src={logoText} alt="CineMOB" className="h-7 sm:h-8 w-auto" />
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-10 max-w-xl space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] text-text-main font-display">
              Ghi lại từng thước phim bạn từng sống cùng.
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-text-muted leading-relaxed font-normal max-w-lg">
              CineMOB giúp bạn quản lý kho phim cá nhân, đón lịch chiếu tập mới và khám phá những kiệt tác tiếp theo mà không bị xao nhãng.
            </p>
          </div>
        </div>

        {/* Visual Layered Movie Showcase */}
        <div className="relative my-4 sm:my-6 flex items-center justify-center py-2 sm:py-4">
          {/* Ambient Glow Backdrop */}
          <div className="absolute w-72 h-44 sm:w-96 sm:h-56 bg-gradient-to-r from-primary/15 via-secondary/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

          {/* Cards Stack */}
          <div className="flex items-center justify-center -space-x-8 sm:-space-x-12 lg:-space-x-14">
            {SHOWCASE_FILMS.map((film) => (
              <div
                key={film.title}
                className={`relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 hover:-translate-y-2 cursor-pointer w-28 sm:w-36 lg:w-44 aspect-2/3 shrink-0 bg-surface ${film.tiltClass} ${film.zIndex} ${film.scaleClass}`}
              >
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-secondary text-[10px] sm:text-[11px] font-bold tabular-nums shadow-sm">
                  <Star size={10} className="fill-secondary text-secondary" />
                  <span>{film.rating}</span>
                </div>

                {/* Movie Meta */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-white text-xs sm:text-sm font-bold truncate leading-tight">
                    {film.title}
                  </p>
                  <p className="text-white/60 text-[10px] sm:text-[11px] mt-0.5 font-medium">
                    {film.year}
                  </p>
                  {film.featuredBadge && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] font-semibold text-primary bg-primary/20 backdrop-blur-md px-1.5 py-0.5 rounded border border-primary/30">
                      <Sparkles size={9} />
                      {film.featuredBadge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="pt-2 hidden sm:block">
          <p className="text-xs text-text-muted">
            Không gian lưu giữ và kết nối cảm xúc điện ảnh.
          </p>
        </div>
      </div>

      {/* Auth Panel */}
      <div className="relative z-10 w-full lg:w-[440px] xl:w-[480px] flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-surface overflow-y-auto lg:overflow-hidden shrink-0">
        <div className="my-auto py-4 sm:py-6 max-w-sm w-full mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main font-display">
              Bắt đầu hành trình
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Đồng bộ dữ liệu an toàn trên đám mây để xem trên điện thoại hoặc máy tính.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-surface border border-border-default hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-text-main transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] shadow-sm group"
              aria-label="Đăng nhập bằng tài khoản Google"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin text-primary" aria-hidden="true" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              )}
              <span className="text-sm font-semibold">
                {isLoading ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Shield size={14} className="shrink-0 text-primary" />
              <span>Bảo mật dữ liệu cá nhân qua tài khoản Google</span>
            </div>
          </div>

          {/* Feature Highlights / Value Points */}
          <div className="pt-4 border-t border-border-default space-y-2 text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Đồng bộ lịch sử xem phim đa thiết bị tức thì</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Lịch phát sóng tự động các TV Series yêu thích</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Hoàn toàn miễn phí, không quảng cáo chen ngang</span>
            </div>
          </div>
        </div>

        <footer className="pt-4 sm:pt-6 border-t border-border-default text-xs text-text-muted flex items-center justify-between shrink-0">
          <span>&copy; {new Date().getFullYear()} CineMOB</span>
          <span className="text-[11px] opacity-60">Sổ tay điện ảnh</span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
