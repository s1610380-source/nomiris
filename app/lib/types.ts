export type Scene =
  | "会社飲み"
  | "友達飲み"
  | "会食"
  | "懇親会"
  | "デート"
  | "二次会";

export type Area = "新宿" | "渋谷" | "池袋" | "恵比寿" | "銀座";

export type YesNoEither = "あり" | "なし" | "どちらでも";

export interface EventCondition {
  title: string;
  area: Area;
  scene: Scene;
  peopleCount: number;
  budgetLimit: number;
  walkingMinutes: number;
  nomihodai: YesNoEither;
  privateRoom: YesNoEither;
  atmosphere: string;
  participants: string;
  avoidPoints: string;
}

export interface Restaurant {
  id: string;
  name: string;
  genre: string;
  url: string;
  area: string;
  budget: string;
  /** 予算下限（円）。フィルタに使う */
  budgetMin: number;
  /** 予算上限（円）。表示と参考に使う */
  budgetMax: number;
  googleRating: string;
  walkingMinutes: number;
  hasNomihodai: boolean;
  hasPrivateRoom: boolean;
  memo: string;
  recommendPoint: string;
  cautionPoint: string;
  emoji: string;
  selected: boolean;
}

/** id/selected を持たないカタログ用エントリ。pickCandidates で id/selected を付与する */
export type CatalogEntry = Omit<Restaurant, "id" | "selected">;
