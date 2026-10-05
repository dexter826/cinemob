import type { MemberGender } from '@/types';
import { formatDateDMY } from '@/shared/utils/dateFormat';

export const GENDER_LABELS: Record<MemberGender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

export const formatJoinDate = (iso: string | undefined): string => {
  if (!iso) return 'Không rõ';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return formatDateDMY(date) || 'Không rõ';
};

export const formatDob = (dob: string | undefined): string => {
  if (!dob) return '';
  return formatDateDMY(dob) || dob;
};
