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

/** Component hiển thị trạng thái đang tải cao cấp. */
const Loading: React.FC<LoadingProps> = ({ 
  size = 48, 
  fullScreen = true, 
  contain = false,
  text,
  className = ''
}) => {
  const { setPageLoading } = useInitialLoadStore();

  useEffect(() => {
    if (fullScreen || contain) {
      setPageLoading(true);
      return () => {
        setPageLoading(false);
      };
    }
  }, [fullScreen, contain, setPageLoading]);

  const Spinner = () => (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 border-4 border-primary/20 rounded-full"
        style={{ width: size, height: size }}
      />
      {/* Animated Inner Ring */}
      <motion.div
        className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      {/* Inner Dot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary" />
      </motion.div>
    </div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Spinner />
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60"
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
