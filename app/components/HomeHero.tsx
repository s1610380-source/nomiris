"use client";

import { ALL_MODES, MODE_DESCRIPTIONS, MODE_EMOJIS, MODE_LABELS, MODE_PLANS } from "../lib/mode";
import { usePlan } from "../lib/plan";
import ProBadge from "./ProBadge";
import type { Mode } from "../lib/types";

interface Props {
  selectedMode: Mode;
  onSelectMode: (m: Mode) => void;
  onCtaClick: () => void;
}

export default function HomeHero({ selectedMode, onSelectMode, onCtaClick }: Props) {
  const { isPro } = usePlan();

  return (
    <section className="bg-gradient-to-b from-nomiris-cream to-nomiris-bg border-b border-nomiris-line/40">
      <div className="mx-auto max-w-2xl px-4 pt-4 pb-6 space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-nomiris-brownDark leading-snug">
            飲み会・会食の候補案を、
            <br className="sm:hidden" />
            きれいに一発作成。
          </h2>
          <p className="text-sm text-nomiris-textSub leading-relaxed">
            お店を探したあと、候補を比較して、そのまま送れる提案文まで作れる幹事向け Web アプリ。
          </p>
          <div className="pt-1">
            <button
              type="button"
              className="nm-btn-primary w-full sm:w-auto"
              onClick={onCtaClick}
            >
              🐿️ 無料で候補案を作る
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALL_MODES.map((m) => {
            const isProMode = MODE_PLANS[m] === "pro";
            const isSelected = selectedMode === m;
            const locked = isProMode && !isPro;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMode(m)}
                aria-pressed={isSelected}
                className={`text-left rounded-2xl border p-4 transition shadow-sm ${
                  isSelected
                    ? isProMode
                      ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-300"
                      : "border-nomiris-orange bg-nomiris-orange/10 ring-1 ring-nomiris-orange/40"
                    : isProMode
                      ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                      : "border-nomiris-line bg-white hover:border-nomiris-orange/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-2xl" aria-hidden>
                    {MODE_EMOJIS[m]}
                  </div>
                  {isProMode ? (
                    <ProBadge />
                  ) : (
                    <span className="text-[10px] font-bold text-nomiris-orange bg-white border border-nomiris-orange/40 rounded-full px-2 py-0.5">
                      無料
                    </span>
                  )}
                </div>
                <div className="mt-2 font-bold text-nomiris-brownDark text-base">
                  {MODE_LABELS[m]}
                </div>
                <p className="mt-1 text-xs text-nomiris-textSub leading-relaxed">
                  {MODE_DESCRIPTIONS[m]}
                </p>
                {locked && (
                  <p className="mt-2 text-[11px] font-semibold text-amber-700">
                    🔒 このモードは Pro 向け
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
