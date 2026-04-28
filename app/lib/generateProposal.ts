import type { EventCondition, Restaurant } from "./types";

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function circled(index: number): string {
  return CIRCLED[index] ?? `(${index + 1})`;
}

function nomihodaiLabel(value: EventCondition["nomihodai"]): string {
  if (value === "あり") return "飲み放題あり";
  if (value === "なし") return "飲み放題なし";
  return "飲み放題は問わず";
}

function hasUrl(url: string): boolean {
  const v = url.trim();
  return !!v && v !== "#placeholder" && !v.startsWith("#");
}

function buildPremise(condition: EventCondition): string {
  const parts: string[] = [];
  if (condition.area) {
    if (condition.walkingMinutes > 0) {
      parts.push(`${condition.area}駅から徒歩${condition.walkingMinutes}分以内`);
    } else {
      parts.push(`${condition.area}エリア`);
    }
  } else if (condition.walkingMinutes > 0) {
    parts.push(`駅から徒歩${condition.walkingMinutes}分以内`);
  }
  if (condition.nomihodai !== "どちらでも") {
    parts.push(nomihodaiLabel(condition.nomihodai));
  }
  if (condition.budgetLimit > 0) {
    parts.push(`${condition.budgetLimit.toLocaleString()}円/人以内`);
  }
  if (condition.scene) {
    parts.push(`${condition.scene}でも使いやすく`);
  }
  if (condition.atmosphere) {
    parts.push(`${condition.atmosphere}雰囲気のお店`);
  }
  return parts.join("、");
}

type ToneKind = "business" | "friend" | "couple";

function buildRestaurantBlock(
  r: Restaurant,
  index: number,
  tone: ToneKind,
): string {
  const lines: string[] = [];
  const head = `${circled(index)}${r.name}${r.genre ? `（${r.genre}）` : ""}`;
  lines.push(head);
  if (hasUrl(r.url)) lines.push(r.url.trim());

  if (r.recommendPoint.trim()) {
    if (tone === "friend") {
      lines.push(`・${r.recommendPoint.trim()} ✨`);
    } else if (tone === "couple") {
      lines.push(`・${r.recommendPoint.trim()} 💭`);
    } else {
      lines.push(`・${r.recommendPoint.trim()}`);
    }
  }

  if (r.cautionPoint.trim()) {
    if (tone === "friend") {
      lines.push(`・${r.cautionPoint.trim()} ${r.emoji || ""}`.trim());
    } else if (tone === "couple") {
      lines.push(`・ちょい気になるのは: ${r.cautionPoint.trim()}`);
    } else {
      lines.push(`・${r.cautionPoint.trim()}`);
    }
  } else if (r.emoji && tone === "friend" && !r.recommendPoint.trim()) {
    lines.push(r.emoji);
  }

  return lines.join("\n");
}

interface ToneTexts {
  intro: string;
  premiseLead: string;
  outro: string;
}

function getToneTexts(tone: ToneKind, condition: EventCondition): ToneTexts {
  const premise = buildPremise(condition);
  const area = condition.area || "このエリア";

  if (tone === "business") {
    return {
      intro: "会食候補につきまして、以下の通り整理いたしました。",
      premiseLead: `アクセス・予算・雰囲気を踏まえ候補を選定しております。\n前提条件: ${premise}。`,
      outro: "ご検討のほど、よろしくお願いいたします。",
    };
  }
  if (tone === "friend") {
    return {
      intro: `${area}の候補こんな感じでまとめてみた！🍻`,
      premiseLead: `条件はざっくり、${premise}って感じ！`,
      outro: "気になるとこあったら教えて〜！🐿️",
    };
  }
  // couple
  return {
    intro: `${area}でいいお店探してみたよ💕`,
    premiseLead: `${premise}、こんな感じで気になってる🐿️`,
    outro: "行きたいとこあったら教えてね🐿️",
  };
}

function generateForTone(
  condition: EventCondition,
  selected: Restaurant[],
  tone: ToneKind,
): string {
  const tt = getToneTexts(tone, condition);
  const sections: string[] = [];
  sections.push(tt.intro);
  sections.push(tt.premiseLead);
  if (condition.title.trim()) {
    sections.push(`〜${condition.title.trim()}〜`);
  }
  selected.forEach((r, i) => {
    sections.push(buildRestaurantBlock(r, i, tone));
  });
  sections.push(tt.outro);
  return sections.join("\n\n");
}

export function generateAllProposals(
  condition: EventCondition,
  selected: Restaurant[],
): { business: string; friend: string; couple: string } {
  return {
    business: generateForTone(condition, selected, "business"),
    friend: generateForTone(condition, selected, "friend"),
    couple: generateForTone(condition, selected, "couple"),
  };
}
