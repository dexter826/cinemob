import { useReducedMotion } from 'framer-motion';
import LoadingStatus from '../ui/loading-status';
import CineMobSymbol from '../ui/cinemob-symbol';

export default function SplashScreen() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="fixed inset-0 z-150 flex flex-col items-center justify-center gap-6 bg-background">
      <div
        className={`flex flex-col items-center gap-4 ${reducedMotion ? '' : 'animate-splash-brand'}`}
      >
        <CineMobSymbol className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
        <span className="text-brand tracking-wide text-text-primary">
          Cine<span className="text-primary">MOB</span>
        </span>
      </div>
      <LoadingStatus className="text-body text-text-secondary">Đang xác thực…</LoadingStatus>
    </div>
  );
}
