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
import ProBadge from "./ProBadge";

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
            <div>
              <label htmlFor="cond-area" className="nm-label">
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
              <input
                id="cond-people"
                type="number"
                inputMode="numeric"
                min={1}
                className="nm-input"
                value={value.peopleCount === 0 ? "" : value.peopleCount}
                onChange={(e) =>
                  update("peopleCount", toIntOrZero(e.target.value))
                }
              />
            </div>

            <div>
              <label htmlFor="cond-budget" className="nm-label">
                予算上限（円/人）
              </label>
              <input
                id="cond-budget"
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                className="nm-input"
                value={value.budgetLimit === 0 ? "" : value.budgetLimit}
                onChange={(e) =>
                  update("budgetLimit", toIntOrZero(e.target.value))
                }
              />
              <input
                aria-label="予算スライダー"
                type="range"
                min={2000}
                max={15000}
                step={500}
                className="mt-2 w-full accent-nomiris-orange"
                value={value.budgetLimit}
                onChange={(e) =>
                  update("budgetLimit", toIntOrZero(e.target.value))
                }
              />
              <div className="mt-1 flex justify-between text-[10px] text-nomiris-textSub">
                <span>¥2,000</span>
                <span className="font-semibold text-nomiris-brown">
                  {value.budgetLimit > 0
                    ? `¥${value.budgetLimit.toLocaleString()}`
                    : "未設定"}
                </span>
                <span>¥15,000</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cond-date" className="nm-label">
                希望日時（任意）
              </label>
              <input
                id="cond-date"
                className="nm-input"
                placeholder="例: 来週金曜の19時、5/10〜5/15のいずれか"
                value={value.desiredDate}
                onChange={(e) => update("desiredDate", e.target.value)}
              />
              <p className="mt-1 text-[11px] text-nomiris-textSub">
                提案文・メール文面に差し込まれます（任意）
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
