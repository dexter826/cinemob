import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from '../ui/ScrollToTop';
import useInitialLoadStore from '../../stores/initialLoadStore';

interface LayoutProps {
  children: React.ReactNode;
  appReady?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, appReady = true }) => {
  const { isInitialLoadComplete, isPageLoading } = useInitialLoadStore();
  
  const showFooter = appReady && isInitialLoadComplete && !isPageLoading;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 relative pb-20 md:pb-0 min-h-[50vh]">
        {children}
      </div>
      
      <AnimatePresence>
        {showFooter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
};

export default Layout;

