"use client";

import { useState } from "react";
import type { EventCondition, Restaurant } from "../lib/types";
import { generateProposal } from "../lib/generateProposal";

interface Props {
  condition: EventCondition;
  restaurants: Restaurant[];
}

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "ok"; text: string };

export default function ProposalPanel({ condition, restaurants }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [draftText, setDraftText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleGenerate = () => {
    if (restaurants.length === 0) {
      setStatus({ kind: "error", message: "候補店を追加してください🐿️" });
      setDraftText("");
      return;
    }
    const selected = restaurants.filter((r) => r.selected);
    if (selected.length === 0) {
      setStatus({
        kind: "error",
        message: "提案文に含める候補店を選択してください🐿️",
      });
      setDraftText("");
      return;
    }
    const text = generateProposal(condition, selected);
    setDraftText(text);
    setStatus({ kind: "ok", text });
  };

  const handleCopy = async () => {
    if (!draftText) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(draftText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = draftText;
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

  const handleReset = () => {
    setDraftText("");
    setStatus({ kind: "idle" });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="nm-btn-primary"
          onClick={handleGenerate}
        >
          ✨ 提案文を生成する
        </button>
        <button
          type="button"
          className="nm-btn-secondary"
          onClick={handleCopy}
          disabled={!draftText}
        >
          📋 コピーする
        </button>
        <button
          type="button"
          className="nm-btn-ghost"
          onClick={handleReset}
          disabled={!draftText && status.kind === "idle"}
        >
          リセット
        </button>
      </div>

      {status.kind === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {status.message}
        </div>
      )}

      <textarea
        className="nm-textarea min-h-[260px] font-mono text-sm leading-relaxed"
        placeholder="ここに生成された提案文が表示されます。送信前に自由に編集できます。"
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        aria-label="提案文"
      />

      <p className="text-xs text-nomiris-textSub">
        生成された文章は自由に編集できます。LINE / Slack / メールに貼り付けてご利用ください。
      </p>

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
