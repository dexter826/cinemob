import type { MemberGender } from '@/types';

export const GENDER_LABELS: Record<MemberGender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

export const formatJoinDate = (iso: string | undefined): string => {
  if (!iso) return 'Không rõ';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDob = (dob: string | undefined): string => {
  if (!dob) return '';
  const date = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dob;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
