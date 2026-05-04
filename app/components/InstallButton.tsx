"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * BeforeInstallPromptEvent は標準型に含まれないため最小限を定義。
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "nomiris.installPromptDismissed.v1";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  // iPadOS 13+ は MacIntel + touch を返すので両方を判定
  const iOSPattern = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS =
    ua.includes("Macintosh") &&
    typeof navigator !== "undefined" &&
    "maxTouchPoints" in navigator &&
    (navigator.maxTouchPoints as number) > 1;
  // @ts-expect-error: legacy IE/Edge property
  const msStream = window.MSStream;
  return (iOSPattern || isIPadOS) && !msStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari
  // @ts-expect-error: navigator.standalone is iOS only
  if (window.navigator.standalone) return true;
  return false;
}

interface InstallButtonProps {
  className?: string;
}

export default function InstallButton({ className = "" }: InstallButtonProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosFlow, setIosFlow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalone()) {
      setVisible(false);
      return;
    }

    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) {
      setVisible(false);
      return;
    }

    if (isIOS()) {
      // iOS は beforeinstallprompt が来ないので案内シート方式で常時表示
      setIosFlow(true);
      setVisible(true);
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onAppInstalled = () => {
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (iosFlow) {
      setShowIosSheet(true);
      return;
    }
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
      setInstallEvent(null);
    } catch {
      // ブラウザがプロンプトを拒否した場合は黙って何もしない
    }
  }, [installEvent, iosFlow]);

  const handleDismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage 不可でも UI は閉じる
    }
    setVisible(false);
    setShowIosSheet(false);
  }, []);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          className ||
          "inline-flex items-center justify-center gap-1 rounded-full border border-nomiris-line bg-white text-nomiris-brownDark font-bold px-3 py-2 text-xs sm:text-sm shadow-sm hover:bg-nomiris-cream transition"
        }
        aria-label="ホーム画面に追加"
      >
        <span aria-hidden>📲</span>
        <span className="whitespace-nowrap">ホーム画面に追加</span>
      </button>

      {showIosSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setShowIosSheet(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-nomiris-line overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-nomiris-line/60 flex items-center gap-3">
              <span className="text-3xl" aria-hidden>
                🐿️
              </span>
              <div className="flex-1 min-w-0">
                <p id="ios-install-title" className="font-extrabold text-nomiris-brownDark text-base">
                  ホーム画面に追加する
                </p>
                <p className="text-xs text-nomiris-textSub mt-0.5">
                  Safari の手順に沿って 3 ステップで完了します
                </p>
              </div>
            </div>

            <ol className="px-5 py-4 space-y-3 text-sm text-nomiris-brownDark">
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-orange font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span className="leading-relaxed">
                  画面下（または上）の <span className="font-bold">共有ボタン</span>{" "}
                  <span aria-hidden>(□↑)</span> をタップ
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-orange font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="leading-relaxed">
                  メニューを下にスクロールして{" "}
                  <span className="font-bold">「ホーム画面に追加」</span> を選択
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-orange font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <span className="leading-relaxed">
                  右上の <span className="font-bold">「追加」</span> をタップして完了
                </span>
              </li>
            </ol>

            <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowIosSheet(false)}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-nomiris-orange text-white font-bold px-4 py-3 text-sm shadow-sm hover:bg-nomiris-orangeDark transition"
              >
                わかった
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 inline-flex items-center justify-center rounded-full border border-nomiris-line text-nomiris-textSub font-semibold px-4 py-3 text-sm hover:bg-nomiris-cream transition"
              >
                次回から表示しない
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
