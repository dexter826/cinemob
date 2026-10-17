import React, { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Loader2, Shield, CheckCircle2 } from 'lucide-react';

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

/** Màn hình đăng nhập tài khoản CineMOB — editorial stark trên nền phẳng. */
function Login() {
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
    <main className="h-dvh max-h-dvh overflow-hidden flex flex-col lg:flex-row bg-background text-text-primary relative selection:bg-primary/20 selection:text-primary">
      {/* Brand panel */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto lg:overflow-hidden">
        <div>
          <p
            aria-hidden="true"
            className="w-11 h-[3px] bg-primary mb-6"
          />
          <p className="font-display text-2xl uppercase tracking-wide">Cine<span className="text-primary">MOB</span></p>

          <h1 className="font-display uppercase tracking-wide leading-[1.05] text-3xl sm:text-4xl lg:text-5xl mt-8 lg:mt-12 max-w-xl">
            Mỗi phim bạn xem đều xứng đáng được nhớ.
          </h1>

          <p className="mt-4 text-xs sm:text-sm lg:text-base text-text-secondary leading-relaxed max-w-lg">
            CineMOB là cuốn sổ tay điện ảnh của riêng bạn, nơi lưu lại từng tác phẩm, theo dõi
            từng series và tìm ra phim hay tiếp theo.
          </p>
        </div>

        <p className="pt-2 hidden sm:block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Rạp phim của riêng bạn, mở cửa mọi lúc
        </p>
      </div>

      {/* Auth panel */}
      <div className="relative z-10 w-full lg:w-[440px] xl:w-[480px] flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-surface overflow-y-auto lg:overflow-hidden shrink-0">
        <div className="my-auto py-4 sm:py-6 max-w-sm w-full mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h2 className="font-display uppercase tracking-wide text-2xl sm:text-3xl text-text-primary">
              Bắt đầu
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Đăng nhập để đồng bộ thư viện trên mọi thiết bị.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-control bg-transparent border border-border hover:border-primary hover:text-primary font-bold uppercase tracking-[0.08em] text-xs text-text-primary transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Đăng nhập bằng tài khoản Google"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0" />
              )}
              <span>{isLoading ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              <Shield size={13} className="shrink-0 text-primary" aria-hidden="true" />
              <span>Bảo mật dữ liệu cá nhân qua tài khoản Google</span>
            </div>
          </div>

          {/* Điểm giá trị */}
          <div className="pt-4 border-t border-border space-y-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-primary shrink-0" aria-hidden="true" />
              <span>Đồng bộ tức thì trên mọi thiết bị</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-primary shrink-0" aria-hidden="true" />
              <span>Nhắc lịch chiếu tập mới của series đang theo dõi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-primary shrink-0" aria-hidden="true" />
              <span>Miễn phí, không quảng cáo</span>
            </div>
          </div>
        </div>

        <footer className="pt-4 sm:pt-6 border-t border-border text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary flex items-center justify-between shrink-0">
          <span>&copy; {new Date().getFullYear()} CineMOB</span>
          <span className="opacity-60">Sổ tay điện ảnh</span>
        </footer>
      </div>
    </main>
  );
}

export default Login;
