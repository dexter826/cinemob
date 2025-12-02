import React from 'react';
import { Disc3 } from 'lucide-react';

interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 40, 
  fullScreen = true, 
  text,
  className = ''
}) => {
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-background flex flex-col items-center justify-center text-primary z-40 ${className}`}>
        <Disc3 className="animate-spin" size={size} />
        {text && <p className="mt-4 text-text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-primary ${className}`}>
      <Disc3 className="animate-spin" size={size} />
      {text && <p className="mt-4 text-text-muted">{text}</p>}
    </div>
  );
};

export default Loading;
