import React, { lazy, Suspense, useRef, useState } from 'react';
import { LogOut, Sun, Moon, BarChart2, Dice5, Folder, Download, ChevronDown, Search, CalendarDays, Camera, Home } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChangeAvatarModal } from '@/features/auth/components/ChangeAvatarModal';
import useExportStore from '@/features/movies/stores/exportStore';
import useAlertStore from '@/shared/stores/alertStore';
import { NAV_ITEMS, isNavItemActive } from './navigation';
import { IconButton } from '../ui/IconButton';
import logoText from '@/assets/images/logo_text.png';

const RandomPickerModal = lazy(() => import('@/features/movies/components/RandomPickerModal'));
const ExportModal = lazy(() => import('@/features/movies/components/ExportModal'));

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': <Home size={18} strokeWidth={1.5} aria-hidden="true" />,
  '/search': <Search size={18} strokeWidth={1.5} aria-hidden="true" />,
  '/stats': <BarChart2 size={18} strokeWidth={1.5} aria-hidden="true" />,
  '/albums': <Folder size={18} strokeWidth={1.5} aria-hidden="true" />,
  '/calendar': <CalendarDays size={18} strokeWidth={1.5} aria-hidden="true" />,
};

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isExportModalOpen, setIsExportModalOpen, movies } = useExportStore();
  const { showAlert } = useAlertStore();

  const closeDropdown = () => setIsDropdownOpen(false);
  const closeAndRestoreFocus = () => {
    setIsDropdownOpen(false);
    triggerRef.current?.focus();
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        closeDropdown();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) closeAndRestoreFocus();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <div className="sticky top-4 z-50 w-full px-4 md:px-6 pointer-events-none flex justify-center mb-6">
        <nav aria-label="Điều hướng chính" className="pointer-events-auto w-full max-w-5xl bg-surface border border-border rounded-2xl sm:rounded-full px-4 md:px-5 h-14 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center cursor-pointer rounded-control"
            onClick={() => navigate('/')}
            aria-label="Về Thư viện CineMOB"
          >
            <img src={logoText} alt="CineMOB Logo" className="h-7 md:h-8 w-auto" />
          </button>

          <div className="hidden md:flex items-center justify-center flex-1 mx-8 space-x-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(location.pathname, item);
              return (
                <button
                  type="button"
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                    active ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-text-primary'
                  }`}
                >
                  {NAV_ICONS[item.to]}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <IconButton
              label="Chọn ngẫu nhiên phim"
              title="Chọn giúp tôi"
              onClick={() => setIsRandomOpen(true)}
            >
              <Dice5 size={20} strokeWidth={1.5} aria-hidden="true" />
            </IconButton>

            <IconButton
              label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark'
                ? <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
                : <Moon size={20} strokeWidth={1.5} aria-hidden="true" />}
            </IconButton>

            <div className="relative dropdown-container">
              <button
                type="button"
                ref={triggerRef}
                onClick={() => (isDropdownOpen ? closeAndRestoreFocus() : setIsDropdownOpen(true))}
                aria-label="Mở menu người dùng"
                aria-expanded={isDropdownOpen}
                aria-controls="account-menu"
                className="flex items-center justify-center gap-2 p-1 md:px-3 md:py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-border hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer min-w-9 min-h-9"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <ChevronDown size={14} className={`hidden md:block transition-colors shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div id="account-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-2xl shadow-elevated z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-black/5 dark:bg-white/5">
                    <p className="text-sm font-semibold text-text-primary truncate">{user?.displayName}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setIsAvatarModalOpen(true); closeDropdown(); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer rounded-xl"
                    >
                      <Camera size={18} strokeWidth={1.5} />
                      <span>Đổi ảnh đại diện</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setIsExportModalOpen(true); closeDropdown(); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer rounded-xl"
                    >
                      <Download size={18} strokeWidth={1.5} />
                      <span>Xuất dữ liệu</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        showAlert({
                          title: 'Xác nhận đăng xuất',
                          message: 'Bạn có chắc chắn muốn đăng xuất?',
                          type: 'danger',
                          confirmText: 'Đăng xuất',
                          cancelText: 'Hủy',
                          onConfirm: logout,
                        });
                        closeDropdown();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-danger/10 text-danger transition-colors duration-200 cursor-pointer rounded-xl"
                    >
                      <LogOut size={18} strokeWidth={1.5} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {isRandomOpen && (
        <Suspense fallback={null}>
          <RandomPickerModal isOpen onClose={() => setIsRandomOpen(false)} />
        </Suspense>
      )}

      {isExportModalOpen && (
        <Suspense fallback={null}>
          <ExportModal isOpen onClose={() => setIsExportModalOpen(false)} movies={movies} />
        </Suspense>
      )}

      <ChangeAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
