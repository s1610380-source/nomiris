"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventCondition, Restaurant } from "../lib/types";
import { generateAllProposals } from "../lib/generateProposal";

interface Props {
  condition: EventCondition;
  candidates: Restaurant[];
  onBack: () => void;
  onRestart: () => void;
}

type ToneKey = "business" | "friend" | "couple";

const TONES: { key: ToneKey; label: string; emoji: string; hint: string }[] = [
  {
    key: "business",
    label: "ビジネス用",
    emoji: "🏢",
    hint: "敬語・客観表現で社内向けにそのまま使えるトーン",
  },
  {
    key: "friend",
    label: "友達用",
    emoji: "😊",
    hint: "カジュアル・絵文字多めでテンポよく",
  },
  {
    key: "couple",
    label: "彼氏彼女用",
    emoji: "💕",
    hint: "やわらかく、二人称でちょっと甘めに",
  },
];

export default function Step3Proposal({
  condition,
  candidates,
  onBack,
  onRestart,
}: Props) {
  const selected = useMemo(
    () => candidates.filter((r) => r.selected),
    [candidates],
  );

  const initial = useMemo(
    () => generateAllProposals(condition, selected),
    [condition, selected],
  );

  const [texts, setTexts] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);

  // 条件・候補が変わったら再生成（編集はリセット）
  useEffect(() => {
    setTexts(generateAllProposals(condition, selected));
  }, [condition, selected]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleCopy = async (key: ToneKey) => {
    const text = texts[key];
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
          <h2 className="text-lg font-bold text-nomiris-brownDark">
            <span className="mr-1" aria-hidden>
              ✨
            </span>
            提案文（3トーン同時生成）
          </h2>
          <p className="mt-1 text-xs text-nomiris-textSub">
            選択した {selected.length} 件をもとに、3 つのトーンで提案文を作成しました。各カードのコピーボタンでそのまま貼り付けOK。
          </p>
        </header>
      </section>

      {TONES.map((t) => (
        <section key={t.key} className="nm-card space-y-3">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-nomiris-brownDark">
                <span className="mr-1" aria-hidden>
                  {t.emoji}
                </span>
                {t.label}
              </h3>
              <p className="mt-0.5 text-xs text-nomiris-textSub">{t.hint}</p>
            </div>
            <button
              type="button"
              className="nm-btn-primary !py-2 !px-3 text-sm shrink-0"
              onClick={() => handleCopy(t.key)}
            >
              📋 コピー
            </button>
          </header>
          <textarea
            className="nm-textarea min-h-[220px] font-mono text-sm leading-relaxed"
            value={texts[t.key]}
            onChange={(e) =>
              setTexts((prev) => ({ ...prev, [t.key]: e.target.value }))
            }
            aria-label={`${t.label}の提案文`}
          />
        </section>
      ))}

      <div className="flex justify-between gap-2">
        <button type="button" className="nm-btn-ghost" onClick={onBack}>
          ← 候補を選び直す
        </button>
        <button type="button" className="nm-btn-secondary" onClick={onRestart}>
          🐿️ 最初から
        </button>
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
