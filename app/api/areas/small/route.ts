import { NextResponse } from "next/server";

/**
 * HotPepper 小エリア マスタ API のプロキシ。
 * GET /api/areas/small?middle=CODE  （middle は必須。指定なしだと 2300 件返るので拒否）
 * Response: { ok, areas: Array<{ code, name, middle_area: { code, name } }>, error? }
 */
export const runtime = "nodejs";
export const revalidate = 86400;

const SMALL_AREA_ENDPOINT =
  "https://webservice.recruit.co.jp/hotpepper/small_area/v1/";

interface SmallAreaItem {
  code: string;
  name: string;
  middle_area: { code: string; name: string };
}

interface ApiResult {
  ok: boolean;
  areas: SmallAreaItem[];
  error?: string;
}

interface HotPepperSmallAreaResponse {
  results?: {
    error?: Array<{ message?: string }>;
    small_area?: Array<{
      code: string;
      name: string;
      middle_area?: { code: string; name: string };
    }>;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const middle = (searchParams.get("middle") ?? "").trim();

  if (!middle) {
    const body: ApiResult = {
      ok: false,
      areas: [],
      error: "middle_required",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    const body: ApiResult = {
      ok: false,
      areas: [],
      error: "hotpepper_not_configured",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const params = new URLSearchParams({
    key: apiKey,
    format: "json",
    middle_area: middle,
  });
  const url = `${SMALL_AREA_ENDPOINT}?${params.toString()}`;

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

    const json = (await res.json()) as HotPepperSmallAreaResponse;

    const apiErr = json.results?.error?.[0]?.message;
    if (apiErr) {
      const body: ApiResult = {
        ok: false,
        areas: [],
        error: `HotPepper API: ${apiErr}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const raw = json.results?.small_area ?? [];
    const areas: SmallAreaItem[] = raw.map((a) => ({
      code: a.code,
      name: a.name,
      middle_area: {
        code: a.middle_area?.code ?? "",
        name: a.middle_area?.name ?? "",
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
