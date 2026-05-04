import { NextResponse } from "next/server";

/**
 * HotPepper 大エリア マスタ API のプロキシ。
 * GET /api/areas/large
 * Response: { ok: boolean, areas: Array<{ code, name }>, error? }
 */
export const runtime = "nodejs";
// マスタは滅多に変わらないので 24h ISR キャッシュ
export const revalidate = 86400;

const LARGE_AREA_ENDPOINT =
  "https://webservice.recruit.co.jp/hotpepper/large_area/v1/";

interface AreaItem {
  code: string;
  name: string;
}

interface ApiResult {
  ok: boolean;
  areas: AreaItem[];
  error?: string;
}

interface HotPepperLargeAreaResponse {
  results?: {
    error?: Array<{ message?: string }>;
    large_area?: Array<{ code: string; name: string }>;
  };
}

export async function GET() {
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    const body: ApiResult = {
      ok: false,
      areas: [],
      error: "hotpepper_not_configured",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const params = new URLSearchParams({ key: apiKey, format: "json" });
  const url = `${LARGE_AREA_ENDPOINT}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const body: ApiResult = {
        ok: false,
        areas: [],
        error: `HotPepper API HTTP ${res.status}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const json = (await res.json()) as HotPepperLargeAreaResponse;

    const apiErr = json.results?.error?.[0]?.message;
    if (apiErr) {
      const body: ApiResult = {
        ok: false,
        areas: [],
        error: `HotPepper API: ${apiErr}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const raw = json.results?.large_area ?? [];
    const areas: AreaItem[] = raw.map((a) => ({ code: a.code, name: a.name }));

    const body: ApiResult = { ok: true, areas };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const body: ApiResult = {
      ok: false,
      areas: [],
      error: `fetch failed: ${message}`,
    };
    return NextResponse.json(body, { status: 200 });
  }
}
