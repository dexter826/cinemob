import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { getDoc, updateDoc } from 'firebase/firestore';
import { updateUserAvatar, removeUserAvatar, getOriginalGoogleAvatar, revertToGoogleAvatar } from './avatarService';
import { uploadToCloudinary } from './cloudinaryService';

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

vi.mock('./cloudinaryService', () => ({
  uploadToCloudinary: vi.fn(),
}));

describe('avatarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lấy ảnh Google từ providerData', () => {
    const mockUser = {
      providerData: [
        { providerId: 'google.com', photoURL: 'https://google.com/photo.jpg' },
      ],
    } as unknown as User;

    expect(getOriginalGoogleAvatar(mockUser)).toBe('https://google.com/photo.jpg');
  });

  it('xóa avatar đưa photoURL về rỗng và cập nhật share nếu có', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
    } as never);

    await removeUserAvatar(mockUser);

    expect(updateProfile).toHaveBeenCalledWith(mockUser, { photoURL: '' });
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { photoURL: '' });
  });

  it('tải avatar mới lên Cloudinary và cập nhật profile', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(uploadToCloudinary).mockResolvedValueOnce('https://cloudinary.com/avatar.jpg');
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
    } as never);

    const result = await updateUserAvatar(mockUser, new Blob());

    expect(result).toBe('https://cloudinary.com/avatar.jpg');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { photoURL: 'https://cloudinary.com/avatar.jpg' });
  });

  it('khôi phục ảnh Google gốc cho người dùng', async () => {
    const mockUser = {
      uid: 'u123',
      providerData: [
        { providerId: 'google.com', photoURL: 'https://google.com/original.jpg' },
      ],
    } as unknown as User;
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
    } as never);

    const result = await revertToGoogleAvatar(mockUser);

    expect(result).toBe('https://google.com/original.jpg');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { photoURL: 'https://google.com/original.jpg' });
  });
});
