import React from 'react';
import { useAuth } from './AuthProvider';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-secondary/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="z-10 flex flex-col items-center space-y-8 p-8">
        <div className="bg-surface p-4 rounded-2xl shadow-2xl shadow-primary/20 border border-black/5 dark:border-white/5">
          <img src="/logo512.png" alt="Cinemetrics Logo" className="w-16 h-16" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-text-main">
            Cinemetrics
          </h1>
          <p className="text-text-muted text-lg max-w-md">
            Theo dõi hành trình điện ảnh của bạn. Trực quan hóa lịch sử xem phim.
            An toàn, cá nhân và đẹp mắt.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="group relative flex items-center space-x-3 px-8 py-4 bg-text-main text-background rounded-full font-semibold text-lg hover:scale-105 transition-all duration-200 hover:shadow-lg cursor-pointer"
        >
          <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Đăng nhập bằng Google</span>
        </button>
      </div>

      <footer className="absolute bottom-8 text-text-muted text-sm z-10">
        &copy; {new Date().getFullYear()} Cinemetrics. Dành cho những người yêu phim.
      </footer>
    </div>
  );
};

export default Login;
