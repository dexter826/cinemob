import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
    pullDistance: number;
    isRefreshing: boolean;
    progress: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
    pullDistance,
    isRefreshing,
    progress,
}) => {
    if (pullDistance === 0 && !isRefreshing) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-200"
            style={{
                transform: `translateY(${Math.min(pullDistance, 80)}px)`,
                opacity: Math.min(progress, 1),
            }}
        >
            <div className="bg-surface border border-border-default rounded-full p-3 shadow-premium">
                <RefreshCw
                    size={24}
                    className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{
                        transform: isRefreshing ? 'none' : `rotate(${progress * 360}deg)`,
                    }}
                />
            </div>
        </div>
    );
};

export default PullToRefreshIndicator;
