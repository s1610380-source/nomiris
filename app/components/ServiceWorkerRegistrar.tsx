"use client";

import { useEffect } from "react";

/**
 * 本番環境のみで Service Worker を登録する。
 * dev / プレビューでは登録しない（キャッシュ事故を防ぐ）。
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 失敗しても UX に影響しないので握りつぶす
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
