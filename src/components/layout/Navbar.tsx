import React, { useState } from 'react';
import { LogOut, Sun, Moon, BarChart2, Menu, X, Dice5, Folder, Download, ChevronDown, Clapperboard, Search, CalendarDays, Settings } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import RandomPickerModal from '../modals/RandomPickerModal';
import ExportModal from '../modals/ExportModal';
import useExportStore from '../../stores/exportStore';
import useAlertStore from '../../stores/alertStore';
import logoText from '../../assets/images/logo_text.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isExportModalOpen, setIsExportModalOpen, movies } = useExportStore();
  const { showAlert } = useAlertStore();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <>
      <nav className="border-b border-border-default bg-surface/70 backdrop-blur-3xl sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logoText} alt="CineMOB Logo" className="h-7 md:h-8 w-auto" />
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8 space-x-1">
            <button
              onClick={() => navigate('/search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${location.pathname === '/search' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-text-main'}`}
            >
              <Search size={18} />
              <span>Tìm phim</span>
            </button>

            <button
              onClick={() => navigate('/stats')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${location.pathname === '/stats' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-text-main'}`}
            >
              <BarChart2 size={18} />
              <span>Thống kê</span>
            </button>

            <button
              onClick={() => navigate('/albums')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${location.pathname.startsWith('/albums') ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-text-main'}`}
            >
              <Folder size={18} />
              <span>Album</span>
            </button>

            <button
              onClick={() => navigate('/calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${location.pathname === '/calendar' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-text-main'}`}
            >
              <CalendarDays size={18} />
              <span>Lịch</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRandomOpen(true)}
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-text-main cursor-pointer"
              title="Chọn giúp tôi"
            >
              <Dice5 size={20} />
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-text-main cursor-pointer"
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center gap-2 p-1 md:px-3 md:py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-border-default hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer min-w-[36px] min-h-[36px]"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <ChevronDown size={14} className={`hidden md:block transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface/90 backdrop-blur-2xl border border-border-default rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border-default bg-black/5 dark:bg-white/5">
                    <p className="text-sm font-semibold text-text-main truncate">{user?.displayName}</p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => { setIsExportModalOpen(true); setIsDropdownOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer rounded-xl"
                    >
                      <Download size={18} />
                      <span>Xuất dữ liệu</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        showAlert({
                          title: 'Xác nhận đăng xuất',
                          message: 'Bạn có chắc chắn muốn đăng xuất?',
                          type: 'danger',
                          confirmText: 'Đăng xuất',
                          cancelText: 'Hủy',
                          onConfirm: logout,
                        });
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer rounded-xl"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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
