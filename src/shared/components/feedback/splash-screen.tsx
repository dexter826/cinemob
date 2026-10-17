import { useCallback, useEffect, useRef } from 'react';
import logoText from '@/assets/images/logo_text.png';

interface SplashScreenProps {
  onAnimationFinish: () => void;
  staticMode?: boolean;
}

const SPLASH_DURATION_MS = 1500;

/** Khung thương hiệu tĩnh/CSS — thay thế animation trước đây. */
function BrandFrame({ animated }: { animated: boolean }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-150 bg-background overflow-hidden">
      <img
        src={logoText}
        alt="CineMOB"
        width={160}
        height={40}
        className={`h-10 w-auto ${animated ? 'animate-splash-brand' : ''}`}
      />
      <span
        aria-hidden="true"
        className={`h-[3px] w-11 bg-primary origin-left ${animated ? 'animate-splash-rule' : ''}`}
      />
    </div>
  );
}

function SplashScreen({ onAnimationFinish, staticMode = false }: SplashScreenProps) {
  const completionNotifiedRef = useRef(false);

  const notifyAnimationFinish = useCallback(() => {
    if (completionNotifiedRef.current) return;
    completionNotifiedRef.current = true;
    onAnimationFinish();
  }, [onAnimationFinish]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (staticMode) {
      notifyAnimationFinish();
      return;
    }
    const timer = setTimeout(notifyAnimationFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notifyAnimationFinish, staticMode]);

  return <BrandFrame animated={!staticMode} />;
}

export default SplashScreen;
