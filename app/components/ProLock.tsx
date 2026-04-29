"use client";

import type { ReactNode } from "react";
import { useUpsell } from "./UpsellModal";
import ProBadge from "./ProBadge";

interface Props {
  /** ロック対象のコンテンツ。背景としてぼかし表示される */
  children: ReactNode;
  /** Pro 解放されたときにロック解除 */
  unlocked?: boolean;
  /** ロック中央の見出し */
  label?: string;
  /** ロック中央のサブテキスト */
  description?: string;
  /** ロックされた領域の最低高さ */
  minHeight?: string;
  className?: string;
}

/**
 * 子要素を半透明でぼかし、上から「Pro 機能」のオーバーレイを重ねる。
 * クリックで UpsellModal を開く。
 */
export default function ProLock({
  children,
  unlocked = false,
  label = "Pro 機能です",
  description,
  minHeight,
  className = "",
}: Props) {
  const upsell = useUpsell();

  if (unlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[3px] opacity-60"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => upsell.open()}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm bg-white/60 hover:bg-white/70 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🔒
          </span>
          <ProBadge />
        </div>
        <span className="text-sm font-bold text-amber-900">{label}</span>
        {description && (
          <span className="text-xs text-amber-900/70 px-4 text-center max-w-xs">
            {description}
          </span>
        )}
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 shadow-sm">
          ✨ Pro 版を見る
        </span>
      </button>
    </div>
  );
}
