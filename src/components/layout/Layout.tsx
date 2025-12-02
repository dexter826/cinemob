import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import useInitialLoadStore from '../../stores/initialLoadStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isInitialLoadComplete } = useInitialLoadStore();

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <AnimatePresence>
        {isInitialLoadComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollToTop />
    </div>
  );
};

export default Layout;
