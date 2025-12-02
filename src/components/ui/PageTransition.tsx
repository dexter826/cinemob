import React from 'react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  in: { 
    opacity: 1, 
    y: 0 
  },
  out: { 
    opacity: 0, 
    y: -10 
  }
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
