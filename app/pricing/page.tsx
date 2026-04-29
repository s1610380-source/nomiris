"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import ProBadge from "../components/ProBadge";
import { startCheckout } from "../lib/checkout";
import { usePlan } from "../lib/plan";

type Cycle = "monthly" | "annual";

interface PlanCardProps {
  title: string;
  price: string;
  unit?: string;
  priceNote?: string;
  tagline: string;
  badge?: string;
  pill?: string;
  features: string[];
  ctaLabel: string;
  onCta?: () => void;
  ctaHref?: string;
  highlight?: boolean;
  disabled?: boolean;
  enterprise?: boolean;
}

function PlanCard({
  title,
  price,
  unit,
  priceNote,
  tagline,
  badge,
  pill,
  features,
  ctaLabel,
  onCta,
  ctaHref,
  highlight,
  disabled,
  enterprise,
}: PlanCardProps) {
  const cardCls = highlight
    ? "pro-card border-amber-300 ring-2 ring-amber-200/60 md:scale-[1.02]"
    : enterprise
      ? "bg-gradient-to-br from-nomiris-cream/60 to-white border-nomiris-line"
      : "bg-white border-nomiris-line";

  const titleColor = highlight
    ? "text-amber-900"
    : enterprise
      ? "text-nomiris-brownDark"
      : "text-nomiris-brownDark";

  const subTextColor = highlight
    ? "text-amber-900/70"
    : "text-nomiris-textSub";

  const buttonInner = (
    <span className="inline-flex items-center justify-center gap-1.5">
      {ctaLabel}
    </span>
  );

  const buttonCls = `mt-auto inline-flex items-center justify-center gap-1 rounded-full font-bold px-5 py-3 transition text-sm ${
    highlight
      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
      : enterprise
        ? "bg-nomiris-brownDark text-white hover:bg-nomiris-brown"
        : "bg-white border border-nomiris-line text-nomiris-brown hover:bg-nomiris-cream"
  } disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col gap-4 shadow-sm ${cardCls}`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800 shadow-sm">
          ⭐ {badge}
        </span>
      )}
      <div>
        <h3 className={`text-xl font-extrabold ${titleColor}`}>{title}</h3>
        <p className={`mt-1 text-xs ${subTextColor}`}>{tagline}</p>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-extrabold ${titleColor}`}>
            {price}
          </span>
          {unit && (
            <span className={`text-xs font-semibold ${subTextColor}`}>
              {unit}
            </span>
          )}
        </div>
        {priceNote && (
          <p className={`mt-1 text-[11px] ${subTextColor}`}>{priceNote}</p>
        )}
      </div>
      {pill && (
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${
            highlight
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : enterprise
                ? "border-nomiris-line bg-white text-nomiris-brown"
                : "border-nomiris-line bg-nomiris-cream/50 text-nomiris-brown"
          }`}
        >
          {pill}
        </span>
      )}
      <ul className="space-y-1.5 text-xs">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 ${
              highlight ? "text-amber-900" : "text-nomiris-textMain"
            }`}
          >
            <span
              aria-hidden
              className={highlight ? "text-amber-600" : "text-nomiris-orange"}
            >
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {onCta ? (
        <button
          type="button"
          onClick={onCta}
          disabled={disabled}
          className={buttonCls}
        >
          {buttonInner}
        </button>
      ) : ctaHref ? (
        <a
          href={ctaHref}
          target={ctaHref.startsWith("mailto:") ? undefined : "_self"}
          className={buttonCls}
        >
          {buttonInner}
        </a>
      ) : null}
    </div>
  );
}

export default function PricingPage() {
  const { plan, setPlan, isPro, hydrated } = usePlan();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const isAnnual = cycle === "annual";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16 space-y-8">
          {/* タイトル */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-nomiris-brownDark">
              料金プラン
            </h1>
            <p className="text-sm md:text-base text-nomiris-textSub">
              <span className="font-semibold text-nomiris-brownDark">無料</span>
              で始められます。
              <span className="font-semibold text-nomiris-brownDark">
                クレジットカード不要
              </span>
            </p>
          </div>

          {/* 月/年トグル */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full border border-nomiris-line bg-nomiris-cream/40 p-1">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  !isAnnual
                    ? "bg-white text-nomiris-brownDark shadow-sm"
                    : "text-nomiris-textSub hover:text-nomiris-brown"
                }`}
              >
                月払い
              </button>
              <button
                type="button"
                onClick={() => setCycle("annual")}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  isAnnual
                    ? "bg-white text-nomiris-brownDark shadow-sm"
                    : "text-nomiris-textSub hover:text-nomiris-brown"
                }`}
              >
                年払い
                <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                  17%お得
                </span>
              </button>
            </div>
          </div>

          {/* 3 メインプラン */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            <PlanCard
              title="Free"
              price="¥0"
              unit="/ ずっと無料"
              priceNote="クレジットカード不要"
              tagline="まずは気軽にお試し"
              pill="候補3件まで"
              features={[
                "カジュアル飲みモード",
                "候補店3件まで",
                "簡易比較",
                "友達向け提案文（LINE / サークル / 共有）",
                "コピー機能",
                "履歴は最新1件のみ保存",
              ]}
              ctaLabel={
                hydrated && isPro ? "Free に戻す" : "現在のプラン"
              }
              onCta={isPro ? () => setPlan("free") : undefined}
              disabled={hydrated && !isPro}
            />
            <PlanCard
              title="Pro"
              price={isAnnual ? "¥3,000" : "¥300"}
              unit={isAnnual ? "/ 年" : "/ 月"}
              priceNote={
                isAnnual
                  ? "月あたり ¥250（2ヶ月分お得）"
                  : "年一括なら ¥3,000（17%お得）"
              }
              tagline="本格的に使いたい方に"
              badge="人気"
              pill="無制限"
              highlight
              features={[
                "Free プランのすべて",
                "候補店無制限",
                "仕事・会食モード",
                "デート・マッチングアプリモード",
                "社内 / 社外 / お礼メール",
                "デート誘い・お礼・2回目 LINE",
                "AI おすすめ順位 / 懸念点チェック",
                "比較表フル列（接待・デート向き等）",
                "履歴を無制限に保存",
              ]}
              ctaLabel={isPro ? "✓ 利用中" : "✨ Pro にアップグレード"}
              onCta={isPro ? undefined : () => startCheckout("pro")}
              disabled={isPro}
            />
            <PlanCard
              title="エンタープライズ"
              price="お問い合わせ"
              priceNote="ご要望に合わせてカスタマイズ"
              tagline="チームでの導入に"
              pill="ご要望に合わせてカスタマイズ"
              enterprise
              features={[
                "Pro プランのすべて",
                "チーム共有・複数ユーザー",
                "管理コンソール（ユーザー管理）",
                "専任サポート",
                "SSO / SAML",
                "監査ログ・データエクスポート",
                "SLA / カスタム契約",
              ]}
              ctaLabel="📩 ご相談する"
              ctaHref="mailto:nomiris-enterprise@example.com?subject=%E3%82%A8%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%97%E3%83%A9%E3%82%A4%E3%82%BA%E3%83%97%E3%83%A9%E3%83%B3%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6"
            />
          </div>

          {/* 1 回チケット（補足カード） */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-nomiris-line bg-gradient-to-br from-nomiris-cream/40 to-white p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    🎫
                  </span>
                  <h3 className="text-lg font-extrabold text-nomiris-brownDark">
                    1回チケット
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-nomiris-line bg-white px-2 py-0.5 text-[10px] font-semibold text-nomiris-textSub">
                    サブスク不要
                  </span>
                </div>
                <p className="mt-1 text-xs text-nomiris-textSub">
                  たまに有料文面だけ使いたい人向け。Pro 機能を 1 回だけ生成できます。
                </p>
              </div>
              <div className="flex items-baseline gap-2 md:flex-col md:items-end">
                <span className="text-2xl font-extrabold text-nomiris-brownDark">
                  ¥100
                </span>
                <span className="text-xs text-nomiris-textSub">/ 1 回</span>
              </div>
              <button
                type="button"
                onClick={() => startCheckout("ticket")}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-nomiris-orange px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-nomiris-orangeDark transition"
              >
                チケットを購入
              </button>
            </div>
          </div>

          {/* 現在のプラン状態 */}
          <div className="max-w-3xl mx-auto nm-card text-sm text-nomiris-textMain space-y-2">
            <h3 className="font-bold text-nomiris-brownDark">現在のプラン</h3>
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
            {!isPro && hydrated && (
              <p className="text-[11px] text-nomiris-textSub">
                <ProBadge label="Pro" /> はいつでも 1 タップで解除できます。
              </p>
            )}
          </div>

          <p className="text-center text-[11px] text-nomiris-textSub">
            ※ MVP 版では決済機能は未接続です。実際の課金は行われず、フロント上のみ Pro
            プランに切り替わります。
          </p>

          <div className="text-center">
            <Link href="/" className="nm-btn-ghost text-sm">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
