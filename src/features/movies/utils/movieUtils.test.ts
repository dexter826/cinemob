import { describe, it, expect } from 'vitest';
import {
  getMainTitle,
  normalizeMovieDate,
  getTMDBImageUrl,
} from './movieUtils';
import type { Movie } from '@/types';

const baseMovie = (over: Partial<Movie> = {}): Movie => ({
  uid: 'u1',
  id: 1,
  title: 'Inception',
  poster_path: '/x.jpg',
  runtime: 148,
  watched_at: new Date(2024, 0, 15),
  source: 'tmdb',
  ...over,
});

describe('getMainTitle', () => {
  it('ưu tiên title_vi khi là phim Việt', () => {
    const m = baseMovie({ country: 'VN', title_vi: 'Kẻ Đánh Cắp Giấc Mơ' });
    expect(getMainTitle(m)).toBe('Kẻ Đánh Cắp Giấc Mơ');
  });

  it('dùng title gốc khi không phải phim Việt', () => {
    const m = baseMovie({ country: 'US' });
    expect(getMainTitle(m)).toBe('Inception');
  });
});

describe('normalizeMovieDate', () => {
  it('trả null cho giá trị rỗng', () => {
    expect(normalizeMovieDate(null)).toBeNull();
    expect(normalizeMovieDate(undefined)).toBeNull();
    expect(normalizeMovieDate('')).toBeNull();
  });

  it('giữ nguyên Date hợp lệ', () => {
    const d = new Date(2024, 5, 1);
    expect(normalizeMovieDate(d)).toBe(d);
  });

  it('parse chuỗi ISO, trả null cho chuỗi rác', () => {
    expect(normalizeMovieDate('2024-03-10')?.getFullYear()).toBe(2024);
    expect(normalizeMovieDate('không-phải-ngày')).toBeNull();
  });

  it('hỗ trợ Firestore Timestamp shape', () => {
    const d = new Date(2023, 1, 1);
    expect(normalizeMovieDate({ toDate: () => d })).toBe(d);
  });

  it('từ chối object lạ', () => {
    expect(normalizeMovieDate({ foo: 1 })).toBeNull();
  });
});

describe('getTMDBImageUrl', () => {
  it('trả placeholder khi thiếu path', () => {
    expect(getTMDBImageUrl(null)).toContain('http');
  });

  it('giữ nguyên URL tuyệt đối', () => {
    expect(getTMDBImageUrl('https://cdn/x.jpg')).toBe('https://cdn/x.jpg');
  });

  it('ghép base TMDB cho path tương đối', () => {
    expect(getTMDBImageUrl('/abc.jpg')).toContain('/abc.jpg');
  });
});
