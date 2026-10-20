import React from 'react';
import Navbar from './navbar';
import Footer from '@/shared/components/layout/footer';
import MobileBottomNav from '@/shared/components/layout/mobile-bottom-nav';
import ScrollToTop from '@/shared/components/ui/scroll-to-top';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-on-primary"
      >
        Nhảy tới nội dung chính
      </a>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 relative pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 min-h-[50vh]"
      >
        {children}
      </main>

      <Footer />

      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
}

export default Layout;
