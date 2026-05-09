"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import ProBadge from "../components/ProBadge";
import { useUpsell } from "../components/UpsellModal";
import {
  clearHistory,
  deleteHistory,
  loadHistory,
  type HistoryEntry,
} from "../lib/history";
import { STORAGE_KEYS } from "../lib/mockData";
import { MODE_EMOJIS, MODE_LABELS } from "../lib/mode";
import { usePlan } from "../lib/plan";
import type { EventCondition } from "../lib/types";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${mm}`;
}

export default function HistoryPage() {
  const { isPro, hydrated } = usePlan();
  const upsell = useUpsell();
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [hydratedHistory, setHydratedHistory] = useState(false);

  useEffect(() => {
    setEntries(loadHistory());
    setHydratedHistory(true);
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("この履歴を削除しますか？")) return;
    deleteHistory(id);
    setEntries(loadHistory());
  };

  const handleClearAll = () => {
    if (!confirm("すべての履歴を削除しますか？")) return;
    clearHistory();
    setEntries([]);
  };

  /** 履歴の condition を /app の localStorage に書き込み、/app へ遷移する */
  const handleRestore = (cond: EventCondition) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.condition,
        JSON.stringify(cond),
      );
      // バナーを再度出さないよう抑制（同セッション内）
      window.sessionStorage.setItem(
        STORAGE_KEYS.lastConditionBannerDismissed,
        "1",
      );
    } catch {
      /* noop */
    }
    router.push("/app");
  };

  const visibleEntries = isPro ? entries : entries.slice(0, 1);
  const hiddenCount = isPro ? 0 : Math.max(0, entries.length - 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-nomiris-brownDark">
                <span className="mr-1" aria-hidden>
                  📂
                </span>
                履歴
              </h1>
              <p className="mt-1 text-sm text-nomiris-textSub">
                {isPro
                  ? "過去に作成した候補・提案文を振り返れます。"
                  : "Free プランでは最新 1 件のみ閲覧できます。"}
              </p>
            </div>
            {entries.length > 0 && isPro && (
              <button
                type="button"
                className="nm-btn-ghost !py-1.5 !px-2 text-xs text-red-700"
                onClick={handleClearAll}
              >
                🗑 全削除
              </button>
            )}
          </div>

          {!hydrated || !hydratedHistory ? (
            <p className="text-sm text-nomiris-textSub">読み込み中…</p>
          ) : entries.length === 0 ? (
            <div className="nm-card text-center text-sm text-nomiris-textSub">
              まだ履歴がありません。トップで候補を作ると、ここに記録されます 🐿️
              <div className="mt-4">
                <Link href="/" className="nm-btn-primary text-sm">
                  🐿️ 候補を作る
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleEntries.map((e) => (
                <li key={e.id}>
                  <HistoryCard
                    entry={e}
                    onDelete={() => handleDelete(e.id)}
                    onRestore={() => handleRestore(e.condition)}
                  />
                </li>
              ))}
              {hiddenCount > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      upsell.open({
                        title: `${hiddenCount} 件の履歴は Pro で閲覧できます`,
                        description:
                          "Free プランでは履歴は最新 1 件のみ。Pro なら最大 100 件まで保存・参照できます。",
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
                      + {hiddenCount} 件を Pro で見る
                    </p>
                    <p className="mt-1 text-xs text-amber-900/70">
                      Pro なら過去の候補と提案文をすべて振り返れます。
                    </p>
                  </button>
                </li>
              )}
            </ul>
          )}

          <div>
            <Link href="/" className="nm-btn-ghost text-sm">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatBudgetRange(c: EventCondition): string | null {
  // 後方互換: budgetLimit が残っている古い履歴も読み込めるよう any キャストでフォールバック
  const legacy = (c as unknown as { budgetLimit?: number }).budgetLimit ?? 0;
  const min = c.budgetMin ?? 0;
  const max = c.budgetMax ?? 0;
  if (min === 0 && max === 0 && legacy === 0) return null;
  if (min === 0 && max === 0 && legacy > 0) {
    return `〜¥${legacy.toLocaleString()}/人`;
  }
  if (min > 0 && max > 0) {
    return `¥${min.toLocaleString()}〜¥${max.toLocaleString()}/人`;
  }
  if (min === 0 && max > 0) return `〜¥${max.toLocaleString()}/人`;
  if (min > 0 && max === 0) return `¥${min.toLocaleString()}〜/人`;
  return null;
}

function HistoryCard({
  entry,
  onDelete,
  onRestore,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [open, setOpen] = useState(false);
  const c = entry.condition;
  const restaurantCount = entry.restaurants.filter((r) => r.selected).length;
  const budgetText = formatBudgetRange(c);

  return (
    <div className="nm-card space-y-2">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-nomiris-textSub">
            {formatDate(entry.createdAt)}
          </p>
          <h3 className="text-base font-bold text-nomiris-brownDark flex items-center gap-1.5 flex-wrap">
            <span aria-hidden>{MODE_EMOJIS[c.mode] ?? "🍻"}</span>
            <span>{MODE_LABELS[c.mode] ?? "カジュアル飲み"}</span>
            {c.scene && (
              <span className="text-xs font-semibold text-nomiris-textSub">
                · {c.scene}
              </span>
            )}
          </h3>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-700 hover:bg-red-50 rounded-full px-2 py-1"
          aria-label="履歴を削除"
        >
          🗑
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5 text-xs text-nomiris-brown">
        {c.area && <span className="nm-chip">📍 {c.area}</span>}
        {c.peopleCount > 0 && (
          <span className="nm-chip">👥 {c.peopleCount}名</span>
        )}
        {budgetText && <span className="nm-chip">{budgetText}</span>}
        <span className="nm-chip">候補 {restaurantCount} 件</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-3 py-1.5 text-xs shadow-sm hover:from-amber-600 hover:to-orange-600 transition"
        >
          🔁 この条件で再開
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-nomiris-orange hover:underline"
        >
          {open ? "詳細を閉じる" : "詳細を見る"}
        </button>
      </div>

      {open && (
        <div className="space-y-3 pt-2 border-t border-nomiris-line/60">
          <div>
            <p className="text-xs font-bold text-nomiris-brown">候補店</p>
            <ul className="mt-1 list-disc pl-5 text-xs text-nomiris-textMain space-y-0.5">
              {entry.restaurants
                .filter((r) => r.selected)
                .map((r) => (
                  <li key={r.id}>
                    {r.emoji} {r.name}
                    {r.genre ? `（${r.genre}）` : ""}
                    {r.budget ? ` / ${r.budget}` : ""}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-nomiris-brown">生成された文面</p>
            <ul className="mt-1 space-y-2">
              {Object.entries(entry.generatedTexts).map(([id, text]) => (
                <li key={id} className="rounded-xl border border-nomiris-line/60 bg-nomiris-cream/40 p-2">
                  <p className="text-[10px] font-bold text-nomiris-brown">
                    {id}
                  </p>
                  <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-nomiris-textMain">
                    {text}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
