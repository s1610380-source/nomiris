"use client";

import { useState } from "react";
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

export default function Step2Picker({
  condition,
  candidates,
  setCandidates,
  onBack,
  onNext,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedCount = candidates.filter((r) => r.selected).length;
  const total = candidates.length;
  const canProceed = selectedCount > 0;

  const handleReroll = () => {
    setCandidates(pickCandidates(CATALOG, condition));
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
          >
            🎲 もう一度引く
          </button>
        </header>

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
          disabled={!canProceed}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
