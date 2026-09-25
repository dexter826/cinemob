import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useInitialLoadStore from '../../stores/initialLoadStore';

interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
  contain?: boolean;
  text?: string;
  className?: string;
}

interface SpinnerProps {
  size: number;
}

function Spinner({ size }: SpinnerProps) {
  return (
  <div className="relative" style={{ width: size, height: size }}>
    <motion.div
      className="absolute inset-0 border-4 border-primary/20 rounded-full"
      style={{ width: size, height: size }}
    />
    <motion.div
      className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
    />
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-xs" />
    </motion.div>
  </div>
  );
}

/** Component hiển thị trạng thái đang tải cao cấp. */
function Loading({ 
  size = 48, 
  fullScreen = true, 
  contain = false,
  text,
  className = ''
}: LoadingProps) {
  const { setPageLoading } = useInitialLoadStore();

  useEffect(() => {
    if (fullScreen || contain) {
      setPageLoading(true);
      return () => {
        setPageLoading(false);
      };
    }
  }, [fullScreen, contain, setPageLoading]);

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Spinner size={size} />
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-xs font-medium text-text-muted"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-100">
        {content}
      </div>
    );
  }

  if (contain) {
    return (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-30">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
