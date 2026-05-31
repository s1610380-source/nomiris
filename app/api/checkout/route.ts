import { NextResponse } from "next/server";

/**
 * Stripe / PayPay Checkout Session 作成のエンドポイント。
 *
 * 環境変数:
 * - STRIPE_SECRET_KEY                    Stripe API シークレットキー
 * - STRIPE_PRICE_ID_PRO_MONTHLY          Pro 月額サブスクの price ID
 * - STRIPE_PRICE_ID_PRO_ANNUAL           Pro 年額サブスクの price ID
 * - STRIPE_PRICE_ID_TICKET               1回チケット（payment mode）の price ID
 *
 * いずれかが未設定の場合は対応する種別だけ `stripe_not_configured` を返し、
 * フロント側で dev モード（localStorage を pro に書く）にフォールバックする。
 *
 * PayPay は未実装。`paypay_not_configured` / `paypay_not_implemented` を返す。
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckoutResult {
  ok: boolean;
  url?: string;
  error?: string;
}

type Kind = "pro" | "ticket";
type Billing = "monthly" | "annual";

interface StripeSessionResponse {
  id?: string;
  url?: string;
  error?: { message?: string; type?: string };
}

function pickPriceId(kind: Kind, billing: Billing): string | undefined {
  if (kind === "ticket") return process.env.STRIPE_PRICE_ID_TICKET;
  if (billing === "annual") return process.env.STRIPE_PRICE_ID_PRO_ANNUAL;
  return process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const kindRaw = (searchParams.get("kind") ?? "pro").toLowerCase();
  const kind: Kind = kindRaw === "ticket" ? "ticket" : "pro";
  const billingRaw = (searchParams.get("billing") ?? "monthly").toLowerCase();
  const billing: Billing = billingRaw === "annual" ? "annual" : "monthly";
  const provider = (searchParams.get("provider") ?? "stripe").toLowerCase();

  if (provider === "paypay") {
    const apiKey = process.env.PAYPAY_API_KEY;
    if (!apiKey) {
      const body: CheckoutResult = { ok: false, error: "paypay_not_configured" };
      return NextResponse.json(body, { status: 200 });
    }
    const body: CheckoutResult = { ok: false, error: "paypay_not_implemented" };
    return NextResponse.json(body, { status: 200 });
  }

  // 既定は Stripe
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    const body: CheckoutResult = { ok: false, error: "stripe_not_configured" };
    return NextResponse.json(body, { status: 200 });
  }

  const priceId = pickPriceId(kind, billing);
  if (!priceId) {
    // キー自体はあるが、price ID が未設定。dev モードにフォールバックさせる。
    const body: CheckoutResult = { ok: false, error: "stripe_not_configured" };
    return NextResponse.json(body, { status: 200 });
  }

  // success/cancel URL の origin は request から取る
  const origin = (() => {
    try {
      const u = new URL(request.url);
      // ヘッダの x-forwarded-host が信頼できる場合は優先したいが、簡略化
      return `${u.protocol}//${u.host}`;
    } catch {
      return "https://nomiris.vercel.app";
    }
  })();

  const params = new URLSearchParams();
  params.set("mode", kind === "ticket" ? "payment" : "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set(
    "success_url",
    `${origin}/pricing?success=1&kind=${kind}&billing=${billing}`,
  );
  params.set("cancel_url", `${origin}/pricing?canceled=1`);
  params.set("allow_promotion_codes", "true");

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
      body: params.toString(),
    });
    const json = (await res.json()) as StripeSessionResponse;
    if (!res.ok || json.error || !json.url) {
      const body: CheckoutResult = {
        ok: false,
        error: `stripe_error:${json.error?.message ?? `http_${res.status}`}`,
      };
      return NextResponse.json(body, { status: 200 });
    }
    const body: CheckoutResult = { ok: true, url: json.url };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const body: CheckoutResult = { ok: false, error: `fetch_failed:${msg}` };
    return NextResponse.json(body, { status: 200 });
  }
}
