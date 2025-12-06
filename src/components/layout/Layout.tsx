import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import useInitialLoadStore from '../../stores/initialLoadStore';

interface LayoutProps {
  children: React.ReactNode;
  appReady?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, appReady = true }) => {
  const { isInitialLoadComplete, isPageLoading } = useInitialLoadStore();
  
  // Footer chỉ hiển thị khi:
  // 1. App đã ready (không còn SplashScreen)
  // 2. Initial load complete
  // 3. KHÔNG có page nào đang loading
  const showFooter = appReady && isInitialLoadComplete && !isPageLoading;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <div className="flex-1">
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
      <ScrollToTop />
    </div>
  );
};

export default Layout;
