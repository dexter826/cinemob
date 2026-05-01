import { useEffect, useRef } from 'react';

// Ngăn cuộn trang khi mở modal.
export const usePreventScroll = (isOpen: boolean) => {
    const scrollPositionRef = useRef(0);

    useEffect(() => {
        if (isOpen) {
            const currentCount = parseInt(document.body.getAttribute('data-modal-count') || '0');
            const newCount = currentCount + 1;
            document.body.setAttribute('data-modal-count', newCount.toString());

            if (newCount === 1) {
                scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollPositionRef.current}px`;
                document.body.style.width = '100%';
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                const currentCount = parseInt(document.body.getAttribute('data-modal-count') || '0');
                const newCount = Math.max(0, currentCount - 1);
                document.body.setAttribute('data-modal-count', newCount.toString());

                if (newCount === 0) {
                    const scrollY = scrollPositionRef.current;

                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    document.body.style.paddingRight = '';

                    window.scrollTo(0, scrollY);
                }
            };
        }
    }, [isOpen]);
};
