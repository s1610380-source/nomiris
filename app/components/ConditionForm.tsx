"use client";

import { useState } from "react";
import type { EventCondition, Tone, YesNoEither } from "../lib/types";

const TONES: Tone[] = ["カジュアル", "丁寧", "社内向け"];
const YES_NO_EITHER: YesNoEither[] = ["あり", "なし", "どちらでも"];

interface Props {
  value: EventCondition;
  onChange: (next: EventCondition) => void;
}

function toIntOrZero(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : 0;
}

export default function ConditionForm({ value, onChange }: Props) {
  const [showDetail, setShowDetail] = useState(false);

  const update = <K extends keyof EventCondition>(
    key: K,
    val: EventCondition[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="cond-title" className="nm-label">
            タイトル
          </label>
          <input
            id="cond-title"
            className="nm-input"
            placeholder="例: 新宿1軒目候補案"
            value={value.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cond-area" className="nm-label">
            エリア
          </label>
          <input
            id="cond-area"
            className="nm-input"
            placeholder="例: 新宿"
            value={value.area}
            onChange={(e) => update("area", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cond-scene" className="nm-label">
            用途
          </label>
          <input
            id="cond-scene"
            className="nm-input"
            placeholder="例: 会社飲み / 接待 / 同期会"
            value={value.scene}
            onChange={(e) => update("scene", e.target.value)}
          />
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
            onChange={(e) => update("peopleCount", toIntOrZero(e.target.value))}
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
            onChange={(e) => update("budgetLimit", toIntOrZero(e.target.value))}
          />
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
                  value={value.walkingMinutes === 0 ? "" : value.walkingMinutes}
                  onChange={(e) =>
                    update("walkingMinutes", toIntOrZero(e.target.value))
                  }
                />
              </div>
              <div>
                <label htmlFor="cond-tone" className="nm-label">
                  文体（トーン）
                </label>
                <select
                  id="cond-tone"
                  className="nm-input"
                  value={value.tone}
                  onChange={(e) => update("tone", e.target.value as Tone)}
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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
            </div>
            <div>
              <label htmlFor="cond-priorities" className="nm-label">
                重視すること
              </label>
              <textarea
                id="cond-priorities"
                className="nm-textarea"
                placeholder="例: アクセス、コスパ、会話しやすさ"
                value={value.priorities}
                onChange={(e) => update("priorities", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cond-avoid" className="nm-label">
                避けたいこと
              </label>
              <textarea
                id="cond-avoid"
                className="nm-textarea"
                placeholder="例: うるさすぎる、高すぎる、駅から遠い"
                value={value.avoidPoints}
                onChange={(e) => update("avoidPoints", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
