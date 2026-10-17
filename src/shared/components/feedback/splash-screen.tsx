import { useReducedMotion } from 'framer-motion';
import LoadingStatus from '../ui/loading-status';
export default function SplashScreen() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="fixed inset-0 z-150 flex flex-col items-center justify-center gap-6 bg-background">
      <span
        className={`font-display text-4xl sm:text-5xl tracking-wide text-text-primary ${reducedMotion ? '' : 'animate-splash-brand'}`}
      >
        Cine<span className="text-primary">MOB</span>
      </span>
      <LoadingStatus className="text-sm text-text-secondary">Đang xác thực…</LoadingStatus>
    </div>
  );
}
