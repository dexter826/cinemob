import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import Loading from '@/shared/components/ui/Loading';
import logoText from '@/assets/images/logo_text.png';

interface SplashScreenProps {
  onAnimationFinish: () => void;
  showLoading?: boolean;
  staticMode?: boolean;
}

const SPLASH_FETCH_TIMEOUT_MS = 8000;

function StaticBrandFrame({ showLoading }: { showLoading: boolean }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-150 bg-background overflow-hidden">
      <img src={logoText} alt="CineMOB" className="h-10 w-auto" />
      {showLoading && <Loading fullScreen={false} size={40} />}
    </div>
  );
}

function SplashScreen({ onAnimationFinish, showLoading = false, staticMode = false }: SplashScreenProps) {
  const [animationData, setAnimationData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (staticMode) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SPLASH_FETCH_TIMEOUT_MS);

    fetch('/data/splashscreen.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load animation');
        return response.json();
      })
      .then(data => setAnimationData(data))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Splash animation timed out, using static brand frame');
        } else {
          console.warn('Splash animation failed to load, using static brand frame');
        }
        setFailed(true);
        onAnimationFinish();
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [staticMode, onAnimationFinish]);

  if (staticMode || failed) {
    return <StaticBrandFrame showLoading={showLoading} />;
  }

  if (!animationData) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-150 bg-background overflow-hidden">
      <div className="w-80 h-80 md:w-96 md:h-96 shrink-0 relative">
        <Lottie
          animationData={animationData}
          loop={false}
          onComplete={onAnimationFinish}
        />
        {showLoading && (
          <div className="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 z-10">
            <Loading fullScreen={false} size={40} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SplashScreen;
