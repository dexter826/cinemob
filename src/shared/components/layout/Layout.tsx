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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary"
      >
        Nhảy tới nội dung chính
      </a>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 relative pb-[calc(5rem+env(safe-area-inset-bottom,12px))] md:pb-0 min-h-[50vh] focus-visible:outline-none"
      >
        {children}
      </main>

      {showFooter && <Footer />}

      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
}

export default Layout;
