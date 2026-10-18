import React from 'react';
import { classNames } from '@/shared/utils/class-names';

type ChipTone = 'gold' | 'success' | 'neutral';

interface ChipProps {
  tone?: ChipTone;
  /** Icon nhỏ đứng trước chữ (lucide, đã ẩn với screen reader ở caller). */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<ChipTone, string> = {
  gold: 'bg-primary text-on-primary',
  success: 'bg-success text-on-success',
  neutral: 'bg-black/60 text-white border border-white/10',
};

/**
 * Chip trạng thái/hệ thống (Đã xem, Sẽ xem, Hoàn thành, Review…) — Caps 9px.
 * Trên ảnh dùng tone neutral (nền tối); trên nền app dùng gold/success.
 */
function Chip({ tone = 'neutral', icon, children, className }: ChipProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-[9px] font-bold uppercase tracking-[0.06em] whitespace-nowrap',
        toneClasses[tone],
        className ?? '',
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export default Chip;
