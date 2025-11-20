import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, icon: Icon, colorClass }) => {
  return (
    <div className="bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl flex items-center space-x-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <div className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-text-muted text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-text-main">{value}</h3>
        {subValue && <p className="text-xs text-text-muted mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
