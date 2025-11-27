import React, { useState, useEffect } from 'react';
import { ArrowUpToLine } from 'lucide-react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasModal, setHasModal] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Check if body overflow is hidden (modal is open)
  useEffect(() => {
    const checkModal = () => {
      setHasModal(document.body.style.overflow === 'hidden');
    };

    // Check initially
    checkModal();

    // Use MutationObserver to watch for style changes on body
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && !hasModal && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50 cursor-pointer"
        >
          <ArrowUpToLine size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;