"use client";

import Link from "next/link";
import Header from "../components/Header";
import ProBadge from "../components/ProBadge";
import { startCheckout } from "../lib/checkout";
import { usePlan } from "../lib/plan";

interface PlanCardProps {
  title: string;
  price: string;
  unit?: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  onCta?: () => void;
  highlight?: boolean;
  disabled?: boolean;
  badge?: string;
}

function PlanCard({
  title,
  price,
  unit,
  tagline,
  features,
  ctaLabel,
  onCta,
  highlight,
  disabled,
  badge,
}: PlanCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 shadow-sm ${
        highlight
          ? "pro-card border-amber-300"
          : "bg-white border-nomiris-line"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3
            className={`text-xl font-extrabold ${
              highlight ? "text-amber-900" : "text-nomiris-brownDark"
            }`}
          >
            {title}
          </h3>
          {badge && <ProBadge label={badge} />}
        </div>
        <p
          className={`text-xs ${
            highlight ? "text-amber-900/70" : "text-nomiris-textSub"
          }`}
        >
          {tagline}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-3xl font-extrabold ${
            highlight ? "text-amber-900" : "text-nomiris-brownDark"
          }`}
        >
          {price}
        </span>
        {unit && (
          <span
            className={`text-xs font-semibold ${
              highlight ? "text-amber-900/70" : "text-nomiris-textSub"
            }`}
          >
            {unit}
          </span>
        )}
      </div>
      <ul className="space-y-1.5 text-xs">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 ${
              highlight ? "text-amber-900" : "text-nomiris-textMain"
            }`}
          >
            <span aria-hidden className={highlight ? "text-amber-600" : "text-nomiris-orange"}>
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {onCta && (
        <button
          type="button"
          onClick={onCta}
          disabled={disabled}
          className={`mt-auto inline-flex items-center justify-center gap-1 rounded-full font-bold px-5 py-3 transition text-sm ${
            highlight
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
              : "bg-white border border-nomiris-line text-nomiris-brown hover:bg-nomiris-cream"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { plan, setPlan, isPro, hydrated } = usePlan();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-nomiris-brownDark">
              <span className="mr-1" aria-hidden>
                🏷️
              </span>
              料金プラン
            </h1>
            <p className="mt-1 text-sm text-nomiris-textSub">
              シーンに合わせて、必要な機能だけ選べます。アップグレードはいつでもキャンセル可能です。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PlanCard
              title="Free"
              price="¥0"
              unit="/ 月"
              tagline="友達との飲み会向け"
              features={[
                "候補店を 3 件まで表示",
                "カジュアル提案文（友達 LINE / サークル / 共有文）",
                "コピー機能",
                "履歴は最新 1 件のみ保存",
              ]}
              ctaLabel={isPro ? "Free に戻す" : "現在のプラン"}
              onCta={isPro ? () => setPlan("free") : undefined}
              disabled={!isPro && hydrated}
            />
            <PlanCard
              title="Pro"
              price="¥680"
              unit="/ 月"
              tagline="仕事・会食・デート向け"
              badge="人気"
              highlight
              features={[
                "候補店無制限",
                "社内 / 社外メール、接待、お礼メール",
                "デートの誘い・共有・お礼 LINE",
                "AI おすすめ順位 + 比較表のフル列",
                "履歴を無制限に保存",
              ]}
              ctaLabel={isPro ? "✓ 利用中" : "✨ Pro にアップグレード"}
              onCta={isPro ? undefined : () => startCheckout("pro")}
              disabled={isPro}
            />
            <PlanCard
              title="1回チケット"
              price="¥200"
              unit="/ 1 回"
              tagline="たまに使いたい人向け"
              features={[
                "Pro 機能を 1 回だけ使える",
                "サブスクなし、必要なときに",
                "決済後 24 時間有効",
              ]}
              ctaLabel="🎫 1 回チケットを購入"
              onCta={() => startCheckout("ticket")}
            />
          </div>

          <div className="nm-card text-sm text-nomiris-textMain space-y-2">
            <h3 className="font-bold text-nomiris-brownDark">
              現在のプラン
            </h3>
            <p className="text-sm">
              {hydrated ? (
                <>
                  <span className="font-bold">
                    {plan === "pro" ? "Pro 🐿️✨" : "Free 🐿️"}
                  </span>
                  {plan === "pro"
                    ? " 全機能が使えます。"
                    : " 一部の文面テンプレと候補表示数が制限されています。"}
                </>
              ) : (
                "読み込み中…"
              )}
            </p>
            {plan === "pro" && (
              <button
                type="button"
                className="nm-btn-secondary !py-2 !px-3 text-sm"
                onClick={() => setPlan("free")}
              >
                プランをリセット（Free に戻す）
              </button>
            )}
          </div>

          <p className="text-[11px] text-nomiris-textSub">
            ※ MVP 版では決済機能は未接続です。実際の課金は行われず、フロント上のみ Pro プランに切り替わります。
          </p>

          <div>
            <Link href="/" className="nm-btn-ghost text-sm">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
