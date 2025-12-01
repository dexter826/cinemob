import React, { useState, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Film, BarChart3, Sparkles, Shield, Loader2 } from 'lucide-react';

// Feature card data - tách riêng để dễ maintain và tái sử dụng
const FEATURES = [
  {
    icon: Film,
    title: 'Theo dõi phim',
    description: 'Lưu lại mọi bộ phim bạn đã xem',
  },
  {
    icon: BarChart3,
    title: 'Thống kê chi tiết',
    description: 'Trực quan hóa thói quen xem phim',
  },
  {
    icon: Sparkles,
    title: 'Gợi ý thông minh',
    description: 'Khám phá phim mới phù hợp với bạn',
  },
  {
    icon: Shield,
    title: 'Bảo mật dữ liệu',
    description: 'An toàn với đăng nhập Google',
  },
] as const;

// Custom Google Icon component
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
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

// Feature Card component - tách riêng để tái sử dụng
interface FeatureCardProps {
  icon: React.FC<{ size?: number; className?: string }>;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, index }) => (
  <div
    className="group flex items-start gap-2 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl bg-surface/50 backdrop-blur-sm border border-text-main/5 hover:border-primary/20 hover:bg-surface/80 transition-all duration-300"
    style={{ animationDelay: `${600 + index * 100}ms` }}
    role="listitem"
  >
    <div className="shrink-0 p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
      <Icon size={16} className="sm:w-5 sm:h-5" aria-hidden="true" />
    </div>
    <div>
      <h3 className="font-semibold text-text-main text-xs sm:text-sm">{title}</h3>
      <p className="text-text-muted text-[10px] sm:text-xs mt-0.5 leading-tight">{description}</p>
    </div>
  </div>
);

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle login với loading state
  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error được xử lý bởi AuthProvider
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  return (
    <div
      className="min-h-dvh flex flex-col bg-background relative overflow-hidden"
      role="main"
      aria-label="Trang đăng nhập CineMOB"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Primary blob - animated */}
        <div className="absolute -top-1/3 -left-1/4 w-[600px] h-[600px] bg-primary/15 blur-[100px] rounded-full animate-blob" />
        {/* Secondary blob - animated với delay */}
        <div className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] bg-primary/15 blur-[100px] rounded-full animate-blob animation-delay-2000" />
        {/* Third accent blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[80px] rounded-full animate-blob animation-delay-4000" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--color-text-main)/0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-text-main)/0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 z-10">
        <div className="w-full max-w-md">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-5 animate-fade-in">
            {/* Logo Container với glow effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-surface p-3 sm:p-4 rounded-2xl shadow-2xl shadow-primary/10 border border-text-main/5 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo512.png"
                  alt=""
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* App Name & Tagline */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
                Cine<span className="text-primary">MOB</span>
              </h1>
              <p className="text-text-muted text-sm sm:text-base max-w-sm mx-auto leading-relaxed px-4">
                Theo dõi hành trình điện ảnh của bạn. Trực quan hóa lịch sử xem phim một cách đẹp mắt.
              </p>
            </div>
          </div>

          {/* Login Button */}
          <div className="mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 bg-surface border-2 border-text-main/10 rounded-2xl font-semibold text-text-main hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Đăng nhập bằng tài khoản Google"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
              )}
              <span className="text-sm sm:text-base">
                {isLoading ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}
              </span>
            </button>

            {/* Security note */}
            <p className="mt-2.5 text-center text-xs text-text-muted flex items-center justify-center gap-1">
              <Shield size={11} aria-hidden="true" />
              <span>Đăng nhập an toàn qua Google</span>
            </p>
          </div>

          {/* Feature Cards */}
          <div
            className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-8 animate-fade-in"
            style={{ animationDelay: '400ms' }}
            role="list"
            aria-label="Tính năng của CineMOB"
          >
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>

          {/* Footer */}
          <footer
            className="mt-6 sm:mt-8 text-center animate-fade-in"
            style={{ animationDelay: '600ms' }}
          >
            <p className="text-text-muted text-xs">
              &copy; {new Date().getFullYear()} CineMOB. Cine Over B**ch.
            </p>
          </footer>
        </div>
      </div>

      {/* Custom Styles for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(30px, 10px) scale(1.02);
          }
        }
        
        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
