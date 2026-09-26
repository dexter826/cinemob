import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUserData } from '@/features/auth/services/userService';
import { fetchAIRecommendations, fetchTrendingFallback } from '../services/recommendationService';
import useRecommendationsStore from './recommendationsStore';

vi.mock('../services/recommendationService', () => ({
  fetchAIRecommendations: vi.fn(),
  fetchTrendingFallback: vi.fn(),
}));

vi.mock('@/features/auth/services/userService', () => ({
  getUserData: vi.fn(),
  updatePreviouslyRecommendedTitles: vi.fn(),
}));

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('recommendationsStore user isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecommendationsStore.setState({
      aiRecommendations: [],
      trendingMovies: [],
      isAiLoading: false,
      isTrendingLoading: false,
      historyMovies: [],
      previouslyRecommendedTitles: new Set(),
    });
  });

  it('ignores initialize response that arrives after logout', async () => {
    const request = deferred<{ previouslyRecommendedTitles: string[] }>();
    vi.mocked(getUserData).mockReturnValueOnce(request.promise as never);

    const initializing = useRecommendationsStore.getState().initializeForUser('user-a');
    useRecommendationsStore.getState().reset();
    request.resolve({ previouslyRecommendedTitles: ['Private A'] });
    await initializing;

    expect(useRecommendationsStore.getState().activeUserId).toBeNull();
    expect([...useRecommendationsStore.getState().previouslyRecommendedTitles]).toEqual([]);
  });

  it('keeps user B data when user A resolves later', async () => {
    const requestA = deferred<{ previouslyRecommendedTitles: string[] }>();
    const requestB = deferred<{ previouslyRecommendedTitles: string[] }>();
    vi.mocked(getUserData)
      .mockReturnValueOnce(requestA.promise as never)
      .mockReturnValueOnce(requestB.promise as never);

    const initializingA = useRecommendationsStore.getState().initializeForUser('user-a');
    const initializingB = useRecommendationsStore.getState().initializeForUser('user-b');
    requestB.resolve({ previouslyRecommendedTitles: ['B'] });
    await initializingB;
    requestA.resolve({ previouslyRecommendedTitles: ['A'] });
    await initializingA;

    expect(useRecommendationsStore.getState().activeUserId).toBe('user-b');
    expect([...useRecommendationsStore.getState().previouslyRecommendedTitles]).toEqual(['B']);
  });

  it('does not clear loading when an older refresh finishes before a newer refresh', async () => {
    vi.mocked(getUserData).mockResolvedValue({ previouslyRecommendedTitles: [] } as never);
    vi.mocked(fetchTrendingFallback).mockResolvedValue([]);
    const first = deferred<{ aiRecommendations: never[]; lastAiHistoryLength: number } | null>();
    const second = deferred<{ aiRecommendations: never[]; lastAiHistoryLength: number } | null>();
    vi.mocked(fetchAIRecommendations)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    await useRecommendationsStore.getState().initializeForUser('user-a');
    useRecommendationsStore.setState({ trendingMovies: [{ id: 1, title: 'Trending' }] as never });

    const olderRefresh = useRecommendationsStore.getState().refreshRecommendations('user-a');
    await Promise.resolve();
    const newerRefresh = useRecommendationsStore.getState().refreshRecommendations('user-a', true);
    await Promise.resolve();
    await Promise.resolve();

    first.resolve({ aiRecommendations: [], lastAiHistoryLength: 0 });
    await olderRefresh;
    expect(useRecommendationsStore.getState().isAiLoading).toBe(true);

    second.resolve({ aiRecommendations: [], lastAiHistoryLength: 0 });
    await newerRefresh;
    expect(useRecommendationsStore.getState().isAiLoading).toBe(false);
  });
});
