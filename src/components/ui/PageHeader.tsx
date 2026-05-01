import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/** Component tiêu đề trang chuẩn cho toàn bộ ứng dụng */
const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <Icon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">{title}</h1>
          {description && (
            <p className="text-xs sm:text-sm text-text-muted opacity-80 font-medium">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
