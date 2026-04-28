import type { CatalogEntry, EventCondition, Restaurant } from "./types";

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Fisher-Yates shuffle (in place) */
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ratingNum(r: CatalogEntry): number {
  const n = parseFloat(r.googleRating);
  return Number.isFinite(n) ? n : 0;
}

/** カタログから条件に合う候補を pick する */
export function pickCandidates(
  catalog: CatalogEntry[],
  condition: EventCondition,
  count?: number,
): Restaurant[] {
  // 件数: 引数指定があればそれ、なければ 3〜5 のランダム
  const target =
    typeof count === "number"
      ? Math.max(1, Math.floor(count))
      : 3 + Math.floor(Math.random() * 3); // 3,4,5

  // 1. 予算オーバーは除外
  const budgetLimit = condition.budgetLimit > 0 ? condition.budgetLimit : Infinity;
  const inBudget = catalog.filter((c) => c.budgetMin <= budgetLimit);

  // 2. エリア完全一致でフィルタ
  const sameArea = inBudget.filter((c) => c.area === condition.area);
  let pool: CatalogEntry[];

  if (sameArea.length >= target) {
    pool = sameArea;
  } else {
    // 同エリアで足りなければ他エリアも混ぜる（同エリア優先で並べる）
    const other = inBudget.filter((c) => c.area !== condition.area);
    pool = [...sameArea, ...other];
  }

  // 候補が空のセーフガード
  if (pool.length === 0) {
    pool = [...catalog];
  }

  // 3. シャッフルしたあと、評価で軽くソート（評価が同じならシャッフル順を維持）
  const shuffled = shuffleInPlace([...pool]);
  shuffled.sort((a, b) => ratingNum(b) - ratingNum(a));

  // 同エリア優先（同エリアグループだけで足りる場合は同エリアから取る）を維持
  const picked = shuffled.slice(0, Math.min(target, shuffled.length));

  return picked.map<Restaurant>((entry) => ({
    ...entry,
    id: makeId(),
    selected: true,
  }));
}
