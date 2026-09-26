import React, { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import useInitialLoadStore from '../../stores/initialLoadStore';

interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
  contain?: boolean;
  text?: string;
  className?: string;
}

function Spinner({ size }: { size: number }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return (
      <div
        role="status"
        aria-label="Đang tải"
        className="rounded-full border-4 border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <div
        className="absolute inset-0 border-4 border-primary/20 rounded-full"
        style={{ width: size, height: size }}
      />
      <div
        className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size, animationDuration: '1s' }}
      />
    </div>
  );
}

/** Contained + fullscreen loading. Fullscreen only for true app blocking. */
function Loading({
  size = 48,
  fullScreen = true,
  contain = false,
  text,
  className = ''
}: LoadingProps) {
  const { setPageLoading } = useInitialLoadStore();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (fullScreen) {
      setPageLoading(true);
      return () => {
        setPageLoading(false);
      };
    }
  }, [fullScreen, setPageLoading]);

  const label = text ?? 'Đang tải…';
  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Spinner size={size} />
      {text && (
        <p className="mt-4 text-xs font-medium text-text-secondary">
          {reducedMotion ? label : text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div role="status" aria-label={label} className="fixed inset-0 bg-background flex items-center justify-center z-100">
        {content}
      </div>
    );
  }

  if (contain) {
    return (
      <div role="status" aria-label={label} className="absolute inset-0 bg-background/50 flex items-center justify-center z-30">
        {content}
      </div>
    );
  }

  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      {content}
    </span>
  );
}

export default Loading;
