// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchPeople } from '../services/tmdb';
import { useSearchPeople } from './useSearchPeople';

vi.mock('../services/tmdb', () => ({ searchPeople: vi.fn() }));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
};

describe('useSearchPeople', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ignores a stale query response that resolves after the latest query', async () => {
    const older = deferred<{ results: never[]; totalPages: number }>();
    const newer = deferred<{ results: Array<{ id: number; name: string }>; totalPages: number }>();
    vi.mocked(searchPeople)
      .mockReturnValueOnce(older.promise as never)
      .mockReturnValueOnce(newer.promise as never);

    const { result, rerender } = renderHook(
      ({ query }) => useSearchPeople(query, 1),
      { initialProps: { query: 'older' } },
    );
    await act(async () => { vi.advanceTimersByTime(500); });
    rerender({ query: 'newer' });
    await act(async () => { vi.advanceTimersByTime(500); });

    await act(async () => {
      newer.resolve({ results: [{ id: 2, name: 'New result' }], totalPages: 1 });
      await newer.promise;
    });
    older.resolve({ results: [], totalPages: 1 });
    await act(async () => { await older.promise; });

    expect(result.current.peopleResults).toEqual([{ id: 2, name: 'New result' }]);
    expect(vi.mocked(searchPeople).mock.calls[1]?.[2]).toBeInstanceOf(AbortSignal);
  });
});
