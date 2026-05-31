import type { Restaurant, SmokingStatus } from "./types";

/**
 * HotPepper Gourmet Search API のレスポンス型（必要な部分のみ）。
 * https://webservice.recruit.co.jp/doc/hotpepper/reference.html
 */
export interface HotPepperShop {
  id: string;
  name: string;
  name_kana?: string;
  address?: string;
  access?: string;
  urls?: {
    pc?: string;
  };
  catch?: string;
  genre?: {
    code?: string;
    name?: string;
    catch?: string;
  };
  budget?: {
    code?: string;
    name?: string;
    average?: string;
  };
  middle_area?: {
    code?: string;
    name?: string;
  };
  large_area?: {
    code?: string;
    name?: string;
  };
  free_drink?: string;
  private_room?: string;
  /** 緯度・経度（HotPepper Gourmet Search API のレスポンスに含まれる） */
  lat?: number;
  lng?: number;
  /**
   * 公式: "全面禁煙" / "禁煙席なし" / "分煙" / "禁煙席あり" 等。
   * 値が空 / 未設定の店もある。
   */
  non_smoking?: string;
  /**
   * 店舗写真 URL（PC 用 / モバイル用、L / M / S）。
   * https://webservice.recruit.co.jp/doc/hotpepper/reference.html
   */
  photo?: {
    pc?: {
      l?: string;
      m?: string;
      s?: string;
    };
    mobile?: {
      l?: string;
      s?: string;
    };
  };
  logo_image?: string;
}

export interface HotPepperResponse {
  results?: {
    api_version?: string;
    results_available?: number;
    results_returned?: string;
    results_start?: number;
    shop?: HotPepperShop[];
    error?: { code?: number; message?: string }[];
  };
}

/** ジャンル名から絵文字を推定する */
function pickEmoji(genreName: string): string {
  const g = genreName ?? "";
  if (g.includes("居酒屋")) return "🍻";
  if (g.includes("焼鳥") || g.includes("焼き鳥")) return "🐔";
  if (g.includes("寿司") || g.includes("鮨")) return "🍣";
  if (g.includes("イタリアン") || g.includes("フレンチ")) return "🍷";
  if (g.includes("中華")) return "🥟";
  if (g.includes("韓国")) return "🌶️";
  if (g.includes("バー") || g.includes("Bar")) return "🍸";
  if (g.includes("カフェ") || g.includes("Cafe")) return "☕";
  return "🍴";
}

/**
 * HotPepper の budget.name から min/max をパースする。
 * 例:
 *   "3001～4000円"  → min 3001, max 4000
 *   "4000円"        → min 4000, max 4000
 *   "～2000円"      → min 0,    max 2000
 *   "10000円～"     → min 10000, max 10000
 */
