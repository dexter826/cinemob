import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { getDoc, updateDoc } from 'firebase/firestore';
import { validateDisplayName, updateDisplayName } from './profileService';

vi.mock('firebase/auth', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('validateDisplayName', () => {
  it('từ chối chuỗi rỗng sau trim', () => {
    expect(validateDisplayName('   ').ok).toBe(false);
  });

  it('từ chối tên 1 ký tự', () => {
    expect(validateDisplayName('A').ok).toBe(false);
  });

  it('chấp nhận tên 2 ký tự và trim khoảng trắng', () => {
    const r = validateDisplayName('  An  ');
    expect(r).toEqual({ ok: true, value: 'An' });
  });

  it('từ chối tên 51 ký tự', () => {
    expect(validateDisplayName('a'.repeat(51)).ok).toBe(false);
  });

  it('chấp nhận tên 50 ký tự', () => {
    const r = validateDisplayName('a'.repeat(50));
    expect(r.ok).toBe(true);
  });
});

describe('updateDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trim tên, gọi updateProfile và sync share khi doc tồn tại', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => true } as never);
    const result = await updateDisplayName(mockUser, '  An Vo  ');
    expect(result).toBe('An Vo');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'An Vo' });
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { displayName: 'An Vo' });
  });

  it('bỏ qua sync share khi doc không tồn tại', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as never);
    await updateDisplayName(mockUser, 'Binh');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Binh' });
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('throw lỗi validate khi tên không hợp lệ và không gọi updateProfile', async () => {
    const mockUser = { uid: 'u123' } as User;
    await expect(updateDisplayName(mockUser, 'x')).rejects.toThrow();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('không throw khi sync share fail, vẫn trả về tên mới', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockRejectedValueOnce(new Error('net'));
    const result = await updateDisplayName(mockUser, 'Chi');
    expect(result).toBe('Chi');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Chi' });
  });
});
