import { describe, expect, it } from 'vitest';
import { isNavItemActive } from './navigation';

describe('isNavItemActive', () => {
  it('matches exact routes without activating unrelated routes', () => {
    expect(isNavItemActive('/stats', { to: '/stats', match: 'exact' })).toBe(true);
    expect(isNavItemActive('/stats-extra', { to: '/stats', match: 'exact' })).toBe(false);
  });

  it('matches album detail routes by prefix', () => {
    expect(isNavItemActive('/albums/abc', { to: '/albums', match: 'prefix' })).toBe(true);
  });
});
