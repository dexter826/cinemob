import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Folder, CalendarDays, BarChart2 } from 'lucide-react';
import { NAV_ITEMS, isNavItemActive } from '@/shared/config/navigation';

const NAV_ICONS: Record<string, typeof Home> = {
  '/': Home,
  '/search': Search,
  '/stats': BarChart2,
  '/albums': Folder,
  '/calendar': CalendarDays,
};

function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Điều hướng dưới"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.to] ?? Home;
          const isActive = isNavItemActive(location.pathname, item);

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 min-h-14 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className={`absolute top-0 inset-x-[22%] h-0.5 bg-primary transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                aria-hidden="true"
                className={isActive ? 'text-primary' : 'text-text-secondary'}
              />
              <span
                className={`text-micro-caps ${isActive ? 'text-primary' : 'text-text-secondary'}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
