import { ImageResponse } from "next/og";

// iOS Safari「ホーム画面に追加」用アイコン（180x180 PNG）
// iOS が自動で角丸クリップするため borderRadius は 0
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF6EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 124,
          borderRadius: 0,
        }}
      >
        🐿️
      </div>
    ),
    size,
  );
}
