import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { LogOut, Sun, Moon, BarChart2, Dice5, ChevronDown, User, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useTheme } from '@/app/providers/theme-provider';
import { Link, useLocation } from 'react-router-dom';

import useAlertStore from '@/shared/stores/alert-store';
import { NAV_ITEMS, isNavItemActive } from '@/shared/config/navigation';
import { IconButton } from '@/shared/components/ui/icon-button';

const RandomPickerModal = lazy(() => import('@/features/movies/components/random-picker-modal'));
const MemberSearchModal = lazy(
  () => import('@/features/profile/components/user/member-search-modal'),
);

function Navbar() {
  const { user, logout } = useAuth();
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [user?.photoURL]);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const { showAlert } = useAlertStore();

  const closeDropdown = () => setIsDropdownOpen(false);
  const closeAndRestoreFocus = () => {
    setIsDropdownOpen(false);
    triggerRef.current?.focus();
  };

  // Menu mở: đưa focus vào mục đầu tiên (pattern ARIA menu).
  React.useEffect(() => {
    if (isDropdownOpen) {
      accountMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }, [isDropdownOpen]);

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const items = Array.from(
      accountMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (!items.length) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1 + items.length) % items.length;
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex].focus();
    }
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
      <header className="sticky top-0 z-50 bg-background">
        <nav
          aria-label="Điều hướng chính"
          className="h-14 max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 xl:gap-6 min-w-0">
            <Link
              to="/"
              className="flex items-baseline gap-2.5 shrink-0 cursor-pointer"
              aria-label="Về Thư viện CineMOB"
            >
              <span className="font-display text-xl uppercase tracking-wide select-none">
                Cine<span className="text-primary">MOB</span>
              </span>
              <span
                aria-hidden="true"
                className="hidden xl:inline text-[9px] font-semibold tracking-[0.18em] uppercase text-text-faint whitespace-nowrap"
              >
                Phòng chiếu gia đình
              </span>
            </Link>

            <div className="hidden md:flex items-center min-w-0">
              {NAV_ITEMS.map((item, index) => {
                const active = isNavItemActive(location.pathname, item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-1.5 h-14 px-2 lg:px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap ${
                      active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`hidden lg:inline text-[9px] tabular-nums tracking-[0.1em] ${
                        active ? 'text-primary' : 'text-text-faint'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0 h-0.5 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <IconButton label="Tìm thành viên" onClick={() => setIsMemberSearchOpen(true)}>
              <Users size={20} strokeWidth={1.5} aria-hidden="true" />
            </IconButton>

            <IconButton
              label="Chọn ngẫu nhiên phim"
              title="Chọn ngẫu nhiên phim"
              onClick={() => setIsRandomOpen(true)}
            >
              <Dice5 size={20} strokeWidth={1.5} aria-hidden="true" />
            </IconButton>

            <IconButton
              label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
            </IconButton>

            <div className="relative dropdown-container">
              <button
                type="button"
                ref={triggerRef}
                onClick={() => (isDropdownOpen ? closeAndRestoreFocus() : setIsDropdownOpen(true))}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' && !isDropdownOpen) {
                    event.preventDefault();
                    setIsDropdownOpen(true);
                  }
                }}
                aria-label="Mở menu người dùng"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-controls="account-menu"
                className="flex items-center justify-center gap-2 p-1 md:px-3 md:py-1.5 rounded-control border border-transparent hover:border-border transition-colors cursor-pointer min-w-9 min-h-9"
              >
                {user?.photoURL && !isAvatarLoadFailed ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    onError={() => setIsAvatarLoadFailed(true)}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`hidden md:block transition-colors shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  id="account-menu"
                  ref={accountMenuRef}
                  role="menu"
                  aria-label="Menu tài khoản"
                  onKeyDown={handleMenuKeyDown}
                  className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-card z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user?.displayName}
                    </p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to={user ? `/profile/${user.uid}` : '/'}
                      role="menuitem"
                      tabIndex={-1}
                      onClick={closeDropdown}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer rounded-control"
                    >
                      <User size={18} strokeWidth={1.5} aria-hidden="true" />
                      <span>Hồ sơ</span>
                    </Link>
                    <Link
                      to="/stats"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={closeDropdown}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer rounded-control"
                    >
                      <BarChart2 size={18} strokeWidth={1.5} aria-hidden="true" />
                      <span>Thống kê</span>
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
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
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-danger/10 text-danger transition-colors duration-200 cursor-pointer rounded-control"
                    >
                      <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
        <div aria-hidden="true" className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="h-px bg-border" />
          <div className="mt-[3px] h-px bg-border-default" />
        </div>
      </header>

      {isRandomOpen && (
        <Suspense fallback={null}>
          <RandomPickerModal isOpen onClose={() => setIsRandomOpen(false)} />
        </Suspense>
      )}

      {isMemberSearchOpen && (
        <Suspense fallback={null}>
          <MemberSearchModal isOpen onClose={() => setIsMemberSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

export default Navbar;
