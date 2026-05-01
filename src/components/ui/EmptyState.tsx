import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/** Component hiển thị trạng thái trống (không có dữ liệu). */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}
    >
      <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-border-default shadow-sm group hover:border-primary/30 transition-colors">
        {Icon ? (
          <Icon className="text-text-muted group-hover:text-primary transition-colors opacity-40 group-hover:opacity-100" size={40} />
        ) : (
          <div className="w-10 h-10 bg-primary/20 rounded-full animate-pulse" />
        )}
      </div>
      
      <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">
        {title}
      </h3>
      
      <p className="text-text-muted/60 text-sm mb-8 max-w-xs leading-relaxed">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:shadow-premium hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
