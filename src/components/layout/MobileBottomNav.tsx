import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Folder, BarChart2, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Search, label: 'Tìm kiếm', path: '/search' },
    { icon: Folder, label: 'Album', path: '/albums' },
    { icon: BarChart2, label: 'Thống kê', path: '/stats' },
    { icon: CalendarDays, label: 'Lịch', path: '/calendar' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-2xl border-t border-border-default pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
            >
              <div className={`relative p-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-1 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
