"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventCondition, Restaurant } from "../lib/types";
import { CATALOG } from "../lib/catalog";
import { pickCandidates } from "../lib/pick";
import { usePlan } from "../lib/plan";
import AddRestaurantForm from "./AddRestaurantForm";
import CandidateCard from "./CandidateCard";
import ProBadge from "./ProBadge";
import { useUpsell } from "./UpsellModal";

interface Props {
  condition: EventCondition;
  candidates: Restaurant[];
  setCandidates: (next: Restaurant[]) => void;
  onBack: () => void;
  onNext: () => void;
}

type DataSource = "hotpepper" | "catalog" | null;
type ViewTab = "card" | "compare";

interface ApiResult {
  shops: Restaurant[];
  error?: string;
}

const FREE_LIMIT = 3;

/** Fisher-Yates shuffle */
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** ランダムに count 件選ぶ */
function pickRandom(pool: Restaurant[], count: number): Restaurant[] {
  const shuffled = shuffleInPlace([...pool]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** 予算上限でフィルタ。budgetMax が 0（未取得）は通す。 */
function filterByBudget(shops: Restaurant[], limit: number): Restaurant[] {
  if (!Number.isFinite(limit) || limit <= 0) return shops;
  return shops.filter((s) => s.budgetMax === 0 || s.budgetMax <= limit);
}

/** 評価値をパース */
function ratingNum(r: Restaurant): number {
  const n = parseFloat(r.googleRating);
  return Number.isFinite(n) ? n : 0;
}

/** AI おすすめ順位（評価＋徒歩分） */
function recommendScore(r: Restaurant): number {
  const rating = ratingNum(r);
  const walkPenalty = r.walkingMinutes > 0 ? Math.min(r.walkingMinutes, 15) / 15 : 0.5;
  const privateBonus = r.hasPrivateRoom ? 0.3 : 0;
  return rating - walkPenalty * 0.5 + privateBonus;
}

export default function Step2Picker({
  condition,
  candidates,
  setCandidates,
  onBack,
  onNext,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("card");

  const { isPro } = usePlan();
  const upsell = useUpsell();

  // HotPepper から取得した shops のプール（再シャッフル用に保持）
  const hotpepperPoolRef = useRef<Restaurant[]>([]);
  // 既に初期取得を行ったかどうか（StrictMode の重複実行を抑える）
  const hasFetchedRef = useRef(false);

  const targetCount = isPro ? 3 + Math.floor(Math.random() * 3) : FREE_LIMIT;

  const fallbackToCatalog = useCallback(() => {
    hotpepperPoolRef.current = [];
    setDataSource("catalog");
    const count = isPro ? undefined : FREE_LIMIT;
    setCandidates(pickCandidates(CATALOG, condition, count));
  }, [condition, setCandidates, isPro]);

  const loadFromHotPepper = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (condition.nearestStation.trim()) {
        params.set("station", condition.nearestStation.trim());
      }
      if (condition.area) params.set("area", condition.area);
      if (condition.areaCode) params.set("areaCode", condition.areaCode);
      if (condition.budgetLimit > 0) {
        params.set("budget", String(condition.budgetLimit));
      }
      if (condition.scene) params.set("scene", condition.scene);

      const res = await fetch(`/api/hotpepper?${params.toString()}`, {
        method: "GET",
      });
      if (!res.ok) {
        fallbackToCatalog();
        return;
      }
      const json = (await res.json()) as ApiResult;
      if (json.error || json.shops.length === 0) {
        fallbackToCatalog();
        return;
      }

      const filtered = filterByBudget(json.shops, condition.budgetLimit);
      const pool = filtered.length > 0 ? filtered : json.shops;

      if (pool.length === 0) {
        fallbackToCatalog();
        return;
      }

      hotpepperPoolRef.current = pool;
      setDataSource("hotpepper");
      setCandidates(pickRandom(pool, targetCount));
    } catch {
      fallbackToCatalog();
    } finally {
      setLoading(false);
    }
  }, [
    condition.nearestStation,
    condition.area,
    condition.areaCode,
    condition.budgetLimit,
    condition.scene,
    fallbackToCatalog,
    setCandidates,
    targetCount,
  ]);

  // 初回マウント時に HotPepper API を叩く（既に候補があればスキップ）
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (candidates.length > 0) {
      return;
    }
    void loadFromHotPepper();
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCount = candidates.filter((r) => r.selected).length;
  const total = candidates.length;
  const canProceed = selectedCount > 0;

  /** Free が選択上限を超えそうなときに弾く */
  const tryToggleSelect = (id: string) => {
    const target = candidates.find((r) => r.id === id);
    if (!target) return;
    const willBeSelected = !target.selected;
    if (!isPro && willBeSelected) {
      const nextSelected = candidates.filter((r) => r.selected).length + 1;
      if (nextSelected > FREE_LIMIT) {
        upsell.open({
          title: "Free プランは 3 件までです",
          description:
            "候補店の選択は Free 3 件まで。Pro なら無制限に選べて、比較表のフル列も使えます。",
        });
        return;
      }
    }
    setCandidates(
      candidates.map((r) =>
        r.id === id ? { ...r, selected: !r.selected } : r,
      ),
    );
  };

  const handleReroll = () => {
    if (dataSource === "hotpepper" && hotpepperPoolRef.current.length > 0) {
      setCandidates(pickRandom(hotpepperPoolRef.current, targetCount));
    } else {
      setDataSource("catalog");
      setCandidates(pickCandidates(CATALOG, condition, isPro ? undefined : FREE_LIMIT));
    }
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter((r) => r.id !== id));
  };

  const addCandidate = (
    draft: Omit<Restaurant, "id" | "selected">,
  ) => {
    if (!isPro && candidates.length >= FREE_LIMIT) {
      upsell.open({
        title: "Free プランの候補追加は 3 件までです",
        description: "Pro なら候補店を無制限に追加できます。",
      });
      return;
    }
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setCandidates([...candidates, { ...draft, id, selected: true }]);
    setShowAddForm(false);
  };

  // Free モードで HotPepper / カタログ プールから 4 件目以降を「ロック」表示
  const lockedExtras = useMemo<Restaurant[]>(() => {
    if (isPro) return [];
    const pool = hotpepperPoolRef.current;
    if (!pool || pool.length === 0) return [];
    const visibleIds = new Set(candidates.map((c) => c.id));
    return pool.filter((p) => !visibleIds.has(p.id)).slice(0, 3);
  }, [isPro, candidates]);

  const handleAddClick = () => {
    if (!isPro && candidates.length >= FREE_LIMIT) {
      upsell.open({
        title: "Free プランの候補追加は 3 件までです",
        description: "Pro なら候補店を無制限に追加できます。",
      });
      return;
    }
    setShowAddForm(true);
  };

  return (
    <div className="space-y-5">
      <section className="nm-card space-y-3">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-nomiris-brownDark">
              <span className="mr-1" aria-hidden>
                🍻
              </span>
              候補をピック
            </h2>
            <p className="mt-1 text-xs text-nomiris-textSub">
              {isPro
                ? `条件に合う候補を ${total} 件ピックしました。チェックを外すと提案文に含まれません。`
                : `Free プランは ${FREE_LIMIT} 件まで表示。Pro なら無制限に表示・選択できます。`}
            </p>
          </div>
          <button
            type="button"
            className="nm-btn-secondary !py-2 !px-3 text-sm shrink-0"
            onClick={handleReroll}
            disabled={loading}
          >
            🎲 もう一度引く
          </button>
        </header>

        {dataSource && !loading && (
          <p className="text-[11px] text-nomiris-textSub">
            {dataSource === "hotpepper"
              ? "📡 HotPepper グルメサーチから取得"
              : "📚 組み込みカタログから取得"}
          </p>
        )}

        {/* タブ切替（カード / 比較表） */}
        <div className="flex gap-1 rounded-full bg-nomiris-cream p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewTab("card")}
            className={`flex-1 rounded-full px-3 py-1.5 transition ${
              viewTab === "card"
                ? "bg-white text-nomiris-brownDark shadow-sm"
                : "text-nomiris-textSub"
            }`}
          >
            🗂 カード
          </button>
          <button
            type="button"
            onClick={() => setViewTab("compare")}
            className={`flex-1 rounded-full px-3 py-1.5 transition ${
              viewTab === "compare"
                ? "bg-white text-nomiris-brownDark shadow-sm"
                : "text-nomiris-textSub"
            }`}
          >
            📊 比較表
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-nomiris-line bg-nomiris-cream/50 p-6 text-center text-nomiris-brown">
            <span className="inline-block animate-pulse">
              お店を探しています…🐿️
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-nomiris-brown">
              {total} 件中{" "}
              <span className="text-nomiris-orange">{selectedCount}</span>{" "}
              件を選択中
              {!isPro && (
                <span className="ml-2 text-[11px] font-normal text-amber-700">
                  （Free は最大 {FREE_LIMIT} 件）
                </span>
              )}
            </p>

            {total === 0 ? (
              <div className="rounded-xl border border-dashed border-nomiris-line bg-nomiris-cream/50 p-6 text-center text-nomiris-textSub">
                候補がありません。「もう一度引く」または「自分で候補を追加」してください 🐿️
              </div>
            ) : viewTab === "card" ? (
              <ul className="space-y-3">
                {candidates.map((r) => (
                  <li key={r.id}>
                    <CandidateCard
                      restaurant={r}
                      onToggle={() => tryToggleSelect(r.id)}
                      onDelete={() => removeCandidate(r.id)}
                    />
                  </li>
                ))}
                {!isPro && lockedExtras.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        upsell.open({
                          title: `+ ${lockedExtras.length} 件を Pro 版で見る`,
                          description:
                            "Pro なら候補店を無制限に表示できます。比較表のフル列（AI おすすめ順位 / 懸念点 / 接待・デート向きコメント）もすべて解放されます。",
                        })
                      }
                      className="w-full rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 text-center transition hover:bg-amber-100/60"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl" aria-hidden>
                          🔒
                        </span>
                        <ProBadge />
                      </div>
                      <p className="mt-2 font-bold text-amber-900">
                        + {lockedExtras.length} 件を Pro 版で見る
                      </p>
                      <p className="mt-1 text-xs text-amber-900/70">
                        Pro なら候補店を無制限に表示・比較できます。
                      </p>
                    </button>
                  </li>
                )}
              </ul>
            ) : (
              <CompareTable
                rows={candidates}
                lockedExtras={lockedExtras}
                isPro={isPro}
                onToggle={tryToggleSelect}
                onUpsell={() =>
                  upsell.open({
                    title: "比較表のフル列は Pro 機能です",
                    description:
                      "AI おすすめ順位・懸念点・接待 / デート向きコメントは Pro 版で解放されます。",
                  })
                }
              />
            )}
          </>
        )}
      </section>

      <section className="nm-card">
        {showAddForm ? (
          <AddRestaurantForm
            defaultArea={condition.area}
            onAdd={addCandidate}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            type="button"
            className="nm-btn-secondary w-full"
            onClick={handleAddClick}
          >
            ＋ 自分で候補を追加
          </button>
        )}
      </section>

      <div className="flex justify-between gap-2">
        <button type="button" className="nm-btn-ghost" onClick={onBack}>
          ← 戻る
        </button>
        <button
          type="button"
          className="nm-btn-primary"
          onClick={onNext}
          disabled={!canProceed || loading}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}

