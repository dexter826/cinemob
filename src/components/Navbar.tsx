import React, { useState } from 'react';
import { LogOut, Sun, Moon, BarChart2, Menu, X, Dice5, Folder, Download } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import RandomPickerModal from './RandomPickerModal';
import ExportModal from './ExportModal';
import { useExport } from './ExportContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const { isExportModalOpen, setIsExportModalOpen, movies } = useExport();

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
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/logo_text.png" alt="Cinemetrics Logo" className="h-8 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/stats')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${location.pathname === '/stats' ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
              title="Thống kê"
            >
              <BarChart2 size={20} />
            </button>

            <button
              onClick={() => navigate('/albums')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${location.pathname.startsWith('/albums') ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
              title="Album phim"
            >
              <Folder size={20} />
            </button>

            <button
              onClick={() => setIsRandomOpen(true)}
              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary text-text-main"
              title="Chọn giúp tôi"
            >
              <Dice5 size={20} />
            </button>

            {location.pathname === '/' && (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary text-text-main"
                title="Xuất dữ liệu"
              >
                <Download size={20} />
              </button>
            )}

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-text-main cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
              onClick={logout}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-text-main cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 mr-1 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-text-main cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-text-main cursor-pointer"
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
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-text-main cursor-pointer"
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
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer ${location.pathname === '/stats' ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
            >
              <BarChart2 size={20} />
              <span>Thống kê</span>
            </button>

            <button
              onClick={() => { navigate('/albums'); setIsMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer ${location.pathname.startsWith('/albums') ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main'}`}
            >
              <Folder size={20} />
              <span>Album phim</span>
            </button>

            <button
              onClick={() => { setIsRandomOpen(true); setIsMenuOpen(false); }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/10 text-text-main transition-colors cursor-pointer"
            >
              <Dice5 size={20} />
              <span>Chọn giúp tôi</span>
            </button>

            {location.pathname === '/' && (
              <button
                onClick={() => { setIsExportModalOpen(true); setIsMenuOpen(false); }}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/10 text-text-main transition-colors cursor-pointer"
              >
                <Download size={20} />
                <span>Xuất dữ liệu</span>
              </button>
            )}

          </div>

          <div className="p-4 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => { logout(); setIsMenuOpen(false); }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <RandomPickerModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        movies={movies}
      />
    </>
  );
};

export default Navbar;
