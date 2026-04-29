import { NextResponse } from "next/server";

/**
 * Stripe / PayPay Checkout Session 作成のエンドポイント（scaffold）。
 * 実際の Checkout 実装は未対応。env が未設定なら "stripe_not_configured" /
 * "paypay_not_configured" を返し、フロント側で dev モード切替する想定。
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckoutResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "pro"; // "pro" | "ticket"
  const provider = searchParams.get("provider") ?? "stripe"; // "stripe" | "paypay"

  if (provider === "paypay") {
    const apiKey = process.env.PAYPAY_API_KEY;
    if (!apiKey) {
      const body: CheckoutResult = {
        ok: false,
        error: "paypay_not_configured",
      };
      return NextResponse.json(body, { status: 200 });
    }
    // TODO: PayPay Web Payment 用のセッション生成を実装する。
    void kind;
    const body: CheckoutResult = {
      ok: false,
      error: "paypay_not_implemented",
    };
    return NextResponse.json(body, { status: 200 });
  }

  // 既定は Stripe
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    const body: CheckoutResult = {
      ok: false,
      error: "stripe_not_configured",
    };
    return NextResponse.json(body, { status: 200 });
  }

  // TODO: ここで Stripe Checkout Session を生成し、result.url を返す。
  // 例: const stripe = new Stripe(stripeKey);
  //     const session = await stripe.checkout.sessions.create({ ... });
  //     return NextResponse.json({ ok: true, url: session.url });
  void kind;

  const body: CheckoutResult = {
    ok: false,
    error: "stripe_not_implemented",
  };
  return NextResponse.json(body, { status: 200 });
}
