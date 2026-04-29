import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UpsellProvider } from "./components/UpsellModal";

export const metadata: Metadata = {
  title: "飲みリス🐿️",
  description: "飲み会・会食の候補案を、きれいに一発作成。",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "飲みリス",
    statusBarStyle: "default",
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
      </body>
    </html>
  );
}
