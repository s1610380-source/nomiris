/**
 * Google Calendar の「予定追加」ページの URL を生成する。
 * 認証・API キー不要。ユーザーは新しいタブで開いた Google Calendar の編集画面で
 * 確認 → 保存 することで、自分のカレンダーに予定を追加できる。
 *
 * 参考: https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */

export interface BuildCalendarUrlOptions {
  title: string;
  details: string;
  location?: string;
  start?: Date;
  end?: Date;
}

/** Date → "20260601T100000Z" 形式 */
function toBasicIso(d: Date): string {
  // toISOString() → "2026-06-01T10:00:00.000Z"
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildCalendarUrl(opts: BuildCalendarUrlOptions): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
  });
  if (opts.location && opts.location.trim()) {
    params.set("location", opts.location.trim());
  }
  if (opts.start && opts.end) {
    params.set("dates", `${toBasicIso(opts.start)}/${toBasicIso(opts.end)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * "2026-06-01 19:00" "2026/6/1" "6/1 19:00" "明日 19:00" など、
 * 自由入力された日時テキストから Date を抽出する。失敗時は null。
 * 雑な実装で良いので、まずは ISO / 数字スラッシュ＋時刻 だけ対応。
 */
export function tryParseDesiredDate(input: string): Date | null {
  const s = (input || "").trim();
  if (!s) return null;
  // 1) そのまま Date が parseできるか
  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1;
  // 2) "2026/6/1 19:00" 系
  const m = s.match(
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})日?(?:[\sT](\d{1,2})[:時](\d{1,2}))?/,
  );
  if (m) {
    const [, y, mo, da, hh, mm] = m;
    const yy = parseInt(y, 10);
    const moo = parseInt(mo, 10) - 1;
    const dd = parseInt(da, 10);
    const h = hh ? parseInt(hh, 10) : 19;
    const mi = mm ? parseInt(mm, 10) : 0;
    const d = new Date(yy, moo, dd, h, mi, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}
