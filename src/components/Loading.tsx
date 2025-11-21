import React from 'react';
import { Loader2 } from 'lucide-react';

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
      <div className={`min-h-screen bg-background flex flex-col items-center justify-center text-primary ${className}`}>
        <Loader2 className="animate-spin" size={size} />
        {text && <p className="mt-4 text-text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-primary ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      {text && <p className="mt-4 text-text-muted">{text}</p>}
    </div>
  );
};

export default Loading;
