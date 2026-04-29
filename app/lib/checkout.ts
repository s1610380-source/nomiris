"use client";

import { STORAGE_KEYS } from "./mockData";

export type CheckoutKind = "pro" | "ticket";
export type CheckoutProvider = "stripe" | "paypay";

export interface CheckoutResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/**
 * Stripe / PayPay の Checkout Session を作るためのフロント側エントリ。
 * 環境変数（STRIPE_SECRET_KEY 等）が未設定の場合は dev モードとして
 * フロントで localStorage にプランを書き込むだけにする。
 */
export async function startCheckout(
  kind: CheckoutKind,
  provider: CheckoutProvider = "stripe",
): Promise<void> {
  try {
    const params = new URLSearchParams({ kind, provider });
    const res = await fetch(`/api/checkout?${params.toString()}`, {
      method: "POST",
    });
    const json = (await res.json()) as CheckoutResult;

    if (json.ok && json.url) {
      window.location.href = json.url;
      return;
    }

    if (json.error === "stripe_not_configured" || json.error === "paypay_not_configured") {
      // dev モード: ローカルでプランを切り替えるだけ
      const msg =
        kind === "pro"
          ? "決済プロバイダ未設定のため、開発モードとして Pro を有効化します。"
          : "決済プロバイダ未設定のため、開発モードとして Pro 機能を解放します（1回チケット相当）。";
      window.alert(msg);
      try {
        localStorage.setItem(STORAGE_KEYS.plan, "pro");
        // 同タブで反映
        window.location.reload();
      } catch {
        /* noop */
      }
      return;
    }

    window.alert(`決済セッションの開始に失敗しました: ${json.error ?? "unknown"}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    window.alert(`通信エラー: ${msg}`);
  }
}
