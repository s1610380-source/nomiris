"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlan } from "../lib/plan";
import ProBadge from "./ProBadge";
import InstallButton from "./InstallButton";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/#features", label: "できること" },
  { href: "/#modes", label: "モード" },
  { href: "/#pro", label: "Pro 機能" },
  { href: "/pricing", label: "料金" },
];

export default function Header() {
  const { isPro } = usePlan();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // メニューを開いたとき body のスクロールをロック
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur border-b border-nomiris-line/60 shadow-[0_1px_0_rgba(122,79,46,0.04)]"
          : "bg-white/70 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 min-w-0 group"
            onClick={close}
          >
            <span className="text-2xl sm:text-3xl shrink-0 transition-transform group-hover:-rotate-6" aria-hidden>
              🐿️
            </span>
            <span className="font-extrabold tracking-tight text-nomiris-brownDark text-lg sm:text-xl">
              飲み<span className="text-nomiris-orange">リス</span>
            </span>
            {isPro && (
              <ProBadge className="hidden sm:inline-flex ml-1" />
            )}
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-semibold text-nomiris-brown hover:text-nomiris-orange transition-colors rounded-full"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/history"
              className="px-3 py-2 text-sm font-semibold text-nomiris-textSub hover:text-nomiris-orange transition-colors rounded-full"
            >
              履歴
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <InstallButton className="hidden sm:inline-flex items-center justify-center gap-1 rounded-full border border-nomiris-line bg-white text-nomiris-brownDark font-bold px-3 py-2 text-xs lg:text-sm shadow-sm hover:bg-nomiris-cream transition" />
            <Link
              href="/app"
              className="hidden md:inline-flex items-center justify-center gap-1 rounded-full bg-nomiris-orange text-white font-bold px-4 lg:px-5 py-2 lg:py-2.5 text-sm shadow-sm hover:bg-nomiris-orangeDark transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              無料で作る
            </Link>

            {/* mobile hamburger */}
            <button
              type="button"
              aria-label={open ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-nomiris-brownDark hover:bg-nomiris-cream transition"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 bg-current rounded-full transition-transform duration-300 ${
                    open ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current rounded-full transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-3 h-0.5 w-5 bg-current rounded-full transition-transform duration-300 ${
                    open ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 border-t ${
          open
            ? "max-h-[calc(100vh-3.5rem)] opacity-100 border-nomiris-line/50 bg-white/95 backdrop-blur"
            : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="px-3 py-3 text-base font-semibold text-nomiris-brownDark hover:bg-nomiris-cream rounded-xl transition"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/history"
            onClick={close}
            className="px-3 py-3 text-base font-semibold text-nomiris-textSub hover:bg-nomiris-cream rounded-xl transition"
          >
            履歴
          </Link>

          {isPro && (
            <div className="px-3 py-2">
              <ProBadge label="Pro 利用中" />
            </div>
          )}

          <Link
            href="/app"
            onClick={close}
            className="mt-3 inline-flex items-center justify-center gap-1 rounded-full bg-nomiris-orange text-white font-bold py-3.5 text-base shadow-sm hover:bg-nomiris-orangeDark transition"
          >
            🐿️ 無料で作る
          </Link>

          <div className="mt-2 flex justify-center">
            <InstallButton className="inline-flex items-center justify-center gap-1 rounded-full border border-nomiris-line bg-white text-nomiris-brownDark font-bold px-4 py-2.5 text-sm shadow-sm hover:bg-nomiris-cream transition" />
          </div>
        </div>
      </div>
    </header>
  );
}
