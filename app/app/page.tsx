"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import HomeHero from "../components/HomeHero";
import StepIndicator from "../components/StepIndicator";
import Step1ConditionForm from "../components/Step1ConditionForm";
import Step2Picker from "../components/Step2Picker";
import Step3Proposal from "../components/Step3Proposal";
import { useUpsell } from "../components/UpsellModal";
import { DEFAULT_CONDITION, STORAGE_KEYS } from "../lib/mockData";
import { ALL_MODES, MODE_PLANS } from "../lib/mode";
import { usePlan } from "../lib/plan";
import type { EventCondition, Mode, Restaurant } from "../lib/types";

type StepNum = 1 | 2 | 3;

function isValidMode(value: string | null): value is Mode {
  return value !== null && (ALL_MODES as string[]).includes(value);
}

function AppPageInner() {
  const [step, setStep] = useState<StepNum>(1);
  const [condition, setCondition] =
    useState<EventCondition>(DEFAULT_CONDITION);
  const [candidates, setCandidates] = useState<Restaurant[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const stepStartRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");

  const { isPro } = usePlan();
  const upsell = useUpsell();

  // 起動時に localStorage から条件のみ復元（候補はステップ2で必ず再ピックされるため永続化しない）
  // URL クエリで ?mode= が指定されていればそちらを優先する。
  useEffect(() => {
    let next: EventCondition = DEFAULT_CONDITION;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.condition);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EventCondition>;
        next = { ...DEFAULT_CONDITION, ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    if (isValidMode(queryMode)) {
      next = { ...next, mode: queryMode };
    }
    setCondition(next);
    setHydrated(true);
    // URL クエリは初回のみ反映する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.condition, JSON.stringify(condition));
    } catch {
      /* noop */
    }
  }, [condition, hydrated]);

  // ステップ切り替え時にスクロール位置をトップにリセット
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [step]);

  const goToStep2 = () => setStep(2);
  const goToStep3 = () => setStep(3);
  const goBackToStep1 = () => setStep(1);
  const goBackToStep2 = () => setStep(2);

  const handleRestart = () => {
    setCandidates([]);
    setStep(1);
  };

  const handleSelectMode = (m: Mode) => {
    setCondition((prev) => ({ ...prev, mode: m }));
    if (MODE_PLANS[m] === "pro" && !isPro) {
      upsell.open({
        title: `${m === "business" ? "仕事・会食" : "デート"}モードは Pro 向けです`,
        description:
          "条件入力までは無料で試せますが、メールや LINE 文面の生成は Pro 版で解放されます。",
      });
    }
    // step 1 に向けてスクロール
    if (stepStartRef.current) {
      stepStartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleHeroCta = () => {
    if (stepStartRef.current) {
      stepStartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {step === 1 && (
        <HomeHero
          selectedMode={condition.mode}
          onSelectMode={handleSelectMode}
          onCtaClick={handleHeroCta}
        />
      )}
      <div ref={stepStartRef} />
      <StepIndicator step={step} />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-5">
          {step === 1 && (
            <Step1ConditionForm
              value={condition}
              onChange={setCondition}
              onNext={goToStep2}
            />
          )}
          {step === 2 && (
            <Step2Picker
              condition={condition}
              candidates={candidates}
              setCandidates={setCandidates}
              onBack={goBackToStep1}
              onNext={goToStep3}
            />
          )}
          {step === 3 && (
            <Step3Proposal
              condition={condition}
              candidates={candidates}
              onBack={goBackToStep2}
              onRestart={handleRestart}
            />
          )}

          <p className="pt-6 pb-8 text-center text-xs text-nomiris-textSub">
            🐿️ 飲みリス — データはこの端末の localStorage にのみ保存されます。
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-nomiris-textSub">
          読み込み中…
        </div>
      }
    >
      <AppPageInner />
    </Suspense>
  );
}
