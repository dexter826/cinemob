import React from 'react';

interface CineMobSymbolProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function CineMobSymbol({ className = 'h-6 w-6', ...props }: CineMobSymbolProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <g transform="translate(128, 128)">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M 59.4 -59.4 A 84 84 0 1 0 59.4 59.4 L 36.77 36.77 A 52 52 0 1 1 36.77 -36.77 Z"
        />
        <polygon points="-10,-24 56,0 -10,24" fill="var(--color-text-primary, #F5F5F2)" />
        <circle cx="-14" cy="0" r="10" fill="currentColor" />
        <line
          x1="-84"
          y1="0"
          x2="-70"
          y2="0"
          stroke="var(--color-background, #0A0A0A)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="-84"
          x2="0"
          y2="-70"
          stroke="var(--color-background, #0A0A0A)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="70"
          x2="0"
          y2="84"
          stroke="var(--color-background, #0A0A0A)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default CineMobSymbol;
