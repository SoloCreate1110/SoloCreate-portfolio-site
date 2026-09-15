export type GachaItem = {
  id: string;
  name: string;
};

export type GachaHistory = {
  id: string;
  resultName: string;
  createdAt: string;
};

export type GachaData = {
  id: string;
  title: string;
  items: GachaItem[];
  histories: GachaHistory[];
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
