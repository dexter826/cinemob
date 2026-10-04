// Bộ format ngày/giờ dùng Intl với locale vi-VN — tránh format hardcode rải rác.
const dayMonthYear = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('vi-VN', { month: 'long' });

/** "2026-10-04" → "04/10/2026". */
export const formatDateDMY = (isoDate: string): string => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return '';
  return dayMonthYear.format(new Date(y, m - 1, d));
};

/** 0-based month index → "Tháng 10" (viết hoa đầu câu). */
export const monthLabel = (monthIndex: number): string => {
  const label = monthFormatter.format(new Date(2026, monthIndex, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Ngày hiện tại theo múi giờ local, dạng "YYYY-MM-DD" (không lệch UTC như toISOString). */
export const todayISO = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Chuẩn hóa giá trị ngày (Firestore Timestamp | Date | string | number) sang Date, an toàn null. */
export const normalizeDate = (date: unknown): Date | null => {
  if (!date) return null;
  if (
    typeof date === 'object' &&
    date !== null &&
    typeof (date as { toDate?: unknown }).toDate === 'function'
  ) {
    return (date as { toDate: () => Date }).toDate();
  }
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/** Định dạng ngày bất kỳ sang dd/mm/yyyy, trả "N/A" nếu không đọc được. */
export const formatDateAny = (date: unknown): string => {
  const normalized = normalizeDate(date);
  if (!normalized) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(normalized);
};
