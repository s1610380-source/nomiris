import type { EventCondition, Restaurant, Tone } from "./types";

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function circled(index: number): string {
  return CIRCLED[index] ?? `(${index + 1})`;
}

function nomihodaiLabel(value: EventCondition["nomihodai"]): string {
  if (value === "あり") return "飲み放題あり";
  if (value === "なし") return "飲み放題なし";
  return "飲み放題は問わず";
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
  parts.push(nomihodaiLabel(condition.nomihodai));
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

function buildRestaurantBlock(r: Restaurant, index: number): string {
  const lines: string[] = [];
  const head = `${circled(index)}${r.name}${r.genre ? `（${r.genre}）` : ""}`;
  lines.push(head);
  if (r.url.trim()) lines.push(r.url.trim());
  if (r.recommendPoint.trim()) lines.push(`・${r.recommendPoint.trim()}`);
  if (r.cautionPoint.trim()) {
    const emoji = r.emoji ? r.emoji : "";
    lines.push(`・${r.cautionPoint.trim()}${emoji}`);
  } else if (r.emoji && !r.recommendPoint.trim()) {
    lines.push(r.emoji);
  }
  return lines.join("\n");
}

interface ToneTexts {
  intro: string;
  premiseLead: string;
  outro: string;
}

function getToneTexts(tone: Tone, premise: string): ToneTexts {
  if (tone === "カジュアル") {
    return {
      intro: "候補こんな感じでまとめてみた！\n見てもらえると嬉しい〜🐿️",
      premiseLead: `前提条件は、${premise}って感じ！`,
      outro: "他にも候補あるから、希望あったら気軽に教えてね〜🐿️",
    };
  }
  if (tone === "社内向け") {
    return {
      intro:
        "会食候補につきまして、以下の通り整理いたしました。\nご確認のほど、よろしくお願いいたします。",
      premiseLead: `アクセス、予算、雰囲気を踏まえて候補を選定しております。\n前提条件: ${premise}。`,
      outro:
        "他候補もございますので、ご要望や追加観点があればお知らせください。",
    };
  }
  // 丁寧
  return {
    intro:
      "下記の通り、候補案まとめました！\nご確認いただけますと幸いです。",
    premiseLead: `前提条件は、${premise}です！`,
    outro: "この他にも候補ありますので、ご要望あればお伝えください🙇‍♂️",
  };
}

export function generateProposal(
  condition: EventCondition,
  selected: Restaurant[],
): string {
  const premise = buildPremise(condition);
  const tt = getToneTexts(condition.tone, premise);

  const sections: string[] = [];
  sections.push(tt.intro);
  sections.push(tt.premiseLead);
  if (condition.title.trim()) {
    sections.push(`〜${condition.title.trim()}〜`);
  }
  selected.forEach((r, i) => {
    sections.push(buildRestaurantBlock(r, i));
  });
  sections.push(tt.outro);

  return sections.join("\n\n");
}
