export function topEntries(values: Record<string, number>, limit: number): Array<[string, number]> {
  return Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function buildGenreChartData(values: Record<string, number>, maxItems = 8): Array<{ name: string; value: number }> {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  if (entries.length <= maxItems) return entries.map(([name, value]) => ({ name, value }));
  const top = entries.slice(0, maxItems - 1).map(([name, value]) => ({ name, value }));
  const others = entries.slice(maxItems - 1).reduce((sum, [, value]) => sum + value, 0);
  return [...top, { name: 'Khác', value: others }];
}
