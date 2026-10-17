import { useState, useEffect } from 'react';
import { ArrowUpToLine } from 'lucide-react';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasModal, setHasModal] = useState(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Theo dõi trạng thái overflow của body
  useEffect(() => {
    const checkModal = () => {
      const isHidden = document.body.style.overflow === 'hidden';
      setHasModal((prev) => (prev !== isHidden ? isHidden : prev));
    };

    checkModal();

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      {isVisible && !hasModal && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:bottom-4 right-4 bg-surface text-text-primary border border-border hover:border-primary hover:text-primary p-3 md:p-2.5 rounded-control transition-colors z-50 cursor-pointer"
        >
          <ArrowUpToLine size={24} className="md:hidden" aria-hidden="true" />
          <ArrowUpToLine size={20} className="hidden md:block" aria-hidden="true" />
        </button>
      )}
    </>
  );
}

export default ScrollToTop;
