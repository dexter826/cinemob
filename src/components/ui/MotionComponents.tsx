import React from 'react';
import { motion, Variants } from 'framer-motion';

// Container variants for stagger effect
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Card item variants
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  }
};

// Hover animation config
export const cardHoverConfig = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const cardTapConfig = {
  scale: 0.98
};

interface MotionContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Animated container for list of cards
export const MotionContainer: React.FC<MotionContainerProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MotionCardWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  index?: number;
}

// Animated wrapper for individual cards
export const MotionCardWrapper: React.FC<MotionCardWrapperProps> = ({ 
  children, 
  className = '',
  enableHover = true,
  index
}) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={enableHover ? cardHoverConfig : undefined}
      whileTap={enableHover ? cardTapConfig : undefined}
      className={className}
      custom={index}
    >
      {children}
    </motion.div>
  );
};

// Fade in animation for simple elements
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Slide up animation
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  }
};

// Scale animation for modals/overlays
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export default MotionCardWrapper;
