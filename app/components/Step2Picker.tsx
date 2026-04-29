"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventCondition, Restaurant } from "../lib/types";
import { CATALOG } from "../lib/catalog";
import { pickCandidates } from "../lib/pick";
import AddRestaurantForm from "./AddRestaurantForm";
import CandidateCard from "./CandidateCard";

interface Props {
  condition: EventCondition;
  candidates: Restaurant[];
  setCandidates: (next: Restaurant[]) => void;
  onBack: () => void;
  onNext: () => void;
}

type DataSource = "hotpepper" | "catalog" | null;

interface ApiResult {
  shops: Restaurant[];
  error?: string;
}

/** Fisher-Yates shuffle */
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** ランダムに 3〜5 件選ぶ。pool が足りなければ全件返す */
function pickRandom(pool: Restaurant[]): Restaurant[] {
  const target = 3 + Math.floor(Math.random() * 3); // 3,4,5
  const shuffled = shuffleInPlace([...pool]);
  return shuffled.slice(0, Math.min(target, shuffled.length));
}

/** 予算上限でフィルタ。budgetMax が 0（未取得）は通す。 */
function filterByBudget(shops: Restaurant[], limit: number): Restaurant[] {
  if (!Number.isFinite(limit) || limit <= 0) return shops;
  return shops.filter((s) => s.budgetMax === 0 || s.budgetMax <= limit);
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

  // HotPepper から取得した shops のプール（再シャッフル用に保持）
  const hotpepperPoolRef = useRef<Restaurant[]>([]);
  // 既に初期取得を行ったかどうか（StrictMode の重複実行を抑える）
  const hasFetchedRef = useRef(false);

  const fallbackToCatalog = useCallback(() => {
    hotpepperPoolRef.current = [];
    setDataSource("catalog");
    setCandidates(pickCandidates(CATALOG, condition));
  }, [condition, setCandidates]);

  const loadFromHotPepper = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (condition.nearestStation.trim()) {
        params.set("station", condition.nearestStation.trim());
      }
      if (condition.area) params.set("area", condition.area);
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
      setCandidates(pickRandom(pool));
    } catch {
      fallbackToCatalog();
    } finally {
      setLoading(false);
    }
  }, [
    condition.nearestStation,
    condition.area,
    condition.budgetLimit,
    condition.scene,
    fallbackToCatalog,
    setCandidates,
  ]);

  // 初回マウント時に HotPepper API を叩く（既に候補があればスキップ）
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (candidates.length > 0) {
      // 戻ってきた場合：再フェッチはせず、現在の候補をそのまま使う
      // （データソース表示は不明として null のまま）
      return;
    }
    void loadFromHotPepper();
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCount = candidates.filter((r) => r.selected).length;
  const total = candidates.length;
  const canProceed = selectedCount > 0;

  const handleReroll = () => {
    if (dataSource === "hotpepper" && hotpepperPoolRef.current.length > 0) {
      // HotPepper のプールから再シャッフル（再フェッチはしない）
      setCandidates(pickRandom(hotpepperPoolRef.current));
    } else {
      // カタログ fallback の場合はカタログから再ピック
      setDataSource("catalog");
      setCandidates(pickCandidates(CATALOG, condition));
    }
  };

  const toggleSelect = (id: string) => {
    setCandidates(
      candidates.map((r) =>
        r.id === id ? { ...r, selected: !r.selected } : r,
      ),
    );
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter((r) => r.id !== id));
  };

  const addCandidate = (
    draft: Omit<Restaurant, "id" | "selected">,
  ) => {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setCandidates([...candidates, { ...draft, id, selected: true }]);
    setShowAddForm(false);
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
              条件に合う候補を {total} 件ピックしました。チェックを外すと提案文に含まれません。
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
            </p>

            {total === 0 ? (
              <div className="rounded-xl border border-dashed border-nomiris-line bg-nomiris-cream/50 p-6 text-center text-nomiris-textSub">
                候補がありません。「もう一度引く」または「自分で候補を追加」してください 🐿️
              </div>
            ) : (
              <ul className="space-y-3">
                {candidates.map((r) => (
                  <li key={r.id}>
                    <CandidateCard
                      restaurant={r}
                      onToggle={() => toggleSelect(r.id)}
                      onDelete={() => removeCandidate(r.id)}
                    />
                  </li>
                ))}
              </ul>
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
            onClick={() => setShowAddForm(true)}
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
