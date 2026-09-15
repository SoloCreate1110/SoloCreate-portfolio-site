import { createInitialStorage } from '../data/sampleData';
import type { AppStorage, GachaData, GachaHistory, GachaItem } from '../data/types';
import { pickItem } from '../utils/random';
import { createId } from '../utils/id';

const STORAGE_KEY = 'mayottara-gacha:v1';

let cache: AppStorage | null = null;

const isValidStorage = (value: unknown): value is AppStorage => {
  if (!value || typeof value !== 'object') return false;
  const storage = value as AppStorage;
  return Array.isArray(storage.gachas) && storage.gachas.every(g =>
    g && typeof g.id === 'string' && typeof g.title === 'string' &&
    Array.isArray(g.items) && g.items.length >= 2 && g.items.every(i => i && typeof i.id === 'string' && typeof i.name === 'string') &&
    Array.isArray(g.histories) && g.histories.every(h => h && typeof h.id === 'string' && typeof h.resultName === 'string' && typeof h.createdAt === 'string') &&
    (g.mode === undefined || g.mode === 'random' || g.mode === 'cycle') &&
    (g.remaining === undefined || (Array.isArray(g.remaining) && g.remaining.every(id => typeof id === 'string')))
  ) && Boolean(storage.settings) && typeof storage.settings.soundEnabled === 'boolean' && typeof storage.settings.vibrationEnabled === 'boolean';
};

const persist = (storage: AppStorage): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(storage)); }
  catch { throw new Error('保存できませんでした。ブラウザの空き容量や保存設定を確認してください。'); }
  cache = storage;
};

export const loadStorage = (): AppStorage => {
  if (cache) return cache;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialStorage();
    persist(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isValidStorage(parsed)) {
      cache = parsed;
      return parsed;
    }
  } catch {
    // Preserve the original data if parsing fails.
  }

  throw new Error('保存データを読み込めませんでした。元のデータはそのまま残しています。');
};

export const getGachas = (): GachaData[] => loadStorage().gachas;

export const getGacha = (id: string): GachaData | undefined =>
  loadStorage().gachas.find((gacha) => gacha.id === id);

export const saveGacha = (input: { id?: string; title: string; itemNames: string[] }): GachaData => {
  const storage = loadStorage();
  const now = new Date().toISOString();
  const cleanedNames = input.itemNames.map((name) => name.trim()).filter(Boolean);
  if (!input.title.trim() || input.title.trim().length > 32) throw new Error('ガチャ名は1〜32文字で入力してください。');
  if (cleanedNames.length < 2 || cleanedNames.length > 100 || cleanedNames.some(n => n.length > 40)) throw new Error('候補は2〜100個、各40文字以内にしてください。');
  if (new Set(cleanedNames.map(n => n.normalize('NFKC').toLocaleLowerCase())).size !== cleanedNames.length) throw new Error('同じ名前の候補があります。重複を取り除いてください。');
  const previous = input.id ? getGacha(input.id) : undefined;
  const items: GachaItem[] = cleanedNames.map((name) => ({
    id: previous?.items.find(i => i.name === name)?.id ?? createId(),
    name,
  }));

  if (input.id) {
    const existing = storage.gachas.find((gacha) => gacha.id === input.id);
    if (!existing) throw new Error('編集対象のガチャが見つかりません。');

    const next: GachaData = {
      ...existing,
      title: input.title.trim(),
      items,
      remaining: [],
      updatedAt: now,
    };

    persist({
      ...storage,
      gachas: storage.gachas.map((gacha) => (gacha.id === input.id ? next : gacha)),
    });

    return next;
  }

  const created: GachaData = {
    id: createId(),
    title: input.title.trim(),
    items,
    histories: [],
    createdAt: now,
    updatedAt: now,
  };

  persist({
    ...storage,
    gachas: [created, ...storage.gachas],
  });

  return created;
};

export const deleteGacha = (id: string): void => {
  const storage = loadStorage();
  persist({
    ...storage,
    gachas: storage.gachas.filter((gacha) => gacha.id !== id),
  });
};

export const clearHistories = (gachaId: string): void => {
  const storage = loadStorage();
  persist({
    ...storage,
    gachas: storage.gachas.map((gacha) =>
      gacha.id === gachaId ? { ...gacha, histories: [], updatedAt: new Date().toISOString() } : gacha,
    ),
  });
};

export const updateSettings = (settings: AppStorage['settings']): void => {
  const storage = loadStorage();
  persist({ ...storage, settings });
};

export const resetAllData = (): AppStorage => {
  const initial = createInitialStorage();
  persist(initial);
  return initial;
};

export const setDrawMode = (id: string, mode: 'random' | 'cycle'): void => {
  const storage = loadStorage();
  persist({ ...storage, gachas: storage.gachas.map(g => g.id === id ? { ...g, mode, remaining: [] } : g) });
};

export const drawGacha = (id: string): GachaHistory => {
  const storage = loadStorage();
  const gacha = getGacha(id);
  if (!gacha) throw new Error('ガチャが見つかりません。');
  const mode = gacha.mode ?? 'random';
  const result = pickItem(gacha.items, mode, gacha.remaining);
  const history: GachaHistory = { id: createId(), itemId: result.item.id, resultName: result.item.name, mode, createdAt: new Date().toISOString() };
  persist({ ...storage, gachas: storage.gachas.map(g => g.id === id ? {
    ...g, remaining: result.remaining, histories: [history, ...g.histories].slice(0, 100),
  } : g) });
  return history;
};

export const restoreStorage = (value: unknown, commit: boolean): void => {
  if (!isValidStorage(value)) throw new Error('対応するバックアップファイルではありません。');
  if (new Set(value.gachas.map(g => g.id)).size !== value.gachas.length || value.gachas.some(g =>
    g.items.length > 100 || new Set(g.items.map(i => i.id)).size !== g.items.length ||
    g.items.some(i => !i.name.trim() || i.name.length > 40) || !g.title.trim() || g.title.length > 32
  )) throw new Error('バックアップの候補や名前を確認してください。');
  if (commit) persist({ ...value, gachas: value.gachas.map(g => ({ ...g, histories: g.histories.slice(0, 100) })) });
};
