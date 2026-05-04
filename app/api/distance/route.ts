import { NextResponse } from "next/server";

/**
 * Google Distance Matrix API プロキシ。
 * 出発地 origin から複数の目的地 destinations までの徒歩 / 車での
 * 距離・所要時間を 1 リクエストで取得する。
 *
 * リクエスト body (JSON):
 *   { origin: string, destinations: string[], mode?: "walking" | "driving" }
 *
 * レスポンスは常に HTTP 200 で返す。
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DISTANCE_MATRIX_ENDPOINT =
  "https://maps.googleapis.com/maps/api/distancematrix/json";

type Mode = "walking" | "driving";

interface RequestBody {
  origin?: unknown;
  destinations?: unknown;
  mode?: unknown;
}

interface DistanceMatrixElement {
  status: string;
  distance?: { value: number; text: string };
  duration?: { value: number; text: string };
}

interface DistanceMatrixRow {
  elements?: DistanceMatrixElement[];
}

interface DistanceMatrixResponse {
  status: string;
  error_message?: string;
  origin_addresses?: string[];
  destination_addresses?: string[];
  rows?: DistanceMatrixRow[];
}

interface ResultElement {
  destination: string;
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  status: "OK" | "ZERO_RESULTS" | "NOT_FOUND" | string;
}

interface ApiResult {
  ok: boolean;
  origin?: string;
  elements: ResultElement[];
  error?: string;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function normalizeMode(v: unknown): Mode {
  return v === "driving" ? "driving" : "walking";
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    const result: ApiResult = {
      ok: false,
      error: "invalid_json",
      elements: [],
    };
    return NextResponse.json(result, { status: 200 });
  }

  const origin =
    typeof body.origin === "string" ? body.origin.trim() : "";
  const destinations = asStringArray(body.destinations);
  const mode = normalizeMode(body.mode);

  if (!origin || destinations.length === 0) {
    const result: ApiResult = {
      ok: false,
      error: "empty_input",
      elements: [],
    };
    return NextResponse.json(result, { status: 200 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    const result: ApiResult = {
      ok: false,
      error: "google_maps_not_configured",
      elements: [],
    };
    return NextResponse.json(result, { status: 200 });
  }

  // Distance Matrix は destinations を `|` 区切りで複数指定できる
  const params = new URLSearchParams({
    key: apiKey,
    origins: origin,
    destinations: destinations.join("|"),
    mode,
    language: "ja",
  });

  const url = `${DISTANCE_MATRIX_ENDPOINT}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const result: ApiResult = {
        ok: false,
        error: `google_maps_http_${res.status}`,
        elements: [],
      };
      return NextResponse.json(result, { status: 200 });
    }

    const json = (await res.json()) as DistanceMatrixResponse;

    if (json.status !== "OK") {
      const result: ApiResult = {
        ok: false,
        error: `google_maps_status_${json.status}${
          json.error_message ? `: ${json.error_message}` : ""
        }`,
        elements: [],
      };
      return NextResponse.json(result, { status: 200 });
    }

    const row = json.rows?.[0];
    const elements: ResultElement[] = destinations.map((dest, i) => {
      const el = row?.elements?.[i];
      const status = (el?.status ?? "UNKNOWN") as ResultElement["status"];
      const distanceMeters = el?.distance?.value ?? 0;
      const distanceText = el?.distance?.text ?? "";
      const durationSeconds = el?.duration?.value ?? 0;
      const durationText = el?.duration?.text ?? "";
      const durationMinutes =
        durationSeconds > 0 ? Math.ceil(durationSeconds / 60) : 0;
      return {
        destination:
          json.destination_addresses?.[i]?.trim() || dest,
        distanceMeters,
        distanceText,
        durationSeconds,
        durationMinutes,
        durationText,
        status,
      };
    });

    const result: ApiResult = {
      ok: true,
      origin: json.origin_addresses?.[0]?.trim() || origin,
      elements,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const result: ApiResult = {
      ok: false,
      error: `fetch_failed: ${message}`,
      elements: [],
    };
    return NextResponse.json(result, { status: 200 });
  }
}
