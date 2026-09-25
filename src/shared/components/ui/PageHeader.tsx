import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

/** Component tiêu đề trang chuẩn cho toàn bộ ứng dụng */
const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, description, children, onBack, className = '' }) => {
  return (
    <div className={`flex items-center justify-between gap-3 sm:gap-6 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-surface border border-border-default flex items-center justify-center text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-premium shrink-0"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Icon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-text-main truncate">{title}</h1>
            {description && (
              <p className="text-[10px] sm:text-xs md:text-sm text-text-muted opacity-60 font-bold uppercase tracking-widest truncate">{description}</p>
            )}
          </div>
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
