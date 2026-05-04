"use client";

/**
 * Google Distance Matrix のフロント側ラッパー。
 * /api/distance を叩くだけ。API キーは絶対にフロントへ持たせない。
 */

export interface DistanceElement {
  destination: string;
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  status: string;
}

export interface DistanceResponse {
  ok: boolean;
  origin?: string;
  elements: DistanceElement[];
  error?: string;
}

export type TravelMode = "walking" | "driving";

/**
 * 出発地から複数の目的地までの距離・所要時間をまとめて取得する。
 * 失敗時は { ok: false, elements: [], error: "..." } を返す（throw しない）。
 */
export async function fetchDistances(
  origin: string,
  destinations: string[],
  mode: TravelMode = "walking",
): Promise<DistanceResponse> {
  const safeOrigin = (origin ?? "").trim();
  const safeDests = (destinations ?? [])
    .map((d) => (d ?? "").trim())
    .filter((d) => d.length > 0);

  if (!safeOrigin || safeDests.length === 0) {
    return { ok: false, elements: [], error: "empty_input" };
  }

  try {
    const res = await fetch("/api/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: safeOrigin,
        destinations: safeDests,
        mode,
      }),
      cache: "no-store",
    });
    const json = (await res.json()) as DistanceResponse;
    return json;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, elements: [], error: `fetch_failed: ${msg}` };
  }
}
