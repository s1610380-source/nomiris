"use client";

import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "../lib/types";

/**
 * Leaflet を CDN から動的読込して候補店を地図ピンで表示するコンポーネント。
 * - SSR 安全（"use client"、windows / document アクセスは useEffect 内）
 * - lat/lng を持たない候補は地図には表示しない
 * - 候補が変わったらマーカーを張り替える
 */

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

interface LeafletMarker {
  bindPopup: (html: string) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
  remove: () => void;
}

interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => LeafletMap;
  fitBounds: (
    bounds: [[number, number], [number, number]],
    opts?: { padding?: [number, number] },
  ) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
}

interface LeafletGlobal {
  map: (el: HTMLElement) => LeafletMap;
  tileLayer: (
    url: string,
    opts: { attribution: string; maxZoom?: number },
  ) => { addTo: (m: LeafletMap) => unknown };
  marker: (latlng: [number, number]) => LeafletMarker;
}

declare global {
  interface Window {
    L?: LeafletGlobal;
  }
}

interface Props {
  candidates: Restaurant[];
}

function ensureLeafletAssets(): Promise<LeafletGlobal> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    // CSS
    if (!document.querySelector(`link[data-nm-leaflet="1"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      link.crossOrigin = "";
      link.setAttribute("data-nm-leaflet", "1");
      document.head.appendChild(link);
    }
    // JS
    if (window.L) {
      resolve(window.L);
      return;
    }
    const existing = document.querySelector(
      `script[data-nm-leaflet="1"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.L) resolve(window.L);
        else reject(new Error("leaflet not available after load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("leaflet script failed to load")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.crossOrigin = "";
    script.setAttribute("data-nm-leaflet", "1");
    script.addEventListener("load", () => {
      if (window.L) resolve(window.L);
      else reject(new Error("leaflet not available after load"));
    });
    script.addEventListener("error", () =>
      reject(new Error("leaflet script failed to load")),
    );
    document.head.appendChild(script);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function MapView({ candidates }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const withCoords = candidates.filter(
    (r) =>
      typeof r.lat === "number" &&
      typeof r.lng === "number" &&
      Number.isFinite(r.lat) &&
      Number.isFinite(r.lng),
  );
  const withoutCoordsCount = candidates.length - withCoords.length;

  useEffect(() => {
    let cancelled = false;
    ensureLeafletAssets()
      .then((L) => {
        if (cancelled) return;
        if (!containerRef.current) return;
        if (!mapRef.current) {
          const map = L.map(containerRef.current);
          // 初期表示はとりあえず東京駅近辺
          map.setView([35.681236, 139.767125], 13);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);
          mapRef.current = map;
        }
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 候補が変わったらマーカーを張り替え
  useEffect(() => {
    if (status !== "ready") return;
    const L = typeof window !== "undefined" ? window.L : undefined;
    const map = mapRef.current;
    if (!L || !map) return;

    // 既存マーカー除去
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch {
        /* noop */
      }
    });
    markersRef.current = [];

    if (withCoords.length === 0) {
      // 中心を東京駅に戻す
      map.setView([35.681236, 139.767125], 12);
      try {
        map.invalidateSize();
      } catch {
        /* noop */
      }
      return;
    }

    // マーカー追加
    const lats: number[] = [];
    const lngs: number[] = [];
    withCoords.forEach((r) => {
      const lat = r.lat as number;
      const lng = r.lng as number;
      lats.push(lat);
      lngs.push(lng);
      const html = `
        <div style="font-family: -apple-system, 'Segoe UI', sans-serif; min-width: 160px;">
          <div style="font-weight: bold; font-size: 13px; color: #5a3a1f;">
            ${escapeHtml(r.emoji || "🍴")} ${escapeHtml(r.name)}
          </div>
          <div style="font-size: 11px; color: #8a6a4f; margin-top: 2px;">
            ${escapeHtml(r.genre || "")}${r.area ? " · " + escapeHtml(r.area) : ""}
          </div>
          ${
            r.budget
              ? `<div style="font-size: 11px; color: #b06b1b; margin-top: 2px;">💰 ${escapeHtml(r.budget)}</div>`
              : ""
          }
          ${
            r.url
              ? `<div style="margin-top: 4px;"><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #c0691b; text-decoration: underline;">店舗ページ →</a></div>`
              : ""
          }
        </div>
      `;
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(html);
      markersRef.current.push(marker);
    });

    if (withCoords.length === 1) {
      map.setView([lats[0], lngs[0]], 15);
    } else {
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      try {
        map.fitBounds(
          [
            [minLat, minLng],
            [maxLat, maxLng],
          ],
          { padding: [24, 24] },
        );
      } catch {
        const cLat = (minLat + maxLat) / 2;
        const cLng = (minLng + maxLng) / 2;
        map.setView([cLat, cLng], 14);
      }
    }
    try {
      map.invalidateSize();
    } catch {
      /* noop */
    }
    // withCoords は candidates から導出される値だが ESLint への明示として candidates を依存に
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, status]);

  // アンマウント時に map を破棄
  useEffect(() => {
    return () => {
      try {
        markersRef.current.forEach((m) => m.remove());
      } catch {
        /* noop */
      }
      markersRef.current = [];
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          /* noop */
        }
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-xl border border-nomiris-line bg-nomiris-cream/40 h-[280px] sm:h-[360px]"
        style={{ zIndex: 0 }}
      />
      {status === "loading" && (
        <p className="text-[11px] text-nomiris-textSub">
          🗺 地図を読み込み中…
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-amber-700">
          ⚠️ 地図の読み込みに失敗しました。ネットワーク接続をご確認ください。
        </p>
      )}
      {status === "ready" && withCoords.length === 0 && (
        <p className="text-[11px] text-nomiris-textSub">
          位置情報がないため地図に表示できません（カタログ由来の候補は緯度経度を持っていません）。
        </p>
      )}
      {status === "ready" &&
        withCoords.length > 0 &&
        withoutCoordsCount > 0 && (
          <p className="text-[11px] text-nomiris-textSub">
            ※ {withoutCoordsCount} 件はデータ不足のため地図に表示できません。
          </p>
        )}
    </div>
  );
}
