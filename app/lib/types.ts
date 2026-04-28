export type Tone = "カジュアル" | "丁寧" | "社内向け";
export type YesNoEither = "あり" | "なし" | "どちらでも";

export interface EventCondition {
  title: string;
  area: string;
  scene: string;
  peopleCount: number;
  budgetLimit: number;
  walkingMinutes: number;
  nomihodai: YesNoEither;
  privateRoom: YesNoEither;
  atmosphere: string;
  participants: string;
  priorities: string;
  avoidPoints: string;
  tone: Tone;
}

export interface Restaurant {
  id: string;
  name: string;
  genre: string;
  url: string;
  area: string;
  budget: string;
  googleRating: string;
  tabelogRating: string;
  walkingMinutes: number;
  hasNomihodai: boolean;
  hasPrivateRoom: boolean;
  memo: string;
  recommendPoint: string;
  cautionPoint: string;
  emoji: string;
  selected: boolean;
}
