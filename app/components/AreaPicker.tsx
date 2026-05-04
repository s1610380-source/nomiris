"use client";

import { useEffect, useRef, useState } from "react";

interface LargeAreaItem {
  code: string;
  name: string;
}
interface MiddleAreaItem {
  code: string;
  name: string;
  large_area: { code: string; name: string };
}
interface SmallAreaItem {
  code: string;
  name: string;
  middle_area: { code: string; name: string };
}

interface AreaApiResult<T> {
  ok: boolean;
  areas: T[];
  error?: string;
}

export interface AreaPickerValue {
  area: string;
  areaCode: string;
}

interface AreaPickerProps {
  value: AreaPickerValue;
  onChange: (next: AreaPickerValue) => void;
}

/**
 * 大エリア → 中エリア → 小エリア のカスケード select。
 * 小は任意（中まででも OK）。
 * マウント時に大を fetch、選択ごとに次の階層を fetch する。
 */
export default function AreaPicker({ value, onChange }: AreaPickerProps) {
  const [largeList, setLargeList] = useState<LargeAreaItem[]>([]);
  const [middleList, setMiddleList] = useState<MiddleAreaItem[]>([]);
  const [smallList, setSmallList] = useState<SmallAreaItem[]>([]);

  const [largeCode, setLargeCode] = useState<string>("");
  const [middleCode, setMiddleCode] = useState<string>("");
  const [smallCode, setSmallCode] = useState<string>("");

  const [loadingLarge, setLoadingLarge] = useState(false);
  const [loadingMiddle, setLoadingMiddle] = useState(false);
  const [loadingSmall, setLoadingSmall] = useState(false);
  const [largeError, setLargeError] = useState<string | null>(null);

  // value 変更を呼び出し元へ通知するための最新ハンドラ
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 初回: 大エリア取得
  useEffect(() => {
    let cancelled = false;
    setLoadingLarge(true);
    setLargeError(null);
    fetch("/api/areas/large", { method: "GET" })
      .then((r) => r.json() as Promise<AreaApiResult<LargeAreaItem>>)
      .then((j) => {
        if (cancelled) return;
        if (!j.ok || j.areas.length === 0) {
          setLargeError(j.error ?? "no_data");
          setLargeList([]);
          return;
        }
        setLargeList(j.areas);
        // 既定: 関東（Z011）→ 無ければ最初
        const kanto = j.areas.find((a) => a.code === "Z011");
        const initial = kanto ?? j.areas[0];
        setLargeCode(initial.code);
      })
      .catch((e) => {
        if (cancelled) return;
        setLargeError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoadingLarge(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // largeCode 変化 → middle 取得
  useEffect(() => {
    if (!largeCode) return;
    let cancelled = false;
    setLoadingMiddle(true);
    setMiddleList([]);
    setSmallList([]);
    setMiddleCode("");
    setSmallCode("");
    fetch(`/api/areas/middle?large=${encodeURIComponent(largeCode)}`, {
      method: "GET",
    })
      .then((r) => r.json() as Promise<AreaApiResult<MiddleAreaItem>>)
      .then((j) => {
        if (cancelled) return;
        if (!j.ok) {
          setMiddleList([]);
          return;
        }
        setMiddleList(j.areas);
      })
      .catch(() => {
        if (!cancelled) setMiddleList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMiddle(false);
      });
    return () => {
      cancelled = true;
    };
  }, [largeCode]);

  // middleCode 変化 → small 取得 + 上位への通知
  useEffect(() => {
    if (!middleCode) {
      setSmallList([]);
      setSmallCode("");
      return;
    }
    let cancelled = false;
    setLoadingSmall(true);
    setSmallList([]);
    setSmallCode("");

    // 中エリアを暫定値として通知（小が選ばれるまでは中を採用）
    const middle = middleList.find((m) => m.code === middleCode);
    if (middle) {
      onChangeRef.current({ area: middle.name, areaCode: middle.code });
    }

    fetch(`/api/areas/small?middle=${encodeURIComponent(middleCode)}`, {
      method: "GET",
    })
      .then((r) => r.json() as Promise<AreaApiResult<SmallAreaItem>>)
      .then((j) => {
        if (cancelled) return;
        if (!j.ok) {
          setSmallList([]);
          return;
        }
        setSmallList(j.areas);
      })
      .catch(() => {
        if (!cancelled) setSmallList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSmall(false);
      });
    return () => {
      cancelled = true;
    };
    // middleList をデフォルトの依存に入れると無限ループ気味になるので除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [middleCode]);

  // smallCode 変化 → 上位通知（小を採用）
  useEffect(() => {
    if (!smallCode) return;
    const s = smallList.find((x) => x.code === smallCode);
    if (s) {
      onChangeRef.current({ area: s.name, areaCode: s.code });
    }
  }, [smallCode, smallList]);

  const isInitializing = loadingLarge && largeList.length === 0;

  if (largeError && largeList.length === 0 && !loadingLarge) {
    return (
      <div className="rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-xs text-amber-900">
        マスタ取得に失敗しました（{largeError}）。「✏️ 自由入力」に切り替えてください。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {value.area && value.areaCode && (
        <div className="text-[11px] text-nomiris-textSub">
          選択中：
          <span className="ml-1 inline-flex items-center rounded-full bg-nomiris-orange/10 border border-nomiris-orange/30 px-2 py-0.5 font-bold text-nomiris-orangeDark">
            📍 {value.area}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label htmlFor="area-large" className="sr-only">
            大エリア
          </label>
          <select
            id="area-large"
            className="nm-input"
            value={largeCode}
            onChange={(e) => setLargeCode(e.target.value)}
            disabled={isInitializing || largeList.length === 0}
          >
            {isInitializing && <option value="">読み込み中…</option>}
            {largeList.map((a) => (
              <option key={a.code} value={a.code}>
                🌏 {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="area-middle" className="sr-only">
            中エリア
          </label>
          <select
            id="area-middle"
            className="nm-input"
            value={middleCode}
            onChange={(e) => setMiddleCode(e.target.value)}
            disabled={loadingMiddle || middleList.length === 0}
          >
            {loadingMiddle && <option value="">読み込み中…</option>}
            {!loadingMiddle && (
              <option value="">— 中エリアを選ぶ —</option>
            )}
            {middleList.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="area-small" className="sr-only">
          小エリア
        </label>
        <select
          id="area-small"
          className="nm-input"
          value={smallCode}
          onChange={(e) => setSmallCode(e.target.value)}
          disabled={!middleCode || loadingSmall || smallList.length === 0}
        >
          {!middleCode && <option value="">中エリアを選んでください</option>}
          {middleCode && loadingSmall && <option value="">読み込み中…</option>}
          {middleCode && !loadingSmall && smallList.length === 0 && (
            <option value="">小エリアなし（中エリアで検索）</option>
          )}
          {middleCode && !loadingSmall && smallList.length > 0 && (
            <option value="">— 小エリアを選ぶ（任意） —</option>
          )}
          {smallList.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-nomiris-textSub">
          小エリアまで選ぶとお店検索の精度が上がります（任意）
        </p>
      </div>
    </div>
  );
}
