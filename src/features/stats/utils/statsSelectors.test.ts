import { describe, expect, it } from 'vitest';
import { buildGenreChartData, topEntries } from './statsSelectors';

describe('stats selectors', () => {
  it('sorts top entries and groups the long tail', () => {
    expect(topEntries({ A: 1, B: 4, C: 2 }, 2)).toEqual([['B', 4], ['C', 2]]);
    expect(buildGenreChartData({ A: 8, B: 7, C: 3 }, 2)).toEqual([
      { name: 'A', value: 8 }, { name: 'Khác', value: 10 },
    ]);
  });
});
