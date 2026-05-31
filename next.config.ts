import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // HotPepper グルメサーチ API 由来の店舗写真
      { protocol: "https", hostname: "imgfp.hotp.jp" },
    ],
  },
};

export default nextConfig;
