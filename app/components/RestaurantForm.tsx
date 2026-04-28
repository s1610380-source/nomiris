"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "../lib/types";

type Draft = Omit<Restaurant, "id" | "selected">;

const EMPTY: Draft = {
  name: "",
  genre: "",
  url: "",
  area: "",
  budget: "",
  googleRating: "",
  tabelogRating: "",
  walkingMinutes: 0,
  hasNomihodai: false,
  hasPrivateRoom: false,
  memo: "",
  recommendPoint: "",
  cautionPoint: "",
  emoji: "🍽️",
};

interface Props {
  editing: Restaurant | null;
  onAdd: (draft: Draft) => void;
  onUpdate: (id: string, draft: Draft) => void;
  onCancelEdit: () => void;
}

function toIntOrZero(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : 0;
}

export default function RestaurantForm({
  editing,
  onAdd,
  onUpdate,
  onCancelEdit,
}: Props) {
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (editing) {
      const { id: _id, selected: _selected, ...rest } = editing;
      void _id;
      void _selected;
      setDraft(rest);
    } else {
      setDraft(EMPTY);
    }
  }, [editing]);

  const update = <K extends keyof Draft>(key: K, val: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (editing) {
      onUpdate(editing.id, draft);
    } else {
      onAdd(draft);
      setDraft(EMPTY);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="r-name" className="nm-label">
            店名 <span className="text-nomiris-orange">*</span>
          </label>
          <input
            id="r-name"
            className="nm-input"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="r-genre" className="nm-label">
            ジャンル
          </label>
          <input
            id="r-genre"
            className="nm-input"
            placeholder="例: 焼き鳥 / 中華 / ビストロ"
            value={draft.genre}
            onChange={(e) => update("genre", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-emoji" className="nm-label">
            絵文字
          </label>
          <input
            id="r-emoji"
            className="nm-input"
            placeholder="🍻"
            value={draft.emoji}
            onChange={(e) => update("emoji", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="r-url" className="nm-label">
            URL
          </label>
          <input
            id="r-url"
            type="url"
            inputMode="url"
            className="nm-input"
            placeholder="https://..."
            value={draft.url}
            onChange={(e) => update("url", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-area" className="nm-label">
            エリア
          </label>
          <input
            id="r-area"
            className="nm-input"
            value={draft.area}
            onChange={(e) => update("area", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-budget" className="nm-label">
            予算目安
          </label>
          <input
            id="r-budget"
            className="nm-input"
            placeholder="例: 5,000〜6,000円"
            value={draft.budget}
            onChange={(e) => update("budget", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-google" className="nm-label">
            Google評価
          </label>
          <input
            id="r-google"
            className="nm-input"
            placeholder="例: 4.5"
            value={draft.googleRating}
            onChange={(e) => update("googleRating", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-tabelog" className="nm-label">
            食べログ評価
          </label>
          <input
            id="r-tabelog"
            className="nm-input"
            placeholder="例: 3.45"
            value={draft.tabelogRating}
            onChange={(e) => update("tabelogRating", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="r-walk" className="nm-label">
            徒歩分数
          </label>
          <input
            id="r-walk"
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
          <label htmlFor="r-memo" className="nm-label">
            一言メモ
          </label>
          <input
            id="r-memo"
            className="nm-input"
            value={draft.memo}
            onChange={(e) => update("memo", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="r-recommend" className="nm-label">
            おすすめポイント
          </label>
          <textarea
            id="r-recommend"
            className="nm-textarea"
            value={draft.recommendPoint}
            onChange={(e) => update("recommendPoint", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="r-caution" className="nm-label">
            注意点
          </label>
          <textarea
            id="r-caution"
            className="nm-textarea"
            value={draft.cautionPoint}
            onChange={(e) => update("cautionPoint", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="nm-btn-primary">
          {editing ? "更新する" : "＋ 候補に追加"}
        </button>
        {editing && (
          <button
            type="button"
            className="nm-btn-secondary"
            onClick={onCancelEdit}
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
