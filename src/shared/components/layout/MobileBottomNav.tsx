import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Folder, BarChart2, CalendarDays } from 'lucide-react';
import { NAV_ITEMS, isNavItemActive } from './navigation';

const NAV_ICONS: Record<string, typeof Home> = {
  '/': Home,
  '/search': Search,
  '/albums': Folder,
  '/stats': BarChart2,
  '/calendar': CalendarDays,
};

function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="md:hidden fixed left-4 right-4 bg-surface-elevated border border-border rounded-2xl shadow-elevated z-40"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 12px))' }}
    >
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.to] ?? Home;
          const isActive = isNavItemActive(location.pathname, item);

          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full min-h-16 px-1 cursor-pointer"
            >
              <span className={`relative p-2 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
              </span>
              <span
                aria-hidden="true"
                className={`h-1 w-6 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-transparent'}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
