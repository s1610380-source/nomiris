"use client";

import { useState } from "react";
import type { EventCondition, Mode, YesNoEither } from "../lib/types";
import { AREA_SUGGESTIONS } from "../lib/mockData";
import {
  ALL_MODES,
  ATMOSPHERE_TAGS,
  IMPORTANT_TAGS,
  MODE_EMOJIS,
  MODE_LABELS,
  MODE_PLANS,
  SCENE_OPTIONS_BY_MODE,
} from "../lib/mode";
import { usePlan } from "../lib/plan";
import { useUpsell } from "./UpsellModal";
import AreaPicker from "./AreaPicker";
import ProBadge from "./ProBadge";

type AreaInputMode = "master" | "free";

const YES_NO_EITHER: YesNoEither[] = ["あり", "なし", "どちらでも"];

interface Props {
  value: EventCondition;
  onChange: (next: EventCondition) => void;
  onNext: () => void;
}

function toIntOrZero(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : 0;
}

export default function Step1ConditionForm({ value, onChange, onNext }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  // 「マスタから選ぶ」をデフォルト。ユーザーが自由入力に切替えた場合のみ "free"。
  const [areaInputMode, setAreaInputMode] = useState<AreaInputMode>("master");
  const { isPro } = usePlan();
  const upsell = useUpsell();

  const update = <K extends keyof EventCondition>(
    key: K,
    val: EventCondition[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  const toggleTag = (key: "atmosphereTags" | "importantTags", tag: string) => {
    const current = value[key];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    update(key, next);
  };

  const handleSelectMode = (m: Mode) => {
    update("mode", m);
    // 用途（scene）はモードのデフォルトに揃える
    const opts = SCENE_OPTIONS_BY_MODE[m];
    const firstFree = opts.find((o) => !o.proGate) ?? opts[0];
    if (firstFree) {
      onChange({ ...value, mode: m, scene: firstFree.value });
    }
    if (MODE_PLANS[m] === "pro" && !isPro) {
      upsell.open({
        title: `${MODE_LABELS[m]}モードは Pro 向けです`,
        description:
          "条件入力までは無料で試せますが、メールや LINE 文面の生成は Pro 版で解放されます。",
      });
    }
  };

  const handleSelectScene = (sceneValue: string, proGate: boolean) => {
    if (proGate && !isPro) {
      upsell.open({
        title: "この用途は Pro 向けです",
        description:
          "失敗できない場面に特化した文面（接待・上司・初デート等）は Pro 版に含まれます。",
      });
    }
    update("scene", sceneValue);
  };

  const handleNext = () => {
    onNext();
  };

  const sceneOptions = SCENE_OPTIONS_BY_MODE[value.mode];

  return (
    <div className="space-y-5">
      {/* モード選択チップ */}
      <section className="nm-card space-y-3">
        <header>
          <h2 className="text-lg font-bold text-nomiris-brownDark">
            <span className="mr-1" aria-hidden>
              🎯
            </span>
            モードを選ぶ
          </h2>
          <p className="mt-1 text-xs text-nomiris-textSub">
            シーンに合わせて、提案文のテンプレートが切り替わります。
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {ALL_MODES.map((m) => {
            const active = value.mode === m;
            const isProMode = MODE_PLANS[m] === "pro";
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectMode(m)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? isProMode
                      ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900"
                      : "border-nomiris-orange bg-nomiris-orange text-white"
                    : "border-nomiris-line bg-white text-nomiris-brown hover:bg-nomiris-cream"
                }`}
              >
                <span aria-hidden>{MODE_EMOJIS[m]}</span>
                <span>{MODE_LABELS[m]}</span>
                {isProMode && <ProBadge className="!text-[9px] !px-1.5" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="nm-card space-y-4">
        <header>
          <h2 className="text-lg font-bold text-nomiris-brownDark">
            <span className="mr-1" aria-hidden>
              📝
            </span>
            条件を入力
          </h2>
          <p className="mt-1 text-xs text-nomiris-textSub">
            最低限の項目だけ埋めればOK。詳細は折りたたみから。
          </p>
        </header>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <span className="nm-label">エリア</span>
              {/* 選び方タブ */}
              <div className="mb-2 flex gap-1 rounded-full bg-nomiris-cream p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAreaInputMode("master");
                  }}
                  className={`flex-1 rounded-full px-3 py-1.5 transition ${
                    areaInputMode === "master"
                      ? "bg-white text-nomiris-brownDark shadow-sm"
                      : "text-nomiris-textSub"
                  }`}
                >
                  📋 マスタから選ぶ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // 自由入力に切り替えるときは areaCode をクリア
                    onChange({ ...value, areaCode: "" });
                    setAreaInputMode("free");
                  }}
                  className={`flex-1 rounded-full px-3 py-1.5 transition ${
                    areaInputMode === "free"
                      ? "bg-white text-nomiris-brownDark shadow-sm"
                      : "text-nomiris-textSub"
                  }`}
                >
                  ✏️ 自由入力
                </button>
              </div>

              {areaInputMode === "master" ? (
                <AreaPicker
                  value={{ area: value.area, areaCode: value.areaCode }}
                  onChange={(next) =>
                    onChange({
                      ...value,
                      area: next.area,
                      areaCode: next.areaCode,
                    })
                  }
                />
              ) : (
                <div>
                  <label htmlFor="cond-area" className="sr-only">
                    エリア（自由入力）
                  </label>
                  <input
                    id="cond-area"
                    list="nomiris-area-suggestions"
                    className="nm-input"
                    placeholder="例: 新宿、横浜、地元の駅名でも OK"
                    value={value.area}
                    onChange={(e) => update("area", e.target.value)}
                  />
                  <datalist id="nomiris-area-suggestions">
                    {AREA_SUGGESTIONS.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="cond-scene" className="nm-label">
                用途
              </label>
              <select
                id="cond-scene"
                className="nm-input"
                value={value.scene}
                onChange={(e) => {
                  const opt = sceneOptions.find((o) => o.value === e.target.value);
                  handleSelectScene(e.target.value, !!opt?.proGate);
                }}
              >
                {sceneOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                    {s.proGate ? " (Pro)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cond-people" className="nm-label">
                人数
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-nomiris-line bg-white">
                <button
                  type="button"
                  aria-label="人数を1人減らす"
                  onClick={() =>
                    update(
                      "peopleCount",
                      Math.max(1, (value.peopleCount || 1) - 1),
                    )
                  }
                  className="px-4 text-2xl font-bold text-nomiris-orange hover:bg-nomiris-cream active:bg-nomiris-cream/80 disabled:text-nomiris-line disabled:hover:bg-transparent"
                  disabled={(value.peopleCount || 0) <= 1}
                >
                  −
                </button>
                <input
                  id="cond-people"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="flex-1 border-0 bg-transparent text-center text-base font-semibold text-nomiris-brownDark focus:outline-none"
                  value={value.peopleCount === 0 ? "" : value.peopleCount}
                  onChange={(e) =>
                    update("peopleCount", toIntOrZero(e.target.value))
                  }
                />
                <button
                  type="button"
                  aria-label="人数を1人増やす"
                  onClick={() =>
                    update("peopleCount", (value.peopleCount || 0) + 1)
                  }
                  className="px-4 text-2xl font-bold text-nomiris-orange hover:bg-nomiris-cream active:bg-nomiris-cream/80"
                >
                  ＋
                </button>
              </div>
            </div>

            <div>
              <span className="nm-label">予算（円/人）</span>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  id="cond-budget-min"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  className="nm-input"
                  placeholder="下限"
                  aria-label="予算下限（0 で指定なし）"
                  value={value.budgetMin === 0 ? "" : value.budgetMin}
                  onChange={(e) => {
                    const next = toIntOrZero(e.target.value);
                    // 下限が上限を超える場合は上限を引き上げて補正
                    const max =
                      value.budgetMax > 0 && next > value.budgetMax
                        ? next
                        : value.budgetMax;
                    onChange({ ...value, budgetMin: next, budgetMax: max });
                  }}
                />
                <span className="text-nomiris-textSub text-sm font-bold">
                  〜
                </span>
                <input
                  id="cond-budget-max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  className="nm-input"
                  placeholder="上限"
                  aria-label="予算上限（0 で指定なし）"
                  value={value.budgetMax === 0 ? "" : value.budgetMax}
                  onChange={(e) => {
                    const next = toIntOrZero(e.target.value);
                    // 上限が下限を下回る場合は下限を引き下げて補正
                    const min =
                      next > 0 && value.budgetMin > next
                        ? next
                        : value.budgetMin;
                    onChange({ ...value, budgetMin: min, budgetMax: next });
                  }}
                />
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <input
                    aria-label="予算下限スライダー"
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    className="w-full accent-nomiris-orange"
                    value={value.budgetMin}
                    onChange={(e) => {
                      const next = toIntOrZero(e.target.value);
                      const max =
                        value.budgetMax > 0 && next > value.budgetMax
                          ? next
                          : value.budgetMax;
                      onChange({ ...value, budgetMin: next, budgetMax: max });
                    }}
                  />
                </div>
                <div>
                  <input
                    aria-label="予算上限スライダー"
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    className="w-full accent-nomiris-orange"
                    value={value.budgetMax}
                    onChange={(e) => {
                      const next = toIntOrZero(e.target.value);
                      const min =
                        next > 0 && value.budgetMin > next
                          ? next
                          : value.budgetMin;
                      onChange({ ...value, budgetMin: min, budgetMax: next });
                    }}
                  />
                </div>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-nomiris-textSub">
                <span>¥0</span>
                <span className="font-semibold text-nomiris-brown">
                  {value.budgetMin > 0
                    ? `¥${value.budgetMin.toLocaleString()}`
                    : "指定なし"}
                  {" 〜 "}
                  {value.budgetMax > 0
                    ? `¥${value.budgetMax.toLocaleString()}`
                    : "指定なし"}
                </span>
                <span>¥15,000</span>
              </div>
              <p className="mt-1 text-[11px] text-nomiris-textSub">
                0 にすると「指定なし」になります（下限・上限とも）。
              </p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cond-date" className="nm-label">
                希望日時（任意）
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2">
                <input
                  id="cond-date"
                  type="datetime-local"
                  className="nm-input"
                  value={
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value.desiredDate)
                      ? value.desiredDate.slice(0, 16)
                      : ""
                  }
                  onChange={(e) => update("desiredDate", e.target.value)}
                />
                <input
                  type="text"
                  className="nm-input"
                  placeholder="または範囲・備考（例: 5/10〜5/15のいずれか）"
                  value={
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value.desiredDate)
                      ? ""
                      : value.desiredDate
                  }
                  onChange={(e) => update("desiredDate", e.target.value)}
                />
              </div>
              <p className="mt-1 text-[11px] text-nomiris-textSub">
                カレンダーで日時を選ぶか、範囲を文字で書くかどちらでも OK。提案文・メール文面に差し込まれます。
              </p>
            </div>
          </div>

          {/* 雰囲気チップ */}
          <div>
            <span className="nm-label">雰囲気（複数選択可）</span>
            <div className="flex flex-wrap gap-1.5">
              {ATMOSPHERE_TAGS.map((tag) => {
                const on = value.atmosphereTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag("atmosphereTags", tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      on
                        ? "border-nomiris-orange bg-nomiris-orange text-white"
                        : "border-nomiris-line bg-white text-nomiris-brown hover:bg-nomiris-cream"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 重視することチップ */}
          <div>
            <span className="nm-label">重視すること（複数選択可）</span>
            <div className="flex flex-wrap gap-1.5">
              {IMPORTANT_TAGS.map((tag) => {
                const on = value.importantTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag("importantTags", tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      on
                        ? "border-nomiris-orange bg-nomiris-orange text-white"
                        : "border-nomiris-line bg-white text-nomiris-brown hover:bg-nomiris-cream"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-nomiris-line/80 bg-nomiris-cream/60">
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-nomiris-brown"
            aria-expanded={showDetail}
          >
            <span>詳細条件{showDetail ? "" : "（折りたたみ中）"}</span>
            <span aria-hidden className="text-nomiris-orange">
              {showDetail ? "▲" : "▼"}
            </span>
          </button>
          {showDetail && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="cond-station" className="nm-label">
                    最寄り駅
                  </label>
                  <input
                    id="cond-station"
                    className="nm-input"
                    placeholder="例: 新宿三丁目、渋谷"
                    value={value.nearestStation}
                    onChange={(e) =>
                      update("nearestStation", e.target.value)
                    }
                  />
                  <p className="mt-1 text-[11px] text-nomiris-textSub">
                    入力するとお店検索の精度が上がります（任意）
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="cond-origin"
                    className="nm-label flex items-center gap-1.5"
                  >
                    <span>出発地（任意）</span>
                    <ProBadge className="!text-[9px] !px-1.5" />
                  </label>
                  <input
                    id="cond-origin"
                    className="nm-input"
                    placeholder="例: 新宿駅、自宅最寄り、東京駅"
                    value={value.originStation}
                    onChange={(e) =>
                      update("originStation", e.target.value)
                    }
                  />
                  <p className="mt-1 text-[11px] text-nomiris-textSub">
                    出発地から各候補店までの徒歩◯分・距離を提案文に自動挿入します（Pro）
                  </p>
                </div>
                <div>
                  <label htmlFor="cond-walk" className="nm-label">
                    駅徒歩分数（以内）
                  </label>
                  <input
                    id="cond-walk"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="nm-input"
                    value={
                      value.walkingMinutes === 0 ? "" : value.walkingMinutes
                    }
                    onChange={(e) =>
                      update("walkingMinutes", toIntOrZero(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="cond-nomi" className="nm-label">
                    飲み放題
                  </label>
                  <select
                    id="cond-nomi"
                    className="nm-input"
                    value={value.nomihodai}
                    onChange={(e) =>
                      update("nomihodai", e.target.value as YesNoEither)
                    }
                  >
                    {YES_NO_EITHER.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cond-private" className="nm-label">
                    個室
                  </label>
                  <select
                    id="cond-private"
                    className="nm-input"
                    value={value.privateRoom}
                    onChange={(e) =>
                      update("privateRoom", e.target.value as YesNoEither)
                    }
                  >
                    {YES_NO_EITHER.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cond-atmosphere" className="nm-label">
                    雰囲気の補足
                  </label>
                  <input
                    id="cond-atmosphere"
                    className="nm-input"
                    placeholder="例: 会話しやすい"
                    value={value.atmosphere}
                    onChange={(e) => update("atmosphere", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="cond-participants" className="nm-label">
                    相手
                  </label>
                  <input
                    id="cond-participants"
                    className="nm-input"
                    placeholder="例: 上司・若手混合"
                    value={value.participants}
                    onChange={(e) => update("participants", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cond-avoid" className="nm-label">
                    避けたいこと
                  </label>
                  <textarea
                    id="cond-avoid"
                    className="nm-textarea"
                    placeholder="例: うるさすぎる、駅から遠い"
                    value={value.avoidPoints}
                    onChange={(e) => update("avoidPoints", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="nm-btn-primary"
          onClick={handleNext}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
