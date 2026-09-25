import { ChevronDown } from 'lucide-react';

interface PickerWheelProps {
  leftSrc: string;
  centerSrc: string;
  rightSrc: string;
  poolLabel: string;
  title: string;
  isShuffling: boolean;
  showTitle: boolean;
  hasResult: boolean;
}

// Vòng quay 3 lá bài + tiêu đề phim đang chọn.
export function PickerWheel({
  leftSrc,
  centerSrc,
  rightSrc,
  poolLabel,
  title,
  isShuffling,
  showTitle,
  hasResult,
}: PickerWheelProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel of Fortune Layout - Fixed positions, changing content */}
      <div className="relative w-80 h-60 flex items-center justify-center movie-wheel-container">

        {/* Left Side Card */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 rotate-[-15deg] w-24 h-36 z-10 opacity-70 rounded-xl overflow-hidden">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-border-default dark:border-white/10">
            <img
              src={leftSrc}
              alt="Left movie"
              className={`w-full h-full object-cover transition-colors duration-200 ${isShuffling ? 'animate-pulse-soft' : ''}`}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>

        {/* Center Card - Main focus */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-52 z-30">
          <div className={`w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 border-primary center-card-glow ${isShuffling ? 'animate-pulse-soft' : 'animate-card-float'}`}>
            <img
              src={centerSrc}
              alt="Center movie"
              className="w-full h-full object-cover transition-colors duration-200"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />


          </div>
        </div>

        {/* Right Side Card */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 rotate-15 w-24 h-36 z-10 opacity-70 rounded-xl overflow-hidden">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-border-default dark:border-white/10">
            <img
              src={rightSrc}
              alt="Right movie"
              className={`w-full h-full object-cover transition-colors duration-200 ${isShuffling ? 'animate-pulse-soft' : ''}`}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>

        {/* Selection Indicator Arrow */}
        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-surface border border-primary/50 flex items-center justify-center text-primary shadow-md">
            <ChevronDown size={16} strokeWidth={2.5} />
          </div>
        </div>


      </div>

      <div className="text-center space-y-2">
        <p className="text-xs text-primary font-semibold">
          {poolLabel}
        </p>
        {showTitle && (
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-text-main line-clamp-2 font-display" title={title}>
              {title}
            </h3>
            <p className="text-sm text-text-muted">
              {hasResult ? 'Đã tìm thấy tác phẩm dành riêng cho bạn' : 'Phim được chọn ngẫu nhiên'}
            </p>
          </div>
        )}
        {isShuffling && (
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-text-main animate-pulse font-display">
              Đang chọn ngẫu nhiên…
            </h3>
            <p className="text-sm text-text-muted animate-pulse">
              Đang xáo trộn các đề xuất phim phù hợp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
