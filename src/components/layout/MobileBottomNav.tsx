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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-3xl border-t border-border-default pb-safe z-40">
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
              className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 active:scale-95"
            >
              <div className={`relative p-2 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.2 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors mt-1 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
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
