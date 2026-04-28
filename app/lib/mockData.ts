import type { Area, EventCondition, Scene } from "./types";

export const STORAGE_KEYS = {
  condition: "nomiris.condition.v2",
} as const;

export const AREAS: Area[] = ["新宿", "渋谷", "池袋", "恵比寿", "銀座"];
export const SCENES: Scene[] = [
  "会社飲み",
  "友達飲み",
  "会食",
  "懇親会",
  "デート",
  "二次会",
];

export const DEFAULT_CONDITION: EventCondition = {
  title: "新宿1軒目候補案",
  area: "新宿",
  scene: "会社飲み",
  peopleCount: 4,
  budgetLimit: 6000,
  walkingMinutes: 10,
  nomihodai: "あり",
  privateRoom: "どちらでも",
  atmosphere: "",
  participants: "",
  avoidPoints: "",
};
