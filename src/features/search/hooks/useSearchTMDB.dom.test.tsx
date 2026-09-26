// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { searchMovies } from '../services/tmdb';
import { useSearchTMDB } from './useSearchTMDB';

vi.mock('../services/tmdb', () => ({
  searchMovies: vi.fn().mockResolvedValue({ results: [], totalPages: 1 }),
  getDiscoverMovies: vi.fn().mockResolvedValue({ results: [], totalPages: 1 }),
}));

describe('useSearchTMDB', () => {
  it('passes its request abort signal to the search service', async () => {
    renderHook(() => useSearchTMDB('matrix', 1, {
      query: 'matrix',
      type: 'all',
      year: '',
      country: '',
      sortBy: 'popularity.desc',
    }));

    await waitFor(() => expect(searchMovies).toHaveBeenCalledOnce());
    expect(vi.mocked(searchMovies).mock.calls[0]?.[3]).toBeInstanceOf(AbortSignal);
  });
});
