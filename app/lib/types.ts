/**
 * モード（カジュアル飲み / 仕事・会食 / デート）。Free / Pro 制度と連動。
 */
export type Mode = "casual" | "business" | "date";

/** プラン */
export type Plan = "free" | "pro";

/** エリアは自由入力（datalist で suggestion を提示するのみ） */
export type Area = string;

/** 用途（場面）。モードごとに選択肢が変わるため string で管理。 */
export type Scene = string;

export type YesNoEither = "あり" | "なし" | "どちらでも";

export interface EventCondition {
  /** モード（必須） */
  mode: Mode;
  area: Area;
  /** HotPepper のエリアコード（middle / small / large）。マスタ選択時にセット。自由入力時は空。 */
  areaCode: string;
  scene: Scene;
  peopleCount: number;
  /** 予算下限（円/人）。0 はノーガード */
  budgetMin: number;
  /** 予算上限（円/人）。0 はノーガード */
  budgetMax: number;
  /** 詳細項目（任意）。最寄り駅名（例: "新宿駅"） */
  nearestStation: string;
  walkingMinutes: number;
  nomihodai: YesNoEither;
  privateRoom: YesNoEither;
  /** 雰囲気（多選択） */
  atmosphereTags: string[];
  /** 重視すること（多選択） */
  importantTags: string[];
  /** 自由入力の雰囲気（任意） */
  atmosphere: string;
  /** 相手 */
  participants: string;
  /** 避けたいこと */
  avoidPoints: string;
  /** 希望日時（自由入力テキスト） */
  desiredDate: string;
  /** 出発地（住所 or 駅名）。Pro 機能で各候補店との徒歩分計算に使う */
  originStation: string;
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
  /** 住所（HotPepper 由来の店のみ。カタログは未設定でよい） */
  address?: string;
  /** 出発地から店舗までの距離（Pro で取得時のみセット） */
  distanceFromOrigin?: {
    walkMinutes: number;
    walkMeters: number;
    distanceText: string; // "6.7 km" など、UI 表示用
    durationText: string; // "1 時間 34 分" など、UI 表示用
    originLabel: string; // 表示用の出発地ラベル
  };
}

/** id/selected を持たないカタログ用エントリ。pickCandidates で id/selected を付与する */
export type CatalogEntry = Omit<Restaurant, "id" | "selected">;
