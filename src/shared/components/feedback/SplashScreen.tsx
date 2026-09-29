import { useCallback, useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import logoText from '@/assets/images/logo_text.png';

interface SplashScreenProps {
  onAnimationFinish: () => void;
  staticMode?: boolean;
}

const SPLASH_FETCH_TIMEOUT_MS = 8000;

function StaticBrandFrame() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-150 bg-background overflow-hidden">
      <img src={logoText} alt="CineMOB" className="h-10 w-auto" />
    </div>
  );
}

function SplashScreen({ onAnimationFinish, staticMode = false }: SplashScreenProps) {
  const [animationData, setAnimationData] = useState(null);
  const [failed, setFailed] = useState(false);
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
    if (staticMode) notifyAnimationFinish();
  }, [notifyAnimationFinish, staticMode]);

  useEffect(() => {
    if (staticMode) return;
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, SPLASH_FETCH_TIMEOUT_MS);

    fetch('/data/splashscreen.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load animation');
        return response.json();
      })
      .then((data) => setAnimationData(data))
      .catch((error: unknown) => {
        const isAbortError =
          typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          error.name === 'AbortError';
        if (isAbortError && !timedOut) return;
        console.warn('Splash animation failed to load, using static brand frame');
        setFailed(true);
        notifyAnimationFinish();
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [notifyAnimationFinish, staticMode]);

  if (staticMode || failed) {
    return <StaticBrandFrame />;
  }

  if (!animationData) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-150 bg-background overflow-hidden">
      <div className="w-80 h-80 md:w-96 md:h-96 shrink-0 relative">
        <Lottie animationData={animationData} loop={false} onComplete={notifyAnimationFinish} />
      </div>
    </div>
  );
}

export default SplashScreen;
