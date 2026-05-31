import type { EventCondition, Restaurant } from "./types";

/**
 * 共有 URL ペイロード。条件 + 候補店を URL に詰め込んで相手と共有する。
 * サーバー保存はせず、URL に base64 で全部詰める設計。
 *
 * 候補数が多いと URL がかなり長くなる（base64 は 1.33 倍程度に膨らむ）。
 * 実害が出るようなら gzip / pako 圧縮への移行を検討する。
 */
export interface SharePayload {
  condition: EventCondition;
  restaurants: Restaurant[];
  /** 互換性チェック用 */
  v?: number;
}

const SHARE_VERSION = 1;

/** Unicode 文字列 → base64（btoa 単体は Latin-1 しか扱えないため、UTF-8 セーフ変換を挟む） */
function utf8ToBase64(s: string): string {
  if (typeof window === "undefined") {
    // SSR/Node: Buffer フォールバック
    return Buffer.from(s, "utf-8").toString("base64");
  }
  // ブラウザ: encodeURIComponent → unescape → btoa
  return btoa(unescape(encodeURIComponent(s)));
}

/** base64 → Unicode 文字列 */
function base64ToUtf8(s: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(s, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(s)));
}

export function encodeShare(p: SharePayload): string {
  const json = JSON.stringify({ ...p, v: SHARE_VERSION });
  return utf8ToBase64(json);
}

export function decodeShare(s: string): SharePayload | null {
  try {
    const json = base64ToUtf8(s);
    const obj = JSON.parse(json) as Partial<SharePayload>;
    if (!obj || !obj.condition || !Array.isArray(obj.restaurants)) {
      return null;
    }
    return {
      condition: obj.condition as EventCondition,
      restaurants: obj.restaurants as Restaurant[],
      v: obj.v,
    };
  } catch {
    return null;
  }
}
