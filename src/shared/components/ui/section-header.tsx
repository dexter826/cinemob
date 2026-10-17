import React from 'react';
import { classNames } from '@/shared/utils/class-names';

interface SectionHeaderProps {
  children: React.ReactNode;
  /** Id cho aria-labelledby của section cha. */
  id?: string;
  className?: string;
}

/** Nhãn mục caps duy nhất được phép dùng trong app (1 cấp, không xếp tầng). */
function SectionHeader({ children, id, className }: SectionHeaderProps) {
  return (
    <p
      id={id}
      className={classNames(
        'text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary',
        className ?? '',
      )}
    >
      {children}
    </p>
  );
}

export default SectionHeader;
