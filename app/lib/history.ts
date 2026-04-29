import { STORAGE_KEYS } from "./mockData";
import type { EventCondition, Plan, Restaurant } from "./types";

export const HISTORY_KEY = STORAGE_KEYS.history;

export interface HistoryEntry {
  id: string;
  createdAt: number;
  condition: EventCondition;
  restaurants: Restaurant[];
  /** templateId → 生成テキスト */
  generatedTexts: Record<string, string>;
}

const MAX_PRO_HISTORY = 100;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

function isHistoryEntry(v: unknown): v is HistoryEntry {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.createdAt === "number" &&
    typeof o.condition === "object" &&
    Array.isArray(o.restaurants) &&
    typeof o.generatedTexts === "object"
  );
}

/**
 * 履歴を保存。
 * - free: 配列を [entry] で上書き（最新 1 件のみ保持）
 * - pro:  先頭 push、MAX_PRO_HISTORY 件で丸める
 */
export function saveHistory(entry: HistoryEntry, plan: Plan): void {
  if (typeof window === "undefined") return;
  try {
    if (plan === "free") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([entry]));
      return;
    }
    const current = loadHistory();
    // 同じ id があれば置き換え、そうでなければ先頭 push
    const filtered = current.filter((e) => e.id !== entry.id);
    const next = [entry, ...filtered].slice(0, MAX_PRO_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function deleteHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadHistory();
    const next = current.filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* noop */
  }
}

export function makeHistoryId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
