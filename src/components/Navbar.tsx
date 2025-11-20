import React, { useState } from 'react';
import { LogOut, Sun, Moon, BarChart2, Menu, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="border-b border-black/5 dark:border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img src="/logo192.png" alt="Cinemetrics Logo" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight text-text-main">Cinemetrics</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-text-main"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 bottom-0 w-72 bg-surface border-l border-black/5 dark:border-white/5 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
            <span className="font-bold text-lg text-text-main">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-text-main"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {/* User Info */}
             <div className="flex items-center space-x-3 p-3 mb-4 bg-black/5 dark:bg-white/5 rounded-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary"></div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-text-main">{user?.displayName}</span>
                <span className="text-xs text-text-muted">Member</span>
              </div>
            </div>

            <button
              onClick={() => { navigate('/stats'); setIsMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/stats' ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
            >
              <BarChart2 size={20} />
              <span>Thống kê</span>
            </button>

            <button
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false); }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-text-main transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
            </button>
          </div>

          <div className="p-4 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => { logout(); setIsMenuOpen(false); }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
