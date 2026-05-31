import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UpsellProvider } from "./components/UpsellModal";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "飲みリス🐿️",
  description:
    "飲み会・会食・デートの候補案を、きれいに一発作成。LINE・Slack・メールに貼れる提案文まで作れる幹事向け Web アプリ。",
  metadataBase: new URL("https://nomiris.vercel.app"),
  manifest: "/manifest.json",
  // icons は app/icon.tsx / app/apple-icon.tsx から自動挿入される PNG に任せる
  appleWebApp: {
    capable: true,
    title: "飲みリス",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://nomiris.vercel.app",
    title: "飲みリス🐿️ — 飲み会の候補案を、きれいに一発作成。",
    description:
      "候補店を比較して、LINE・Slack・メールにそのまま貼れる提案文まで作成。飲み会・会食・デートの準備を、もっとスマートに。",
    siteName: "飲みリス",
  },
  twitter: {
    card: "summary_large_image",
    title: "飲みリス🐿️ — 飲み会の候補案を、きれいに一発作成。",
    description: "候補店を比較して、提案文まで作成。幹事向け Web アプリ。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E8843B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-nomiris-bg text-nomiris-textMain">
        <UpsellProvider>{children}</UpsellProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
