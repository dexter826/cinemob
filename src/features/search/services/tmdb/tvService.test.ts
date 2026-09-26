import { describe, it, expect } from 'vitest';
import { adjustAirDate, parseLocalDate } from './tvService';

describe('adjustAirDate', () => {
  it('giữ nguyên ngày YYYY-MM-DD', () => {
    expect(adjustAirDate('2026-09-25')).toBe('2026-09-25');
  });

  it('trả rỗng cho chuỗi rỗng', () => {
    expect(adjustAirDate('')).toBe('');
  });

  it('cắt phần thời gian nếu có', () => {
    expect(adjustAirDate('2026-09-25T10:00:00')).toBe('2026-09-25');
  });
});

describe('parseLocalDate', () => {
  it('parse local midnight đúng ngày', () => {
    const d = parseLocalDate('2026-09-25');
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(8);
    expect(d?.getDate()).toBe(25);
    expect(d?.getHours()).toBe(0);
  });

  it('trả null cho chuỗi invalid', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
  });
});
