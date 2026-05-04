import { ImageResponse } from "next/og";

// Android / 一般用 PWA アイコン（192x192 PNG）
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 130,
          border: "8px solid #E8843B",
          borderRadius: 32,
        }}
      >
        🐿️
      </div>
    ),
    size,
  );
}
