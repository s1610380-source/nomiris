import type { EventCondition, Mode, Plan, Restaurant } from "./types";

/**
 * desiredDate を読みやすく整形する。
 * datetime-local 形式 (例: "2026-05-10T19:00") なら「5月10日（土）19:00」形式に、
 * フリーテキスト（"5/10〜5/15のいずれか" など）はそのまま返す。
 */
export function formatDesiredDate(s: string): string {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return s;
  const [, year, month, day, hour, min] = m;
  const d = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(min, 10),
  );
  if (Number.isNaN(d.getTime())) return s;
  const wd = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${parseInt(month, 10)}月${parseInt(day, 10)}日（${wd}）${hour}:${min}`;
}

/** テンプレート ID（モード × 用途別の文面） */
export type TemplateId =
  // casual / free
  | "friendLine"
  | "circleNotice"
  | "candidateShare"
  // business / pro
  | "internalEmail"
  | "managerCheck"
  | "externalEmail"
  | "entertainmentEmail"
  | "thankYouEmail"
  // date / pro
  | "dateInvite"
  | "dateCandidateLine"
  | "dateReminder"
  | "datePostThanks"
  | "dateSecondMeet";

export interface TemplateMeta {
  id: TemplateId;
  mode: Mode;
  plan: Plan;
  title: string;
  emoji: string;
  hint: string;
}

export const TEMPLATES: TemplateMeta[] = [
  // ─── casual / free ──────────────────────────────────────────
  {
    id: "friendLine",
    mode: "casual",
    plan: "free",
    title: "友達向け LINE",
    emoji: "💬",
    hint: "気軽な LINE のテンション。絵文字多め。",
  },
  {
    id: "circleNotice",
    mode: "casual",
    plan: "free",
    title: "サークル向け連絡文",
    emoji: "📣",
    hint: "サークル / 同期グループへのフランクな連絡文。",
  },
  {
    id: "candidateShare",
    mode: "casual",
    plan: "free",
    title: "候補店共有文（短め）",
    emoji: "📋",
    hint: "短く要点だけ伝える共有文。",
  },

  // ─── business / pro ─────────────────────────────────────────
  {
    id: "internalEmail",
    mode: "business",
    plan: "pro",
    title: "社内提案メール",
    emoji: "🏢",
    hint: "「お疲れ様です」から始まる社内向けメール。",
  },
  {
    id: "managerCheck",
    mode: "business",
    plan: "pro",
    title: "上司確認メール",
    emoji: "👔",
    hint: "上司宛て、敬語強めの確認依頼。",
  },
  {
    id: "externalEmail",
    mode: "business",
    plan: "pro",
    title: "社外共有メール",
    emoji: "📨",
    hint: "「お世話になっております」からの社外メール。",
  },
  {
    id: "entertainmentEmail",
    mode: "business",
    plan: "pro",
    title: "接待候補共有メール",
    emoji: "🎩",
    hint: "接待用、敬語と配慮を強めた候補共有メール。",
  },
  {
    id: "thankYouEmail",
    mode: "business",
    plan: "pro",
    title: "翌日のお礼メール",
    emoji: "🙏",
    hint: "会食の翌日に送るお礼メール。",
  },

  // ─── date / pro ─────────────────────────────────────────────
  {
    id: "dateInvite",
    mode: "date",
    plan: "pro",
    title: "初デートの誘い文",
    emoji: "💌",
    hint: "「よかったら今度…」の誘い文。",
  },
  {
    id: "dateCandidateLine",
    mode: "date",
    plan: "pro",
    title: "候補店共有 LINE",
    emoji: "📍",
    hint: "デート相手にお店の候補を共有する LINE。",
  },
  {
    id: "dateReminder",
    mode: "date",
    plan: "pro",
    title: "デート前リマインド LINE",
    emoji: "⏰",
    hint: "当日朝に送る軽めのリマインド。",
  },
  {
    id: "datePostThanks",
    mode: "date",
    plan: "pro",
    title: "デート後のお礼 LINE",
    emoji: "💕",
    hint: "「今日はありがとう！」のお礼 LINE。",
  },
  {
    id: "dateSecondMeet",
    mode: "date",
    plan: "pro",
    title: "2回目につなげる LINE",
    emoji: "✨",
    hint: "「この前話してた…」と次のデートにつなぐ LINE。",
  },
];

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function circled(i: number): string {
  return CIRCLED[i] ?? `(${i + 1})`;
}

function hasUrl(url: string): boolean {
  const v = (url ?? "").trim();
  return !!v && v !== "#placeholder" && !v.startsWith("#");
}

function joinNonEmpty(parts: (string | undefined | null)[], sep = "、"): string {
  return parts
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 0)
    .join(sep);
}

function premiseLine(condition: EventCondition): string {
  const parts: string[] = [];
  if (condition.area) parts.push(`エリア: ${condition.area}`);
  if (condition.nearestStation)
    parts.push(`最寄り駅: ${condition.nearestStation}`);
  if (condition.peopleCount > 0) parts.push(`人数: ${condition.peopleCount}名`);
  if (condition.budgetLimit > 0)
    parts.push(`予算: ${condition.budgetLimit.toLocaleString()}円/人以内`);
  if (condition.desiredDate)
    parts.push(`希望日時: ${formatDesiredDate(condition.desiredDate)}`);
  if (condition.nomihodai !== "どちらでも")
    parts.push(`飲み放題: ${condition.nomihodai}`);
  if (condition.privateRoom !== "どちらでも")
    parts.push(`個室: ${condition.privateRoom}`);
  return parts.join(" / ");
}

function shopShort(r: Restaurant): string {
  const bits: string[] = [r.name];
  if (r.genre) bits[0] = `${r.name}（${r.genre}）`;
  return bits.join("");
}

function shopBudgetLine(r: Restaurant): string {
  if (r.budget) return `予算: ${r.budget}`;
  if (r.budgetMax > 0) return `予算: 〜${r.budgetMax.toLocaleString()}円/人`;
  return "";
}

/** カジュアル系のお店ブロック（絵文字多め） */
function casualShopBlock(r: Restaurant, i: number): string {
  const lines: string[] = [];
  lines.push(`${circled(i)} ${r.emoji || "🍽️"} ${shopShort(r)}`);
  if (hasUrl(r.url)) lines.push(`  ${r.url.trim()}`);
  const meta = joinNonEmpty(
    [
      r.area && `📍${r.area}`,
      r.walkingMinutes > 0 ? `徒歩${r.walkingMinutes}分` : "",
      shopBudgetLine(r),
      r.hasNomihodai ? "飲み放題◎" : "",
      r.hasPrivateRoom ? "個室◎" : "",
    ],
    " / ",
  );
  if (meta) lines.push(`  ${meta}`);
  if (r.recommendPoint) lines.push(`  ✨ ${r.recommendPoint}`);
  if (r.cautionPoint) lines.push(`  ⚠️ ${r.cautionPoint}`);
  return lines.join("\n");
}

/** ビジネス系のお店ブロック（敬語・客観表現） */
function businessShopBlock(r: Restaurant, i: number): string {
  const lines: string[] = [];
  lines.push(`${circled(i)} ${r.name}${r.genre ? `（${r.genre}）` : ""}`);
  if (hasUrl(r.url)) lines.push(`  URL: ${r.url.trim()}`);
  const meta = joinNonEmpty(
    [
      r.area && `エリア: ${r.area}`,
      r.walkingMinutes > 0 ? `徒歩${r.walkingMinutes}分` : "",
      shopBudgetLine(r),
      r.hasNomihodai ? "飲み放題あり" : "",
      r.hasPrivateRoom ? "個室あり" : "",
    ],
    " / ",
  );
  if (meta) lines.push(`  ${meta}`);
  if (r.recommendPoint) lines.push(`  ・${r.recommendPoint}`);
  if (r.cautionPoint) lines.push(`  ・留意点: ${r.cautionPoint}`);
  return lines.join("\n");
}

/** デート系のお店ブロック（やわらかめ） */
function dateShopBlock(r: Restaurant, i: number): string {
  const lines: string[] = [];
  lines.push(`${circled(i)} ${r.emoji || "🍽️"} ${shopShort(r)}`);
  if (hasUrl(r.url)) lines.push(`  ${r.url.trim()}`);
  const meta = joinNonEmpty(
    [
      r.area && `📍${r.area}`,
      r.walkingMinutes > 0 ? `徒歩${r.walkingMinutes}分` : "",
      shopBudgetLine(r),
      r.hasPrivateRoom ? "個室あり" : "",
    ],
    " / ",
  );
  if (meta) lines.push(`  ${meta}`);
  if (r.recommendPoint) lines.push(`  💭 ${r.recommendPoint}`);
  return lines.join("\n");
}

// ─── 個別テンプレート ───────────────────────────────────────────

function tplFriendLine(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => casualShopBlock(r, i)).join("\n\n");
  const top = sel[0];
  const reco = top
    ? `個人的には ${top.emoji || ""}${top.name} が一番よさそう！`
    : "";
  return [
    `${c.area || "エリア"}の候補こんな感じです！🍻`,
    c.desiredDate
      ? `日程は ${formatDesiredDate(c.desiredDate)} あたりで考えてます。`
      : "",
    blocks,
    reco,
    "気になるとこあったら教えて〜！🐿️",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function tplCircleNotice(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => casualShopBlock(r, i)).join("\n\n");
  return [
    `お疲れ〜！${c.scene || "飲み会"}の候補まとめてみたよ📣`,
    `エリア: ${c.area || "未定"}${c.desiredDate ? ` / 希望日時: ${formatDesiredDate(c.desiredDate)}` : ""}${c.peopleCount > 0 ? ` / 人数: ${c.peopleCount}名想定` : ""}`,
    blocks,
    "投票・希望あったらこのスレで返信お願い〜！🐿️",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function tplCandidateShare(c: EventCondition, sel: Restaurant[]): string {
  const lines = sel.map(
    (r, i) =>
      `${circled(i)} ${r.name}${r.genre ? `（${r.genre}）` : ""}${
        r.budget ? ` / ${r.budget}` : ""
      }${hasUrl(r.url) ? `\n${r.url.trim()}` : ""}`,
  );
  return [
    `${c.area || ""}候補メモ📋`,
    lines.join("\n\n"),
    "気になるのあれば教えてください🐿️",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function tplInternalEmail(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => businessShopBlock(r, i)).join("\n\n");
  return [
    `件名: ${c.scene || "会食"}候補のご共有`,
    "",
    "お疲れ様です。",
    `来週の${c.scene || "会食"}候補について、以下の通り整理いたしましたのでご共有いたします。`,
    "",
    "【前提条件】",
    premiseLine(c) || "（特になし）",
    "",
    "【候補店】",
    blocks,
    "",
    "ご都合・ご希望ございましたら、お知らせいただけますと幸いです。",
    "よろしくお願いいたします。",
  ].join("\n");
}

function tplManagerCheck(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => businessShopBlock(r, i)).join("\n\n");
  return [
    `件名: 【ご確認】${c.scene || "会食"}の候補店について`,
    "",
    "お疲れ様です。",
    `${c.scene || "会食"}の候補店を以下の通りまとめましたので、ご確認をお願いできますでしょうか。`,
    "",
    "【前提条件】",
    premiseLine(c) || "（特になし）",
    c.participants ? `参加メンバー: ${c.participants}` : "",
    "",
    "【候補店】",
    blocks,
    "",
    "上記の中で問題なさそうなものがございましたら、ご指示いただけますと幸いです。",
    "もし他にご希望の条件等あれば、修正のうえ再度ご共有いたします。",
    "",
    "お忙しいところ恐れ入りますが、よろしくお願いいたします。",
  ]
    .filter(Boolean)
    .join("\n");
}

function tplExternalEmail(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => businessShopBlock(r, i)).join("\n\n");
  return [
    `件名: ${c.scene || "会食"}候補のご案内`,
    "",
    "お世話になっております。",
    `先日ご相談いたしました${c.scene || "会食"}につきまして、候補店を以下の通りまとめましたのでご案内申し上げます。`,
    "",
    "【ご提案条件】",
    premiseLine(c) || "（特になし）",
    "",
    "【候補店】",
    blocks,
    "",
    "ご都合のよろしいお店・お日にちがございましたら、お手数ですがご教示いただけますと幸いです。",
    "ご検討のほど、何卒よろしくお願い申し上げます。",
  ].join("\n");
}

function tplEntertainmentEmail(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => businessShopBlock(r, i)).join("\n\n");
  return [
    `件名: ${c.scene || "接待"}候補店のご共有`,
    "",
    "お世話になっております。",
    `この度は${c.scene || "ご会食"}の機会を頂戴し、誠にありがとうございます。`,
    "ご来場いただく皆様に失礼のないよう、個室・アクセス・予算の観点から以下の候補をご用意いたしました。",
    "",
    "【前提条件】",
    premiseLine(c) || "（特になし）",
    "",
    "【候補店】",
    blocks,
    "",
    "ご希望・ご要望ございましたら、遠慮なくお申し付けくださいませ。",
    "何卒よろしくお願い申し上げます。",
  ].join("\n");
}

function tplThankYouEmail(c: EventCondition, sel: Restaurant[]): string {
  const top = sel[0];
  const ref = top ? `${top.name}` : "ご一緒したお店";
  return [
    `件名: 昨日はありがとうございました`,
    "",
    "お世話になっております。",
    "昨日はお忙しい中、貴重なお時間をいただき誠にありがとうございました。",
    `${ref}でのお話、大変有意義な時間となり、心より感謝申し上げます。`,
    c.participants
      ? `${c.participants}の皆様にもよろしくお伝えくださいませ。`
      : "",
    "",
    "今後とも変わらぬご指導・ご鞭撻のほど、何卒よろしくお願い申し上げます。",
    "取り急ぎ、お礼まで申し上げます。",
  ]
    .filter(Boolean)
    .join("\n");
}

function tplDateInvite(c: EventCondition, sel: Restaurant[]): string {
  const top = sel[0];
  const area = c.area || "良さそうなところ";
  const hint = top
    ? `${top.emoji || ""}${top.name}（${top.genre || "気になるお店"}）` +
      (top.recommendPoint ? `、${top.recommendPoint}らしくて` : "") +
      "気になってて。"
    : "";
  return [
    `お疲れ様！`,
    `よかったら今度、${area}でごはん行かない？✨`,
    hint,
    c.desiredDate
      ? `${formatDesiredDate(c.desiredDate)} あたりで都合つきそうな日あったら教えて！`
      : "もし都合つきそうな日あったら、いくつか候補もらえると嬉しいです。",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function tplDateCandidateLine(c: EventCondition, sel: Restaurant[]): string {
  const blocks = sel.map((r, i) => dateShopBlock(r, i)).join("\n\n");
  const top = sel[0];
  return [
    `お店いくつか見てみました！${c.area ? `（${c.area}あたり）` : ""}📍`,
    blocks,
    top
      ? `個人的には ${top.emoji || ""}${top.name} が良さそうかなと思ってます💭`
      : "",
    "どれが良さそうか教えてもらえると嬉しいです🐿️",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function tplDateReminder(c: EventCondition, sel: Restaurant[]): string {
  const top = sel[0];
  return [
    "おはよ〜☀️",
    `今日${c.desiredDate ? ` ${formatDesiredDate(c.desiredDate)}` : ""} よろしくお願いします！`,
    top
      ? `お店は ${top.emoji || ""}${top.name}${top.area ? `（${top.area}）` : ""} で取ってあります！`
      : "",
    "気をつけて来てね〜🐿️",
  ]
    .filter(Boolean)
    .join("\n");
}

function tplDatePostThanks(c: EventCondition, sel: Restaurant[]): string {
  const top = sel[0];
  return [
    "今日はありがとう！💕",
    top
      ? `${top.name}${top.recommendPoint ? `、${top.recommendPoint}でほんと良かった〜` : "、ほんと良かった〜"}！`
      : "今日のお店すごく良かった〜！",
    "話してても全然飽きなくて、すごく楽しかったです✨",
    "また近いうちにごはん行けたら嬉しいです〜！🐿️",
    "ゆっくり休んでね💭",
  ]
    .filter(Boolean)
    .join("\n");
  void c;
}

function tplDateSecondMeet(c: EventCondition, sel: Restaurant[]): string {
  const top = sel[0];
  const area = c.area || "あのへん";
  return [
    "この前話してた、行ってみたいって言ってたお店、",
    top
      ? `${area}の ${top.emoji || ""}${top.name}${top.genre ? `（${top.genre}）` : ""} 良さそうだったので、もしよかったら今度一緒に行かない？✨`
      : `${area}でいいお店見つけたから、もしよかったら今度一緒に行かない？✨`,
    c.desiredDate
      ? `${formatDesiredDate(c.desiredDate)} あたり、もし都合つく日あったら教えて〜🐿️`
      : "都合つきそうな日あったら教えて〜🐿️",
  ].join("\n\n");
}

const GENERATORS: Record<
  TemplateId,
  (c: EventCondition, sel: Restaurant[]) => string
> = {
  friendLine: tplFriendLine,
  circleNotice: tplCircleNotice,
  candidateShare: tplCandidateShare,
  internalEmail: tplInternalEmail,
  managerCheck: tplManagerCheck,
  externalEmail: tplExternalEmail,
  entertainmentEmail: tplEntertainmentEmail,
  thankYouEmail: tplThankYouEmail,
  dateInvite: tplDateInvite,
  dateCandidateLine: tplDateCandidateLine,
  dateReminder: tplDateReminder,
  datePostThanks: tplDatePostThanks,
  dateSecondMeet: tplDateSecondMeet,
};

/** テンプレ ID と条件・選択中のお店から文面を生成 */
export function generateText(
  id: TemplateId,
  condition: EventCondition,
  selected: Restaurant[],
): string {
  const fn = GENERATORS[id];
  if (!fn) return "";
  return fn(condition, selected);
}

/** モードに対応するテンプレを返す */
export function templatesForMode(mode: Mode): TemplateMeta[] {
  return TEMPLATES.filter((t) => t.mode === mode);
}
