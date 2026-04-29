"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

interface UpsellPayload {
  title?: string;
  description?: string;
}

interface UpsellContextValue {
  open: (payload?: UpsellPayload) => void;
  close: () => void;
}

const UpsellContext = createContext<UpsellContextValue | null>(null);

export function UpsellProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<UpsellPayload>({});

  const open = useCallback((p?: UpsellPayload) => {
    setPayload(p ?? {});
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <UpsellContext.Provider value={value}>
      {children}
      {isOpen && (
        <UpsellModalView payload={payload} onClose={close} />
      )}
    </UpsellContext.Provider>
  );
}

export function useUpsell(): UpsellContextValue {
  const ctx = useContext(UpsellContext);
  if (!ctx) {
    // Provider 未マウント時は no-op でフォールバック
    return {
      open: () => {
        if (typeof window !== "undefined") {
          window.alert("Pro 機能です。料金プランページをご確認ください。");
        }
      },
      close: () => {},
    };
  }
  return ctx;
}

function UpsellModalView({
  payload,
  onClose,
}: {
  payload: UpsellPayload;
  onClose: () => void;
}) {
  const title = payload.title ?? "この機能は Pro 版で使えます";
  const description =
    payload.description ??
    "仕事・会食・デートなど、失敗したくない場面では、提案文・共有文・お礼文まで飲みリスがサポートします。";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nm-upsell-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="pro-card w-full max-w-md rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="nm-upsell-title"
              className="text-base font-bold text-amber-900"
            >
              <span className="mr-1" aria-hidden>
                ✨
              </span>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="rounded-full p-1 text-amber-700 hover:bg-amber-100 transition"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-amber-900/80 leading-relaxed">
            {description}
          </p>
          <ul className="text-xs text-amber-900/70 list-disc pl-5 space-y-0.5">
            <li>候補店無制限・比較表のフル列</li>
            <li>社内 / 社外メール・接待・お礼文テンプレ</li>
            <li>デート用の誘い・共有・お礼 LINE テンプレ</li>
            <li>履歴を無制限に保存（最新の振り返り）</li>
          </ul>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <button
              type="button"
              className="nm-btn-ghost text-sm"
              onClick={onClose}
            >
              今回は無料機能だけ使う
            </button>
            <Link
              href="/pricing"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-3 shadow-sm hover:from-amber-600 hover:to-orange-600 transition text-sm"
            >
              ✨ Pro 版を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
