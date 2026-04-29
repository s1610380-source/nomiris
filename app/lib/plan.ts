"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "./mockData";
import type { Plan } from "./types";

export type { Plan };
export const PLAN_KEY = STORAGE_KEYS.plan;

/**
 * Plan を localStorage と同期する React hook。
 * SSR safe: 初期値は常に "free" を返し、useEffect で localStorage から読み込む。
 */
export function usePlan(): {
  plan: Plan;
  setPlan: (p: Plan) => void;
  isPro: boolean;
  hydrated: boolean;
} {
  const [plan, setPlanState] = useState<Plan>("free");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw === "pro" || raw === "free") {
        setPlanState(raw);
      }
    } catch {
      /* noop */
    } finally {
      setHydrated(true);
    }

    // 別タブでの変更を反映
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLAN_KEY) {
        const v = e.newValue;
        if (v === "pro" || v === "free") {
          setPlanState(v);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPlan = useCallback((p: Plan) => {
    setPlanState(p);
    try {
      localStorage.setItem(PLAN_KEY, p);
    } catch {
      /* noop */
    }
  }, []);

  return { plan, setPlan, isPro: plan === "pro", hydrated };
}
