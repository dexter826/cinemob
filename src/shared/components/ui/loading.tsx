import Spinner from './spinner';
interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
  contain?: boolean;
  text?: string;
  className?: string;
}
/** Loading mặc định cục bộ; fullscreen phải chọn tường minh (dành cho bootstrap). */
function Loading({
  size = 40,
  fullScreen = false,
  contain = false,
  text = 'Đang tải…',
  className = '',
}: LoadingProps) {
  const placement = fullScreen
    ? 'fixed inset-0 z-100 bg-background'
    : contain
      ? 'absolute inset-0 z-30 bg-background/50'
      : 'py-6';
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex flex-col items-center justify-center gap-3 ${placement} ${className}`}
    >
      <Spinner size={size} />
      <span className="text-body-sm font-medium text-text-secondary">{text}</span>
    </div>
  );
}
export default Loading;
