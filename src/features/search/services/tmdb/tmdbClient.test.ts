import { describe, expect, it, vi } from 'vitest';
import { withLimit } from './tmdbClient';

describe('withLimit', () => {
  it('giữ thứ tự kết quả và đánh dấu task lỗi thành null', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const tasks = [
      async () => 1,
      async () => {
        throw new Error('boom');
      },
      async () => 3,
    ];

    await expect(withLimit(tasks, 2)).resolves.toEqual([1, null, 3]);

    errorSpy.mockRestore();
  });

  it('trả mảng rỗng khi không có task', async () => {
    await expect(withLimit([], 3)).resolves.toEqual([]);
  });
});
