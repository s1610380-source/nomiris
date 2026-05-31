"use client";

/**
 * フロント側の AI 連携ラッパー。`/api/ai` を叩いて文面を書き直す。
 * 環境変数 `OPENAI_API_KEY` が未設定なら `openai_not_configured` が返り、
 * 呼び出し側で「環境変数を設定してください」と案内する。
 */

export interface AiRewriteResult {
  ok: boolean;
  text: string;
  error?: string;
}

interface AiApiResponse {
  ok: boolean;
  text?: string;
  error?: string;
}

/** 任意の日本語文面を、トーンを保ちつつ自然な日本語に書き直す */
export async function rewriteWithAI(
  originalText: string,
  tone: string,
): Promise<AiRewriteResult> {
  const system =
    "あなたは日本語の文章リライト専門家です。原文の意図・情報量・長さ・絵文字を保ちつつ、自然で読みやすい日本語に書き直してください。元のフォーマット（改行・箇条書き）は維持してください。新しい情報や事実は追加しないでください。";
  const prompt = `トーン: ${tone}\n\n原文:\n${originalText}\n\n上記を書き直した日本語の文章だけを返してください。前置きや解説は不要です。`;
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system }),
    });
    const j = (await res.json()) as AiApiResponse;
    if (!j.ok || !j.text) {
      return {
        ok: false,
        text: originalText,
        error: j.error ?? "ai_unknown_error",
      };
    }
    return { ok: true, text: j.text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, text: originalText, error: msg };
  }
}
