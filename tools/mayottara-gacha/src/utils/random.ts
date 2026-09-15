/** Uniform integer using rejection sampling; no modulo bias. */
export const randomIndex = (length: number, source = (): number => crypto.getRandomValues(new Uint32Array(1))[0]): number => {
  if (!Number.isSafeInteger(length) || length < 1 || length > 2 ** 32) throw new Error('抽選できる候補がありません。');
  const limit = 2 ** 32 - (2 ** 32 % length);
  let value: number;
  do { value = source(); } while (value >= limit);
  return value % length;
};

export const pickItem = <T extends { id: string }>(items: T[], mode: 'random' | 'cycle', remaining: string[] = [], source?: () => number): { item: T; remaining: string[] } => {
  let pool = mode === 'cycle' ? items.filter(item => remaining.includes(item.id)) : items;
  if (!pool.length) pool = items;
  const item = pool[randomIndex(pool.length, source)];
  return { item, remaining: mode === 'cycle' ? pool.filter(candidate => candidate.id !== item.id).map(candidate => candidate.id) : [] };
};