interface CompareProps {
  rows: Restaurant[];
  lockedExtras: Restaurant[];
  isPro: boolean;
  onToggle: (id: string) => void;
  onUpsell: () => void;
}

function CompareTable({ rows, lockedExtras, isPro, onToggle, onUpsell }: CompareProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-nomiris-line/70">
      <table className="min-w-full text-xs">
        <thead className="bg-nomiris-cream text-nomiris-brown">
          <tr>
            <th className="p-2 text-left font-bold">選択</th>
            <th className="p-2 text-left font-bold">店名</th>
            <th className="p-2 text-left font-bold">予算</th>
            <th className="p-2 text-left font-bold">エリア</th>
            <th className="p-2 text-left font-bold">徒歩</th>
            <th className="p-2 text-left font-bold">ジャンル</th>
            <th className="p-2 text-center font-bold">個室</th>
            <th className="p-2 text-center font-bold">飲放</th>
            <th className="p-2 text-left font-bold">おすすめ度</th>
            <th className="p-2 text-left font-bold whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                AI おすすめ順位 {!isPro && <ProBadge className="!text-[9px] !px-1.5" />}
              </span>
            </th>
            <th className="p-2 text-left font-bold whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                懸念点 {!isPro && <ProBadge className="!text-[9px] !px-1.5" />}
              </span>
            </th>
            <th className="p-2 text-left font-bold whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                向き コメント {!isPro && <ProBadge className="!text-[9px] !px-1.5" />}
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {[...rows]
            .sort((a, b) => recommendScore(b) - recommendScore(a))
            .map((r, idx) => (
              <tr key={r.id} className="border-t border-nomiris-line/60">
                <td className="p-2 align-top">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-nomiris-orange"
                    checked={r.selected}
                    onChange={() => onToggle(r.id)}
                    aria-label={`${r.name}を選択`}
                  />
                </td>
                <td className="p-2 align-top font-bold text-nomiris-brownDark whitespace-nowrap">
                  {r.emoji} {r.name}
                </td>
                <td className="p-2 align-top whitespace-nowrap">{r.budget || "—"}</td>
                <td className="p-2 align-top whitespace-nowrap">{r.area || "—"}</td>
                <td className="p-2 align-top whitespace-nowrap">
                  {r.walkingMinutes > 0 ? `${r.walkingMinutes}分` : "—"}
                </td>
                <td className="p-2 align-top whitespace-nowrap">{r.genre || "—"}</td>
                <td className="p-2 align-top text-center">
                  {r.hasPrivateRoom ? "○" : "—"}
                </td>
                <td className="p-2 align-top text-center">
                  {r.hasNomihodai ? "○" : "—"}
                </td>
                <td className="p-2 align-top whitespace-nowrap">
                  {ratingNum(r) > 0 ? `★ ${ratingNum(r).toFixed(1)}` : "—"}
                </td>
                {/* Pro 列 */}
                <td className="p-2 align-top">
                  {isPro ? (
                    <span className="font-bold text-amber-700">#{idx + 1}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={onUpsell}
                      className="text-amber-700 underline decoration-dotted hover:text-amber-900"
                    >
                      🔒 Pro
                    </button>
                  )}
                </td>
                <td className="p-2 align-top">
                  {isPro ? (
                    <span className="text-nomiris-textSub">
                      {r.cautionPoint || "—"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onUpsell}
                      className="text-amber-700 underline decoration-dotted hover:text-amber-900"
                    >
                      🔒 Pro
                    </button>
                  )}
                </td>
                <td className="p-2 align-top max-w-[200px]">
                  {isPro ? (
                    <span className="text-nomiris-textSub">
                      {r.recommendPoint || "—"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onUpsell}
                      className="text-amber-700 underline decoration-dotted hover:text-amber-900"
                    >
                      🔒 Pro
                    </button>
                  )}
                </td>
              </tr>
            ))}
          {!isPro &&
            lockedExtras.map((r) => (
              <tr key={r.id} className="border-t border-amber-200/60 bg-amber-50/40">
                <td colSpan={12} className="p-2">
                  <button
                    type="button"
                    onClick={onUpsell}
                    className="w-full text-left text-xs text-amber-900 hover:text-amber-950"
                  >
                    🔒 {r.name}（{r.area}） — Pro で全件比較
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
