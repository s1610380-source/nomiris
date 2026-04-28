import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "飲みリス🐿️",
  description:
    "飲み会・会食・懇親会の幹事のための、候補店まとめ＆提案文ジェネレーター。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF6EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-nomiris-bg text-nomiris-textMain">
        {children}
      </body>
    </html>
  );
}
