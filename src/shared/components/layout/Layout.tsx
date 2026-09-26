import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from '@/shared/components/ui/ScrollToTop';
import useInitialLoadStore from '@/shared/stores/initialLoadStore';

interface LayoutProps {
  children: React.ReactNode;
  appReady?: boolean;
}

function Layout({ children, appReady = true }: LayoutProps) {
  const { isInitialLoadComplete, isPageLoading } = useInitialLoadStore();
  
  const showFooter = appReady && isInitialLoadComplete && !isPageLoading;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 relative pb-[calc(5rem+env(safe-area-inset-bottom,12px))] md:pb-0 min-h-[50vh]">
        {children}
      </div>
      
      {showFooter && <Footer />}

      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
};

export default Layout;