export function parseBudget(
  budgetName: string | undefined,
): { min: number; max: number } {
  const s = (budgetName ?? "").trim();
  if (!s) return { min: 0, max: 0 };

  // 全角・半角の波ダッシュ・ハイフンを統一
  const normalized = s.replace(/[〜～~ー−]/g, "~");

  // パターン: a~b円
  const range = normalized.match(/(\d+)\s*~\s*(\d+)\s*円?/);
  if (range) {
    const a = parseInt(range[1], 10);
    const b = parseInt(range[2], 10);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  // パターン: ~b円 (上限のみ)
  const upper = normalized.match(/^\s*~\s*(\d+)\s*円?/);
  if (upper) {
    const b = parseInt(upper[1], 10);
    return { min: 0, max: b };
  }

  // パターン: a~ または a円~ (下限のみ)
  const lower = normalized.match(/(\d+)\s*円?\s*~\s*$/);
  if (lower) {
    const a = parseInt(lower[1], 10);
    return { min: a, max: a };
  }

  // パターン: 単一値 "4000円"
  const single = normalized.match(/(\d+)\s*円/);
  if (single) {
    const a = parseInt(single[1], 10);
    return { min: a, max: a };
  }

  return { min: 0, max: 0 };
}

/**
 * HotPepper の non_smoking 文字列を SmokingStatus に変換する。
 * 公式に出てくる代表値:
 *   "全面禁煙"     → 全席禁煙 = 不可
 *   "禁煙席なし"   → 喫煙可
 *   "分煙"         → 分煙
 *   "禁煙席あり"   → 分煙扱い
 *   ""（未設定）   → 不明
 */
export function parseSmokingStatus(ns: string | undefined): SmokingStatus {
  const v = (ns ?? "").trim();
  if (!v) return "不明";
  // 「全面禁煙」「全席禁煙」「禁煙」だけ → 不可
  if (v.includes("全面禁煙") || v.includes("全席禁煙") || v === "禁煙") {
    return "不可";
  }
  // 「禁煙席なし」「喫煙可」「喫煙OK」 → 可
  if (
    v.includes("禁煙席なし") ||
    v.includes("喫煙可") ||
    v.includes("喫煙OK")
  ) {
    return "可";
  }
  // 「分煙」「禁煙席あり」「喫煙席あり」など → 分煙
  if (
    v.includes("分煙") ||
    v.includes("禁煙席あり") ||
    v.includes("喫煙席あり")
  ) {
    return "分煙";
  }
  return "不明";
}

/** access テキストから「徒歩 N 分」を抽出する。「徒歩約N分」「徒歩 N分」も拾う */
export function parseWalkingMinutes(access: string | undefined): number {
  const s = access ?? "";
  const m = s.match(/徒歩\s*約?\s*(\d+)\s*分/);
  if (m) {
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** HotPepper Shop → 内部の Restaurant 型 */
export function convertToRestaurant(shop: HotPepperShop): Restaurant {
  const genreName = shop.genre?.name ?? "";
  const budgetName = shop.budget?.name ?? "";
  const { min, max } = parseBudget(budgetName);
  const area =
    shop.middle_area?.name ?? shop.large_area?.name ?? "";

  const emoji = pickEmoji(genreName);
  const memo = (shop.catch || shop.genre?.catch || "").trim();
  const recommendPoint = (shop.genre?.catch || "").trim();

  // 店舗写真: PC L → PC M → モバイル L の順でフォールバック
  const photoUrl =
    shop.photo?.pc?.l ||
    shop.photo?.pc?.m ||
    shop.photo?.mobile?.l ||
    undefined;

  const lat =
    typeof shop.lat === "number" && Number.isFinite(shop.lat)
      ? shop.lat
      : undefined;
  const lng =
    typeof shop.lng === "number" && Number.isFinite(shop.lng)
      ? shop.lng
      : undefined;

  return {
    id: shop.id,
    name: shop.name,
    genre: genreName,
    url: shop.urls?.pc ?? "",
    area,
    budget: budgetName,
    budgetMin: min,
    budgetMax: max,
    googleRating: "",
    walkingMinutes: parseWalkingMinutes(shop.access),
    hasNomihodai: (shop.free_drink ?? "").includes("あり"),
    hasPrivateRoom: shop.private_room === "あり",
    memo,
    recommendPoint,
    cautionPoint: "",
    emoji,
    selected: true,
    address: (shop.address ?? "").trim(),
    smokingStatus: parseSmokingStatus(shop.non_smoking),
    photoUrl,
    lat,
    lng,
  };
}

/**
 * 予算上限（円/人）を HotPepper の budget code に変換する。
 * 不明な範囲（10000円以上）は undefined を返す。
 */
export function budgetLimitToCode(limit: number): string | undefined {
  if (!Number.isFinite(limit) || limit <= 0) return undefined;
  if (limit <= 1500) return "B011";
  if (limit <= 2000) return "B001";
  if (limit <= 3000) return "B002";
  if (limit <= 4000) return "B003";
  if (limit <= 5000) return "B008";
  if (limit <= 7000) return "B004";
  if (limit <= 10000) return "B005";
  return undefined;
}
