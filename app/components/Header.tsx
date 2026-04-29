"use client";

import Link from "next/link";
import { usePlan } from "../lib/plan";
import ProBadge from "./ProBadge";

export default function Header() {
  const { isPro } = usePlan();
  return (
    <header className="bg-gradient-to-b from-nomiris-cream to-nomiris-bg border-b border-nomiris-line/60">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className="text-3xl shrink-0" aria-hidden>
              🐿️
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-nomiris-brownDark leading-tight">
                飲みリス
              </h1>
              <p className="text-[11px] sm:text-xs text-nomiris-textSub">
                飲み会・会食の候補案を、きれいに一発作成。
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/history"
              className="nm-btn-ghost !py-1.5 !px-2 sm:!px-3 text-xs sm:text-sm"
              aria-label="履歴を開く"
            >
              <span aria-hidden>📂</span>
              <span className="hidden sm:inline">履歴</span>
            </Link>
            <Link
              href="/pricing"
              className="nm-btn-ghost !py-1.5 !px-2 sm:!px-3 text-xs sm:text-sm"
              aria-label="料金プランを開く"
            >
              <span aria-hidden>🏷️</span>
              <span className="hidden sm:inline">料金プラン</span>
            </Link>
            {isPro && <ProBadge className="self-center" />}
          </nav>
        </div>
      </div>
    </header>
  );
}
