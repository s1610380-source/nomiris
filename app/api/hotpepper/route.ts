import { NextResponse } from "next/server";
import {
  convertToRestaurant,
  type HotPepperResponse,
} from "../../lib/hotpepper";
import type { Restaurant } from "../../lib/types";

/** Next.js のデータキャッシュは使わずに毎回叩く */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOTPEPPER_ENDPOINT =
  "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

interface ApiResult {
  shops: Restaurant[];
  error?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = (searchParams.get("station") ?? "").trim();
  const area = (searchParams.get("area") ?? "").trim();
  const areaCode = (searchParams.get("areaCode") ?? "").trim();
  const budgetParam = searchParams.get("budget");
  // scene は現時点では HotPepper への問い合わせには使わない（将来の拡張用）
  // const scene = (searchParams.get("scene") ?? "").trim();

  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    const body: ApiResult = {
      shops: [],
      error: "HOTPEPPER_API_KEY が設定されていません",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const params = new URLSearchParams({
    key: apiKey,
    format: "json",
    count: "20",
  });

  // areaCode の prefix で large_area / middle_area / small_area を選択
  // ・X... → small_area（例: X007）
  // ・Y... → middle_area（例: Y055）
  // ・Z... → large_area（例: Z011）
  // areaCode 指定時は keyword を省略して area code のみで絞り込む（精度向上）。
  let usedAreaCode = false;
  if (areaCode) {
    const head = areaCode[0]?.toUpperCase();
    if (head === "X") {
      params.set("small_area", areaCode);
      usedAreaCode = true;
    } else if (head === "Y") {
      params.set("middle_area", areaCode);
      usedAreaCode = true;
    } else if (head === "Z") {
      params.set("large_area", areaCode);
      usedAreaCode = true;
    }
  }

  if (!usedAreaCode) {
    // areaCode が無い場合は従来通り keyword 検索（駅名 or エリア名）
    const keyword = station || area;
    if (!keyword) {
      const body: ApiResult = {
        shops: [],
        error: "検索キーワードが空です",
      };
      return NextResponse.json(body, { status: 200 });
    }
    params.set("keyword", keyword);
  } else if (station) {
    // areaCode が主役だが、駅名があれば keyword で精度を上げる
    params.set("keyword", station);
  }

  // budget は省略（クライアント側で budgetMax フィルタ）
  // budgetLimit が極端に小さい場合のみ HotPepper の budget code を付ける、という選択肢もあるが
  // 実装簡略化のため、HotPepper には予算指定を投げず多めに取得する。
  void budgetParam;

  const url = `${HOTPEPPER_ENDPOINT}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const body: ApiResult = {
        shops: [],
        error: `HotPepper API HTTP ${res.status}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const json = (await res.json()) as HotPepperResponse;

    const apiErr = json.results?.error?.[0]?.message;
    if (apiErr) {
      const body: ApiResult = {
        shops: [],
        error: `HotPepper API: ${apiErr}`,
      };
      return NextResponse.json(body, { status: 200 });
    }

    const rawShops = json.results?.shop ?? [];
    const shops: Restaurant[] = rawShops.map(convertToRestaurant);

    const body: ApiResult = { shops };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const body: ApiResult = {
      shops: [],
      error: `fetch failed: ${message}`,
    };
    return NextResponse.json(body, { status: 200 });
  }
}
