import { createInitialStorage } from '../data/sampleData';
import type { AppStorage, GachaData, GachaHistory, GachaItem } from '../data/types';
import { createId } from '../utils/id';

const STORAGE_KEY = 'mayottara-gacha:v1';

let cache: AppStorage | null = null;

const isValidStorage = (value: unknown): value is AppStorage => {
  if (!value || typeof value !== 'object') return false;
  const storage = value as AppStorage;
  return Array.isArray(storage.gachas) && Boolean(storage.settings);
};

const persist = (storage: AppStorage): void => {
  cache = storage;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
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
    // Broken localStorage data is replaced with a clean initial state.
  }

  const initial = createInitialStorage();
  persist(initial);
  return initial;
};

export const getGachas = (): GachaData[] => loadStorage().gachas;

export const getGacha = (id: string): GachaData | undefined =>
  loadStorage().gachas.find((gacha) => gacha.id === id);

export const saveGacha = (input: { id?: string; title: string; itemNames: string[] }): GachaData => {
  const storage = loadStorage();
  const now = new Date().toISOString();
  const cleanedNames = input.itemNames.map((name) => name.trim()).filter(Boolean);
  const items: GachaItem[] = cleanedNames.map((name) => ({
    id: createId(),
    name,
  }));

  if (input.id) {
    const existing = storage.gachas.find((gacha) => gacha.id === input.id);
    if (!existing) throw new Error('編集対象のガチャが見つかりません。');

    const next: GachaData = {
      ...existing,
      title: input.title.trim(),
      items,
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

export const addHistory = (gachaId: string, resultName: string): GachaHistory => {
  const storage = loadStorage();
  const history: GachaHistory = {
    id: createId(),
    resultName,
    createdAt: new Date().toISOString(),
  };

  persist({
    ...storage,
    gachas: storage.gachas.map((gacha) => {
      if (gacha.id !== gachaId) return gacha;

      return {
        ...gacha,
        histories: [history, ...gacha.histories].slice(0, 10),
        updatedAt: new Date().toISOString(),
      };
    }),
  });

  return history;
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
