import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Disc3 } from 'lucide-react';

interface SplashScreenProps {
  onAnimationFinish: () => void;
  showLoading?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish, showLoading = false }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Prevent scrolling on body when splash screen is active
    document.body.style.overflow = 'hidden';
    
    fetch('/data/splashscreen.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error fetching animation data:', error));

    return () => {
      // Restore scrolling when splash screen unmounts
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!animationData) {
    return null; // Or a loading indicator
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-60 bg-background overflow-hidden">
      <div className="w-80 h-80 md:w-96 md:h-96 shrink-0 relative">
        <Lottie
          animationData={animationData}
          loop={false}
          onComplete={onAnimationFinish}
        />
        {showLoading && (
          <div className="absolute bottom-36 md:bottom-44 left-1/2 -translate-x-1/2 z-10">
            <Disc3 className="animate-spin text-primary" size={40} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
