import type { Mode, Plan } from "./types";

export type { Mode };

export const MODE_LABELS: Record<Mode, string> = {
  casual: "カジュアル飲み",
  business: "仕事・会食",
  date: "デート",
};

export const MODE_EMOJIS: Record<Mode, string> = {
  casual: "🍻",
  business: "💼",
  date: "💕",
};

export const MODE_DESCRIPTIONS: Record<Mode, string> = {
  casual: "友達・サークル・同期との飲み会に",
  business: "社内提案・社外共有・接待・お礼メールまで",
  date: "初デート・マッチングアプリ・お礼LINEまで",
};

/** モード自体の利用可否プラン（カジュアルは Free、業務とデートは Pro） */
export const MODE_PLANS: Record<Mode, Plan> = {
  casual: "free",
  business: "pro",
  date: "pro",
};

export const ALL_MODES: Mode[] = ["casual", "business", "date"];

/**
 * モード別の用途（scene）選択肢。
 * proGate が true のものは Free ユーザーには Pro 機能としてロックする。
 */
export interface SceneOption {
  value: string;
  label: string;
  proGate?: boolean;
}

export const SCENE_OPTIONS_BY_MODE: Record<Mode, SceneOption[]> = {
  casual: [
    { value: "友達飲み", label: "友達飲み" },
    { value: "サークル", label: "サークル" },
    { value: "同期", label: "同期" },
    { value: "普通の飲み会", label: "普通の飲み会" },
    { value: "二次会", label: "二次会" },
    { value: "歓送迎会", label: "歓送迎会" },
  ],
  business: [
    { value: "社内飲み", label: "社内飲み" },
    { value: "上司との飲み", label: "上司との飲み", proGate: true },
    { value: "社内会食", label: "社内会食" },
    { value: "社外会食", label: "社外会食", proGate: true },
    { value: "接待", label: "接待", proGate: true },
    { value: "歓送迎会", label: "歓送迎会" },
  ],
  date: [
    { value: "初デート", label: "初デート", proGate: true },
    { value: "マッチングアプリ", label: "マッチングアプリ", proGate: true },
    { value: "2回目以降のデート", label: "2回目以降のデート" },
  ],
};

/** 雰囲気タグの候補 */
export const ATMOSPHERE_TAGS: string[] = [
  "カジュアル",
  "落ち着き",
  "おしゃれ",
  "個室",
  "にぎやか",
  "高級感",
  "コスパ重視",
];

/** 重視することタグの候補 */
export const IMPORTANT_TAGS: string[] = [
  "駅近",
  "個室",
  "飲み放題",
  "安さ",
  "雰囲気",
  "料理の質",
  "失礼がないこと",
  "2回目につながること",
];
