export const setOrDeleteParam = (params: URLSearchParams, key: string, value: string): void => {
  if (value) params.set(key, value);
  else params.delete(key);
};

export const readPageParam = (params: URLSearchParams): number => {
  const page = Number(params.get('page'));
  return Number.isInteger(page) && page > 1 ? page : 1;
};

export const writePageParam = (params: URLSearchParams, page: number): void => {
  setOrDeleteParam(params, 'page', page > 1 ? String(page) : '');
};
