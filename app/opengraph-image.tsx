import { ImageResponse } from "next/og";

// Next.js 15 opengraph-image convention
// Twitter / LINE / Slack 等のシェアプレビュー用 PNG を動的に生成する
export const runtime = "edge";
export const alt = "飲みリス🐿️ — 飲み会・会食の候補案を、きれいに一発作成。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #FAF6EE 0%, #FFE8D0 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#4A2A12",
        }}
      >
        <div style={{ fontSize: 180, lineHeight: 1 }}>🐿️</div>
        <div style={{ marginTop: 30, fontSize: 80, fontWeight: 900 }}>
          飲み<span style={{ color: "#E8843B" }}>リス</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 36, color: "#8B6A4F" }}>
          飲み会・会食の候補案を、きれいに一発作成。
        </div>
        <div style={{ marginTop: 40, fontSize: 24, color: "#A88670" }}>
          幹事向け候補案作成 Web アプリ
        </div>
      </div>
    ),
    size,
  );
}
