export type GachaItem = {
  id: string;
  name: string;
};

export type GachaHistory = {
  id: string;
  resultName: string;
  itemId?: string;
  mode?: 'random' | 'cycle';
  createdAt: string;
};

export type GachaData = {
  id: string;
  title: string;
  items: GachaItem[];
  histories: GachaHistory[];
  mode?: 'random' | 'cycle';
  remaining?: string[];
  createdAt: string;
  updatedAt: string;
};

export type AppStorage = {
  gachas: GachaData[];
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
};
