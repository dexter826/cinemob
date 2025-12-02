import React from 'react';
import { motion } from 'framer-motion';
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
