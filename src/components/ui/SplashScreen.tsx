import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/data/splashscreen.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error fetching animation data:', error));
  }, []);

  if (!animationData) {
    return null; // Or a loading indicator
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-background">
      <div className="w-96 h-96 md:w-lg md:h-lg">
        <Lottie
          animationData={animationData}
          loop={false}
          onComplete={onAnimationFinish}
        />
      </div>
      {/* <h1 className="text-3xl font-bold text-[#59C763] tracking-tight -mt-4">Cinemetrics</h1> */}
    </div>
  );
};

export default SplashScreen;
