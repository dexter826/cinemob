import React from 'react';

const PARTICLE_COUNT = 24;

/** Confetti CSS thuần — thay Lottie; nơi gọi tự gate reduced-motion. */
function ConfettiBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
        <span
          key={index}
          className="absolute left-1/2 top-1/2 w-1.5 h-2.5 -ml-[3px] -mt-[5px] rounded-[1px] animate-confetti"
          style={
            {
              '--confetti-angle': `${index * 15}deg`,
              '--confetti-distance': index % 2 === 0 ? '150px' : '110px',
              animationDelay: `${(index % 5) * 55}ms`,
              backgroundColor:
                index % 3 === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default ConfettiBurst;
