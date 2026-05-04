import { NextResponse } from "next/server";

/**
 * HotPepper 中エリア マスタ API のプロキシ。
 * GET /api/areas/middle?large=CODE  （large は任意。指定すると配下のみ）
 * Response: { ok, areas: Array<{ code, name, large_area: { code, name } }>, error? }
 */
export const runtime = "nodejs";
export const revalidate = 86400;

const MIDDLE_AREA_ENDPOINT =
  "https://webservice.recruit.co.jp/hotpepper/middle_area/v1/";

interface MiddleAreaItem {
  code: string;
  name: string;
  large_area: { code: string; name: string };
}

interface ApiResult {
  ok: boolean;
  areas: MiddleAreaItem[];
  error?: string;
}

interface HotPepperMiddleAreaResponse {
  results?: {
    error?: Array<{ message?: string }>;
    middle_area?: Array<{
      code: string;
      name: string;
      large_area?: { code: string; name: string };
    }>;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const large = (searchParams.get("large") ?? "").trim();

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
  if (large) params.set("large_area", large);
  const url = `${MIDDLE_AREA_ENDPOINT}?${params.toString()}`;

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

    const json = (await res.json()) as HotPepperMiddleAreaResponse;

    const apiErr = json.results?.error?.[0]?.message;
    if (apiErr) {
      const body: ApiResult = {
        ok: false,
        areas: [],
        error: `HotPepper API: ${apiErr}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const raw = json.results?.middle_area ?? [];
    const areas: MiddleAreaItem[] = raw.map((a) => ({
      code: a.code,
      name: a.name,
      large_area: {
        code: a.large_area?.code ?? "",
        name: a.large_area?.name ?? "",
      },
    }));

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
