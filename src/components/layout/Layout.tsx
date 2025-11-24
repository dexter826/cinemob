import React from 'react';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
