import { NextResponse } from "next/server";

/**
 * OpenAI Chat Completions プロキシ。
 * 環境変数 OPENAI_API_KEY が設定されていれば本物の LLM を呼ぶ。
 * 未設定なら openai_not_configured を返し、フロントは既存テンプレ（mock）にフォールバックする。
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

interface RequestBody {
  prompt?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AiResponseBody {
  ok: boolean;
  text?: string;
  error?: string;
}

interface OpenAiChoiceMessage {
  role: string;
  content: string;
}

interface OpenAiChoice {
  message?: OpenAiChoiceMessage;
}

interface OpenAiChatResponse {
  choices?: OpenAiChoice[];
  error?: { message?: string; type?: string };
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    const r: AiResponseBody = { ok: false, error: "invalid_json" };
    return NextResponse.json(r, { status: 200 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    const r: AiResponseBody = { ok: false, error: "empty_prompt" };
    return NextResponse.json(r, { status: 200 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const r: AiResponseBody = { ok: false, error: "openai_not_configured" };
    return NextResponse.json(r, { status: 200 });
  }

  const system =
    (body.system ?? "").trim() ||
    "あなたは日本語の文章リライト専門家です。";
  const temperature =
    typeof body.temperature === "number" && Number.isFinite(body.temperature)
      ? body.temperature
      : 0.7;
  const maxTokens =
    typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens)
      ? body.maxTokens
      : 800;

  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const r: AiResponseBody = {
        ok: false,
        error: `openai_http_${res.status}${txt ? `:${txt.slice(0, 200)}` : ""}`,
      };
      return NextResponse.json(r, { status: 200 });
    }

    const json = (await res.json()) as OpenAiChatResponse;
    if (json.error) {
      const r: AiResponseBody = {
        ok: false,
        error: `openai_api_error:${json.error.message ?? "unknown"}`,
      };
      return NextResponse.json(r, { status: 200 });
    }
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      const r: AiResponseBody = { ok: false, error: "openai_empty_response" };
      return NextResponse.json(r, { status: 200 });
    }
    const r: AiResponseBody = { ok: true, text };
    return NextResponse.json(r, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const r: AiResponseBody = { ok: false, error: `fetch_failed:${msg}` };
    return NextResponse.json(r, { status: 200 });
  }
}
