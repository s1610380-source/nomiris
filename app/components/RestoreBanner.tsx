"use client";

import { useEffect, useState } from "react";
import type { EventCondition } from "../lib/types";
import { DEFAULT_CONDITION, STORAGE_KEYS } from "../lib/mockData";
import { MODE_EMOJIS, MODE_LABELS } from "../lib/mode";

interface Props {
  current: EventCondition;
  /** 既存条件を維持して使う */
  onUseExisting: () => void;
  /** DEFAULT_CONDITION で上書きする */
  onCreateNew: () => void;
}

/** 「前回の条件があります」バナー（Step1 上部） */
export default function RestoreBanner({
  current,
  onUseExisting,
  onCreateNew,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // 同セッションで既に閉じていたら表示しない
    let dismissed = false;
    try {
      dismissed =
        window.sessionStorage.getItem(
          STORAGE_KEYS.lastConditionBannerDismissed,
        ) === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) {
      setShow(false);
      return;
    }
    // localStorage に v7 の condition データがあるか確認
    let hasStored = false;
    try {
      hasStored = !!window.localStorage.getItem(STORAGE_KEYS.condition);
    } catch {
      hasStored = false;
    }
    // 履歴も確認（最低 1 件あればバナーを表示）
    let hasHistory = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.history);
      if (raw) {
        const parsed = JSON.parse(raw);
        hasHistory = Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {
      hasHistory = false;
    }

    // 「DEFAULT_CONDITION とほぼ同じ」状態なら表示しない（初回起動と区別）
    const looksDefault =
      current.mode === DEFAULT_CONDITION.mode &&
      current.area === DEFAULT_CONDITION.area &&
      current.scene === DEFAULT_CONDITION.scene &&
      current.peopleCount === DEFAULT_CONDITION.peopleCount &&
      current.budgetMin === DEFAULT_CONDITION.budgetMin &&
      current.budgetMax === DEFAULT_CONDITION.budgetMax &&
      current.atmosphereTags.length === 0 &&
      current.importantTags.length === 0 &&
      !current.nearestStation &&
      !current.originStation &&
      !current.desiredDate;

    setShow((hasStored && !looksDefault) || hasHistory);
  }, [current]);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEYS.lastConditionBannerDismissed,
        "1",
      );
    } catch {
      /* noop */
    }
    setShow(false);
  };

  const handleUseExisting = () => {
    onUseExisting();
    dismiss();
  };

  const handleCreateNew = () => {
    onCreateNew();
    dismiss();
  };

  if (!show) return null;

  const modeEmoji = MODE_EMOJIS[current.mode] ?? "🍻";
  const modeLabel = MODE_LABELS[current.mode] ?? "カジュアル飲み";
  const areaText = current.area || "エリア未設定";

  return (
    <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
            <span aria-hidden>📂</span>
            前回の条件があります
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900">
            <span aria-hidden className="mr-1">
              {modeEmoji}
            </span>
            {modeLabel} / {areaText}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="バナーを閉じる"
          className="shrink-0 rounded-full text-amber-700 hover:bg-amber-100/60 px-2 py-1 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseExisting}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-4 py-2 text-xs shadow-sm hover:from-amber-600 hover:to-orange-600 transition"
        >
          🔁 この条件を使う
        </button>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-white text-amber-900 border border-amber-300 font-bold px-4 py-2 text-xs hover:bg-amber-100/60 transition"
        >
          ✨ 新しく作成
        </button>
      </div>
    </div>
  );
}
