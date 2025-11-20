import React from 'react';
import { LogOut, Sun, Moon, BarChart2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="border-b border-black/5 dark:border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img src="/logo192.png" alt="Cinemetrics Logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-text-main">Cinemetrics</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/stats')}
            className={`p-2 rounded-lg transition-colors ${location.pathname === '/stats' ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
            title="Thống kê"
          >
            <BarChart2 size={20} />
          </button>

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary"></div>
            )}
            <span className="hidden md:inline text-sm font-medium text-text-main">{user?.displayName}</span>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-text-main"
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-text-main"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
