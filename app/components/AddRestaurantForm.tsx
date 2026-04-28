"use client";

import { useState } from "react";
import type { Restaurant } from "../lib/types";

type Draft = Omit<Restaurant, "id" | "selected">;

interface Props {
  defaultArea: string;
  onAdd: (draft: Draft) => void;
  onCancel: () => void;
}

function toIntOrZero(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : 0;
}

export default function AddRestaurantForm({
  defaultArea,
  onAdd,
  onCancel,
}: Props) {
  const [draft, setDraft] = useState<Draft>({
    name: "",
    genre: "",
    url: "",
    area: defaultArea,
    budget: "",
    budgetMin: 0,
    budgetMax: 0,
    googleRating: "",
    walkingMinutes: 0,
    hasNomihodai: false,
    hasPrivateRoom: false,
    memo: "",
    recommendPoint: "",
    cautionPoint: "",
    emoji: "🍽️",
  });

  const update = <K extends keyof Draft>(key: K, val: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onAdd(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <header>
        <h3 className="text-base font-bold text-nomiris-brownDark">
          ＋ 候補を追加
        </h3>
        <p className="mt-1 text-xs text-nomiris-textSub">
          手元のお店を候補に足すだけ。最低限、店名があればOKです。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="add-name" className="nm-label">
            店名 <span className="text-nomiris-orange">*</span>
          </label>
          <input
            id="add-name"
            className="nm-input"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="add-genre" className="nm-label">
            ジャンル
          </label>
          <input
            id="add-genre"
            className="nm-input"
            placeholder="例: 焼き鳥"
            value={draft.genre}
            onChange={(e) => update("genre", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-emoji" className="nm-label">
            絵文字
          </label>
          <input
            id="add-emoji"
            className="nm-input"
            placeholder="🍻"
            value={draft.emoji}
            onChange={(e) => update("emoji", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-url" className="nm-label">
            URL
          </label>
          <input
            id="add-url"
            type="url"
            inputMode="url"
            className="nm-input"
            placeholder="https://..."
            value={draft.url}
            onChange={(e) => update("url", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-area" className="nm-label">
            エリア
          </label>
          <input
            id="add-area"
            className="nm-input"
            value={draft.area}
            onChange={(e) => update("area", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-budget" className="nm-label">
            予算目安
          </label>
          <input
            id="add-budget"
            className="nm-input"
            placeholder="例: 5,000〜6,000円"
            value={draft.budget}
            onChange={(e) => update("budget", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-google" className="nm-label">
            Google評価
          </label>
          <input
            id="add-google"
            className="nm-input"
            placeholder="例: 4.5"
            value={draft.googleRating}
            onChange={(e) => update("googleRating", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="add-walk" className="nm-label">
            徒歩分数
          </label>
          <input
            id="add-walk"
            type="number"
            inputMode="numeric"
            min={0}
            className="nm-input"
            value={draft.walkingMinutes === 0 ? "" : draft.walkingMinutes}
            onChange={(e) =>
              update("walkingMinutes", toIntOrZero(e.target.value))
            }
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-nomiris-brown">
            <input
              type="checkbox"
              className="h-4 w-4 accent-nomiris-orange"
              checked={draft.hasNomihodai}
              onChange={(e) => update("hasNomihodai", e.target.checked)}
            />
            飲み放題
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-nomiris-brown">
            <input
              type="checkbox"
              className="h-4 w-4 accent-nomiris-orange"
              checked={draft.hasPrivateRoom}
              onChange={(e) => update("hasPrivateRoom", e.target.checked)}
            />
            個室
          </label>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-memo" className="nm-label">
            一言メモ
          </label>
          <input
            id="add-memo"
            className="nm-input"
            value={draft.memo}
            onChange={(e) => update("memo", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-recommend" className="nm-label">
            おすすめポイント
          </label>
          <textarea
            id="add-recommend"
            className="nm-textarea"
            value={draft.recommendPoint}
            onChange={(e) => update("recommendPoint", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-caution" className="nm-label">
            注意点
          </label>
          <textarea
            id="add-caution"
            className="nm-textarea"
            value={draft.cautionPoint}
            onChange={(e) => update("cautionPoint", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" className="nm-btn-secondary" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="nm-btn-primary">
          ＋ 追加する
        </button>
      </div>
    </form>
  );
}
