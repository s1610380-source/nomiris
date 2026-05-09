"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EventCondition, Restaurant } from "../lib/types";
import { MODE_EMOJIS, MODE_LABELS } from "../lib/mode";
import { usePlan } from "../lib/plan";
import {
  generateText,
  templatesForMode,
  type TemplateId,
  type TemplateMeta,
} from "../lib/templates";
import {
  makeHistoryId,
  saveHistory,
  type HistoryEntry,
} from "../lib/history";
import { fetchDistances } from "../lib/distance";
import { STORAGE_KEYS } from "../lib/mockData";
import ProBadge from "./ProBadge";
import ProLock from "./ProLock";
import { useUpsell } from "./UpsellModal";

interface Props {
  condition: EventCondition;
  candidates: Restaurant[];
  onBack: () => void;
  /** 別の会で新しく作る（条件もリセット） */
  onRestart: () => void;
  /** 同じ条件でもう一度（条件は維持して Step1 へ） */
  onRestartSameCondition?: () => void;
}

export default function Step3Proposal({
  condition,
  candidates,
  onBack,
  onRestart,
  onRestartSameCondition,
}: Props) {
  const { plan, isPro } = usePlan();
  const upsell = useUpsell();

  // Pro で出発地が入力されている場合、Distance Matrix で距離を取得して
  // selected な候補にマージする。元の candidates は書き換えない。
  const [enriched, setEnriched] = useState<Restaurant[]>(candidates);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  // candidates が変わったら enriched をリセット → 再フェッチ
  useEffect(() => {
    setEnriched(candidates);
    setDistanceError(null);
  }, [candidates]);

  const originStationTrimmed = condition.originStation.trim();

  // selected かつ distanceFromOrigin 未設定のものがある場合に取得
  useEffect(() => {
    if (!isPro) return;
    if (!originStationTrimmed) return;

    const targets = enriched.filter(
      (r) => r.selected && !r.distanceFromOrigin,
    );
    if (targets.length === 0) return;

    let cancelled = false;
    setDistanceLoading(true);
    setDistanceError(null);

    const destinations = targets.map((r) => {
      const addr = (r.address ?? "").trim();
      if (addr) return addr;
      const areaPart = r.area ? ` ${r.area}` : "";
      return `${r.name}${areaPart}`.trim();
    });

    fetchDistances(originStationTrimmed, destinations, "walking")
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setDistanceError(res.error ?? "unknown");
          setDistanceLoading(false);
          return;
        }
        const originLabel = res.origin || originStationTrimmed;
        const byId = new Map<string, Restaurant>();
        targets.forEach((r, i) => {
          const el = res.elements[i];
          if (!el || el.status !== "OK") return;
          byId.set(r.id, {
            ...r,
            distanceFromOrigin: {
              walkMinutes: el.durationMinutes,
              walkMeters: el.distanceMeters,
              distanceText: el.distanceText,
              durationText: el.durationText,
              originLabel,
            },
          });
        });
        if (byId.size === 0) {
          setDistanceLoading(false);
          return;
        }
        setEnriched((prev) =>
          prev.map((r) => (byId.has(r.id) ? byId.get(r.id)! : r)),
        );
        setDistanceLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setDistanceError("fetch_failed");
        setDistanceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enriched, isPro, originStationTrimmed]);

  const selected = useMemo(
    () => enriched.filter((r) => r.selected),
    [enriched],
  );

  const templates = useMemo<TemplateMeta[]>(
    () => templatesForMode(condition.mode),
    [condition.mode],
  );

  /** id → text */
  const buildAll = useMemo(() => {
    const out: Record<string, string> = {};
    templates.forEach((tpl) => {
      out[tpl.id] = generateText(tpl.id, condition, selected);
    });
    return out;
  }, [condition, selected, templates]);

  const [texts, setTexts] = useState<Record<string, string>>(buildAll);
  const [toast, setToast] = useState<string | null>(null);

  // 条件・候補・モードが変わったら再生成（編集はリセット）
  useEffect(() => {
    setTexts(buildAll);
  }, [buildAll]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  // 履歴保存（生成タイミングで保存）。同一マウント内で 1 回だけ
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    if (selected.length === 0) return;
    savedRef.current = true;
    const entry: HistoryEntry = {
      id: makeHistoryId(),
      createdAt: Date.now(),
      condition,
      restaurants: candidates,
      generatedTexts: buildAll,
    };
    saveHistory(entry, plan);
    // 履歴保存トースト（初回のみ）
    try {
      const seen =
        window.localStorage.getItem(STORAGE_KEYS.historyToastShown) === "1";
      if (!seen) {
        const suffix = !isPro ? "（Free は最新 1 件のみ保持）" : "";
        showToast(`📂 履歴に保存しました${suffix}`);
        window.localStorage.setItem(STORAGE_KEYS.historyToastShown, "1");
      }
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async (id: TemplateId) => {
    const text = texts[id];
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("コピーしました！🐿️");
    } catch {
      showToast("コピーに失敗しました…");
    }
  };

  return (
    <div className="space-y-5">
      <section className="nm-card">
        <header>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl" aria-hidden>
              {MODE_EMOJIS[condition.mode]}
            </span>
            <h2 className="text-lg font-bold text-nomiris-brownDark">
              {MODE_LABELS[condition.mode]} の提案文
            </h2>
            {!isPro && condition.mode !== "casual" && (
              <ProBadge />
            )}
          </div>
          <p className="mt-1 text-xs text-nomiris-textSub">
            選択した {selected.length} 件をもとに、用途別の文面を生成しました。各カードのコピーボタンでそのまま貼り付け OK。
          </p>
          {!isPro && condition.mode === "casual" && (
            <p className="mt-2 text-[11px] text-amber-700">
              ✨ 仕事・会食 / デートモードに切り替えると、メールや LINE の文面テンプレが Pro 機能として使えます。
            </p>
          )}
          {isPro && originStationTrimmed && distanceLoading && (
            <p className="mt-2 text-[11px] text-amber-800">
              📏 徒歩距離を計算中…
            </p>
          )}
          {isPro && originStationTrimmed && distanceError && (
            <p className="mt-2 text-[11px] text-amber-800/90">
              ⚠️ Google Maps API が未設定または失敗しました。徒歩分はお店情報の access テキストを使用します。
            </p>
          )}
        </header>
      </section>

      {templates.map((tpl) => {
        const requiresPro = tpl.plan === "pro";
        const locked = requiresPro && !isPro;
        return (
          <section key={tpl.id} className="nm-card space-y-3">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-nomiris-brownDark flex items-center gap-2 flex-wrap">
                  <span aria-hidden>{tpl.emoji}</span>
                  <span>{tpl.title}</span>
                  {requiresPro && <ProBadge />}
                </h3>
                <p className="mt-0.5 text-xs text-nomiris-textSub">{tpl.hint}</p>
              </div>
              {!locked && (
                <button
                  type="button"
                  className="nm-btn-primary !py-2 !px-3 text-sm shrink-0"
                  onClick={() => handleCopy(tpl.id)}
                >
                  📋 コピー
                </button>
              )}
            </header>
            {locked ? (
              <ProLock
                label={`${tpl.title} は Pro 機能`}
                description="プレビューだけ表示。クリックで Pro の詳細を確認できます。"
                minHeight="200px"
              >
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-amber-900/80 min-h-[200px]">
                  {texts[tpl.id]?.split("\n").slice(0, 6).join("\n") ?? ""}
                  {"\n…"}
                </div>
              </ProLock>
            ) : (
              <textarea
                className="nm-textarea min-h-[220px] font-mono text-sm leading-relaxed"
                value={texts[tpl.id] ?? ""}
                onChange={(e) =>
                  setTexts((prev) => ({ ...prev, [tpl.id]: e.target.value }))
                }
                aria-label={`${tpl.title}の提案文`}
              />
            )}
          </section>
        );
      })}

      {/* Pro モードでない場合の追加 CTA */}
      {!isPro && condition.mode === "casual" && (
        <section className="pro-card p-5 text-center">
          <h3 className="text-base font-bold text-amber-900">
            ✨ Pro なら、もっと「失敗しない」場面まで
          </h3>
          <p className="mt-1 text-xs text-amber-900/80">
            社内・社外メール、接待、お礼メール、デートの誘い・お礼 LINE テンプレが解放されます。
          </p>
          <button
            type="button"
            onClick={() =>
              upsell.open({
                title: "Pro で全テンプレを解放",
                description:
                  "仕事・会食・デート向けのメール / LINE 文面、AI 比較、無制限の履歴保存が使えるようになります。",
              })
            }
            className="mt-3 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-2.5 shadow-sm hover:from-amber-600 hover:to-orange-600 transition text-sm"
          >
            ✨ Pro 版を見る
          </button>
        </section>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button type="button" className="nm-btn-ghost" onClick={onBack}>
          ← 候補を選び直す
        </button>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {onRestartSameCondition && (
            <button
              type="button"
              className="nm-btn-secondary"
              onClick={onRestartSameCondition}
            >
              ↩︎ 同じ条件でもう一度
            </button>
          )}
          <button type="button" className="nm-btn-secondary" onClick={onRestart}>
            🆕 別の会で新しく作る
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-nomiris-brownDark text-white px-5 py-3 shadow-lg text-sm font-semibold"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
