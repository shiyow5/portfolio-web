/// <reference types="@cloudflare/workers-types" />
import { buildSystemInstruction } from '../../src/lib/persona/persona';
import { factCardIds } from '../../src/lib/persona/factCards';
import { makeCitationGuard, type CitationGuard } from '../../src/lib/persona/citations';
import { makeNonce, wrapVisitorInput } from '../../src/lib/persona/spotlight';
import { splitSSEEvents, extractDelta } from '../../src/lib/gemini-sse';

interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  turnstileToken?: string;
}

// gemini-2.5-flash-lite: low latency/cost + implicit context caching (up to 90%
// off the static system prompt). Override per-env with GEMINI_MODEL if needed.
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const MAX_INPUT_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 1024;
const MINUTE_LIMIT = 12;
const HOUR_LIMIT = 60;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 3600;

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch {
    return false;
  }
}

async function bumpRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  if (count >= limit) {
    return { ok: false, retryAfter: windowSeconds };
  }
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return { ok: true, retryAfter: 0 };
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m): m is ChatMessage => !!m && typeof m.content === 'string')
    .slice(-20)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content.slice(0, MAX_INPUT_CHARS),
    }));
}

/**
 * Maps chat history to Gemini contents. Visitor (user) turns are fenced with the
 * request nonce (spotlighting) so the model treats them as data, not as
 * instructions; the model's own prior turns are passed through untouched.
 */
function buildGeminiContents(messages: ChatMessage[], nonce: string) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.role === 'assistant' ? m.content : wrapVisitorInput(m.content, nonce) }],
  }));
}

/**
 * Reads the Gemini SSE response body and forwards text deltas to the client as
 * line-delimited JSON chunks: {"delta": "..."}\n. Each delta passes through the
 * citation guard, which strips any [id] the model invents (boundary-safe).
 */
function relayStream(
  upstream: ReadableStream<Uint8Array>,
  guard: CitationGuard,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, text: string) => {
    if (text) controller.enqueue(encoder.encode(JSON.stringify({ delta: text }) + '\n'));
  };

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Gemini separates SSE events with CRLF; splitSSEEvents handles both
          // CRLF and LF (a plain '\n\n' split silently drops every chunk).
          const { events, rest } = splitSSEEvents(buffer);
          buffer = rest;
          for (const event of events) {
            const delta = extractDelta(event);
            if (delta) emit(controller, guard.push(delta));
          }
        }
        emit(controller, guard.flush());
        controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + '\n'));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ error: (err as Error)?.message ?? 'stream error' }) + '\n',
          ),
        );
      } finally {
        controller.close();
      }
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GEMINI_API_KEY) {
    return json(
      {
        error:
          'チャットは現在準備中です。お手数ですが画面下部の問い合わせフォームからご連絡ください。',
        code: 'not_configured',
      },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? sanitizeMessages(body.messages) : [];
  if (messages.length === 0) {
    return json({ error: 'messages is required' }, { status: 400 });
  }
  if (messages[messages.length - 1]!.role !== 'user') {
    return json({ error: 'last message must be from user' }, { status: 400 });
  }

  const ip = getClientIp(request);

  if (env.TURNSTILE_SECRET) {
    if (!body.turnstileToken) {
      return json({ error: 'turnstileToken is required' }, { status: 400 });
    }
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, ip);
    if (!ok) return json({ error: 'turnstile verification failed' }, { status: 401 });
  }

  if (env.RATE_LIMIT_KV) {
    const minute = await bumpRateLimit(
      env.RATE_LIMIT_KV,
      `ip:${ip}:m`,
      MINUTE_LIMIT,
      MINUTE_SECONDS,
    );
    if (!minute.ok) {
      return json(
        {
          error: 'すこしリクエストが早すぎるみたいです。1 分ほどおいてから、もう一度どうぞ。',
          code: 'rate_limited',
          retryAfter: minute.retryAfter,
        },
        {
          status: 429,
          headers: { 'retry-after': String(minute.retryAfter) },
        },
      );
    }
    const hour = await bumpRateLimit(env.RATE_LIMIT_KV, `ip:${ip}:h`, HOUR_LIMIT, HOUR_SECONDS);
    if (!hour.ok) {
      return json(
        {
          error:
            'たくさん試してくれてありがとうございます。1 時間ほどおいてからまたどうぞ（続きは問い合わせフォームからでもOKです）。',
          code: 'rate_limited',
          retryAfter: hour.retryAfter,
        },
        {
          status: 429,
          headers: { 'retry-after': String(hour.retryAfter) },
        },
      );
    }
  }

  // Per-request nonce fences visitor input against the system prompt (spotlighting).
  const nonce = makeNonce();

  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent` +
    `?alt=sse&key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

  // 2.5 / *-latest models can "think" by default, which adds latency and can
  // consume the output budget. A grounded factual clone doesn't need it; disable
  // it where supported (older models reject thinkingConfig).
  const supportsThinking = /2\.5|latest/.test(model);

  // The upstream call can THROW (network error, edge subrequest timeout) — not
  // just return non-ok. An unhandled throw here surfaces to the visitor as a bare
  // "HTTP 502" (Cloudflare's HTML error page, no JSON), so catch it and return a
  // friendly, parseable error the client can render.
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(nonce) }] },
        contents: buildGeminiContents(messages, nonce),
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.7,
          topP: 0.9,
          ...(supportsThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });
  } catch (err) {
    return json(
      {
        error: 'AI への接続でエラーが発生しました。少し時間をおいて再度お試しください。',
        code: 'upstream_unreachable',
        detail: ((err as Error)?.message ?? 'fetch failed').slice(0, 200),
      },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    // Gemini quota / rate limit — common on the free tier (≈20 req/day). Surface
    // a friendly, actionable message instead of a raw upstream error.
    if (upstream.status === 429) {
      const retryAfter = Number(upstream.headers.get('retry-after')) || 30;
      return json(
        {
          error:
            'AI が今アクセス集中で応答できないみたいです。少し時間をおくか、画面下部の問い合わせフォームからご連絡ください。',
          code: 'upstream_busy',
          retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(retryAfter) } },
      );
    }
    return json(
      {
        error: 'AI への接続でエラーが発生しました。少し時間をおいて再度お試しください。',
        code: 'upstream_error',
        detail: detail.slice(0, 400),
      },
      { status: 502 },
    );
  }

  return new Response(relayStream(upstream.body, makeCitationGuard(factCardIds())), {
    status: 200,
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-gemini-model': model,
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return json({
    model: env.GEMINI_MODEL || DEFAULT_MODEL,
    persona: 'shiyow clone agent v1 (grounded + cited)',
    limits: {
      maxInputChars: MAX_INPUT_CHARS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      requestsPerMinute: MINUTE_LIMIT,
      requestsPerHour: HOUR_LIMIT,
    },
  });
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
