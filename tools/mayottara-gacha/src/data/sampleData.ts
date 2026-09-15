import type { AppStorage, GachaData, GachaItem } from './types';
import { createId } from '../utils/id';

const createItems = (names: string[]): GachaItem[] =>
  names.map((name) => ({
    id: createId(),
    name,
  }));

const createSampleGacha = (title: string, names: string[]): GachaData => {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title,
    items: createItems(names),
    histories: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const createInitialStorage = (): AppStorage => ({
  gachas: [
    createSampleGacha('食べるところガチャ', ['焼肉', '寿司', '定食', 'ラーメン']),
    createSampleGacha('遊ぶところガチャ', ['カラオケ', '映画', 'ゲームセンター', '温泉']),
  ],
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
  },
});
