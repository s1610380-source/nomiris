"use client";

import type { Restaurant } from "../lib/types";

interface Props {
  restaurant: Restaurant;
  onToggle: () => void;
  onDelete: () => void;
}

function StatChip({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="nm-chip">
      <span className="text-nomiris-textSub">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

function isRealUrl(url: string): boolean {
  const v = url.trim();
  return !!v && v !== "#placeholder" && !v.startsWith("#");
}

export default function CandidateCard({ restaurant, onToggle, onDelete }: Props) {
  const r = restaurant;
  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition shadow-sm ${
        r.selected
          ? "border-nomiris-orange/60 ring-1 ring-nomiris-orange/30"
          : "border-nomiris-line/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <label className="flex shrink-0 cursor-pointer items-center pt-1">
          <input
            type="checkbox"
            className="h-5 w-5 accent-nomiris-orange"
            checked={r.selected}
            onChange={onToggle}
            aria-label={`${r.name}を選択`}
          />
        </label>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-lg" aria-hidden>
              {r.emoji || "🍽️"}
            </span>
            <h3 className="text-base font-bold text-nomiris-brownDark break-all">
              {r.name}
            </h3>
            {r.genre && (
              <span className="text-xs text-nomiris-textSub">{r.genre}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {r.area && <StatChip label="エリア" value={r.area} />}
            {r.budget && <StatChip label="予算" value={r.budget} />}
            {r.googleRating && (
              <StatChip label="Google" value={r.googleRating} />
            )}
            {r.walkingMinutes > 0 && (
              <StatChip label="徒歩" value={`${r.walkingMinutes}分`} />
            )}
            {r.hasNomihodai && (
              <span className="nm-chip border-nomiris-orange/40 bg-nomiris-orange/10 text-nomiris-orangeDark">
                飲み放題
              </span>
            )}
            {r.hasPrivateRoom && (
              <span className="nm-chip border-nomiris-orange/40 bg-nomiris-orange/10 text-nomiris-orangeDark">
                個室
              </span>
            )}
          </div>
          {r.address && (
            <p className="mt-2 text-xs text-nomiris-textSub break-all">
              📍 {r.address}
            </p>
          )}
          {r.memo && (
            <p className="mt-2 text-sm text-nomiris-textMain">📝 {r.memo}</p>
          )}
          {r.recommendPoint && (
            <p className="mt-1 text-sm text-nomiris-textMain">
              ✨ {r.recommendPoint}
            </p>
          )}
          {r.cautionPoint && (
            <p className="mt-1 text-sm text-nomiris-textSub">
              ⚠️ {r.cautionPoint}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {isRealUrl(r.url) && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nm-btn-secondary !py-2 !px-3 text-sm"
              >
                🔗 URLを開く
              </a>
            )}
            <button
              type="button"
              className="nm-btn-ghost text-sm text-red-700 hover:bg-red-50"
              onClick={() => {
                if (confirm(`「${r.name}」を削除しますか？`)) {
                  onDelete();
                }
              }}
            >
              🗑 削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
