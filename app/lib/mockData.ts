import type { EventCondition } from "./types";

/**
 * localStorage キー。EventCondition のスキーマ変更時はバージョンを bump する。
 * v3 → v4: mode / atmosphereTags / importantTags / desiredDate を追加、
 *          area / scene を string 化。
 * v4 → v5: originStation（出発地）を追加（Pro 機能：Distance Matrix）。
 */
export const STORAGE_KEYS = {
  condition: "nomiris.condition.v5",
  history: "nomiris.history.v1",
  plan: "nomiris.plan.v1",
} as const;

/** エリアの suggestion（datalist で使う。自由入力可） */
export const AREA_SUGGESTIONS: string[] = [
  "新宿",
  "渋谷",
  "池袋",
  "恵比寿",
  "銀座",
  "横浜",
  "梅田",
  "六本木",
  "大阪",
  "名古屋",
];

/** 後方互換のため AREAS も残す */
export const AREAS: string[] = AREA_SUGGESTIONS;

/** 後方互換用の SCENES（mode 別の選択肢は SCENE_OPTIONS_BY_MODE を使う） */
export const SCENES: string[] = [
  "会社飲み",
  "友達飲み",
  "会食",
  "懇親会",
  "デート",
  "二次会",
];

export const DEFAULT_CONDITION: EventCondition = {
  mode: "casual",
  area: "新宿",
  scene: "友達飲み",
  peopleCount: 4,
  budgetLimit: 6000,
  nearestStation: "",
  walkingMinutes: 10,
  nomihodai: "あり",
  privateRoom: "どちらでも",
  atmosphereTags: [],
  importantTags: [],
  atmosphere: "",
  participants: "",
  avoidPoints: "",
  desiredDate: "",
  originStation: "",
};
