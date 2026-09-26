// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  it('tracks matchMedia changes', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    let matches = false;
    const mediaQuery = {
      get matches() { return matches; },
      addEventListener: vi.fn((_type: string, callback: (event: MediaQueryListEvent) => void) => { listener = callback; }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));

    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listener?.({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);
  });
});
