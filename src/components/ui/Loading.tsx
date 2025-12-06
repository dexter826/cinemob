import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Disc3 } from 'lucide-react';
import useInitialLoadStore from '../../stores/initialLoadStore';

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
  const { setPageLoading } = useInitialLoadStore();

  // Khi Loading fullScreen mount/unmount, cập nhật global state
  useEffect(() => {
    if (fullScreen) {
      setPageLoading(true);
      return () => {
        setPageLoading(false);
      };
    }
  }, [fullScreen, setPageLoading]);

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-background flex flex-col items-center justify-center text-primary z-50 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <Disc3 size={size} />
        </motion.div>
        {text && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-4 text-text-muted"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-primary ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <Disc3 size={size} />
      </motion.div>
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-4 text-text-muted"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loading;
