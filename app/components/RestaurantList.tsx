"use client";

import type { Restaurant } from "../lib/types";

interface Props {
  restaurants: Restaurant[];
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

export default function RestaurantList({
  restaurants,
  onToggleSelect,
  onEdit,
  onDelete,
}: Props) {
  const total = restaurants.length;
  const selectedCount = restaurants.filter((r) => r.selected).length;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-nomiris-line bg-nomiris-cream/50 p-6 text-center text-nomiris-textSub">
        まだ候補がありません。上のフォームから追加してください 🐿️
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-nomiris-brown">
        {total}件中 <span className="text-nomiris-orange">{selectedCount}</span>
        件を選択
      </p>
      <ul className="space-y-3">
        {restaurants.map((r) => (
          <li
            key={r.id}
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
                  onChange={() => onToggleSelect(r.id)}
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
                    <span className="text-xs text-nomiris-textSub">
                      {r.genre}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.budget && <StatChip label="予算" value={r.budget} />}
                  {r.googleRating && (
                    <StatChip label="Google" value={r.googleRating} />
                  )}
                  {r.tabelogRating && (
                    <StatChip label="食べログ" value={r.tabelogRating} />
                  )}
                  {r.walkingMinutes > 0 && (
                    <StatChip
                      label="徒歩"
                      value={`${r.walkingMinutes}分`}
                    />
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
                {r.memo && (
                  <p className="mt-2 text-sm text-nomiris-textMain">
                    📝 {r.memo}
                  </p>
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
                  {r.url && (
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
                    className="nm-btn-ghost text-sm"
                    onClick={() => onEdit(r.id)}
                  >
                    ✏️ 編集
                  </button>
                  <button
                    type="button"
                    className="nm-btn-ghost text-sm text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`「${r.name}」を削除しますか？`)) {
                        onDelete(r.id);
                      }
                    }}
                  >
                    🗑 削除
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
