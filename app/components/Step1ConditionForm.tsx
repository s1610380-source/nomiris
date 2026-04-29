"use client";

import { useState } from "react";
import type {
  Area,
  EventCondition,
  Scene,
  YesNoEither,
} from "../lib/types";
import { AREAS, SCENES } from "../lib/mockData";

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

  const update = <K extends keyof EventCondition>(
    key: K,
    val: EventCondition[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-5">
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
                エリア
              </label>
              <select
                id="cond-area"
                className="nm-input"
                value={value.area}
                onChange={(e) => update("area", e.target.value as Area)}
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cond-scene" className="nm-label">
                用途
              </label>
              <select
                id="cond-scene"
                className="nm-input"
                value={value.scene}
                onChange={(e) => update("scene", e.target.value as Scene)}
              >
                {SCENES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                    雰囲気
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
