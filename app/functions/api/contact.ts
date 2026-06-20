/// <reference types="@cloudflare/workers-types" />

/**
 * Contact form endpoint. Validates input, optionally checks a Turnstile token,
 * per-IP rate limits, then forwards the message to CONTACT_WEBHOOK_URL
 * (Discord / Slack / Zapier-compatible). Returns 503 until a destination is set
 * so the form degrades gracefully before the env var is configured.
 *
 * Note: the small json/ip/turnstile/rate-limit helpers mirror chat.ts on
 * purpose — they are duplicated to keep each endpoint self-contained and avoid
 * touching the working chat function.
 */

interface Env {
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_KV?: KVNamespace;
  CONTACT_WEBHOOK_URL?: string;
}

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  turnstileToken?: string;
}

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 2000;
const MINUTE_LIMIT = 3;
const HOUR_LIMIT = 10;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 3600;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || name.length > MAX_NAME) {
    return json({ error: 'お名前を入力してください（100文字以内）' }, { status: 400 });
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE) {
    return json({ error: 'メッセージを入力してください（2000文字以内）' }, { status: 400 });
  }

  const ip = getClientIp(request);

  if (env.TURNSTILE_SECRET) {
    if (!body.turnstileToken) {
      return json({ error: 'turnstileToken is required' }, { status: 400 });
    }
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, ip);
    if (!ok) return json({ error: 'bot 判定に失敗しました。再度お試しください' }, { status: 401 });
  }

  if (env.RATE_LIMIT_KV) {
    const minute = await bumpRateLimit(
      env.RATE_LIMIT_KV,
      `contact:${ip}:m`,
      MINUTE_LIMIT,
      MINUTE_SECONDS,
    );
    if (!minute.ok) {
      return json(
        {
          error: 'リクエストが多すぎます。少し待って再送してください',
          retryAfter: minute.retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(minute.retryAfter) } },
      );
    }
    const hour = await bumpRateLimit(
      env.RATE_LIMIT_KV,
      `contact:${ip}:h`,
      HOUR_LIMIT,
      HOUR_SECONDS,
    );
    if (!hour.ok) {
      return json(
        {
          error: '本日の送信上限に達しました。時間をおいて再送してください',
          retryAfter: hour.retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(hour.retryAfter) } },
      );
    }
  }

  if (!env.CONTACT_WEBHOOK_URL) {
    return json({ error: 'お問い合わせ窓口が未設定です。X からご連絡ください' }, { status: 503 });
  }

  const text = `📬 shiyow.dev へのお問い合わせ\nName: ${name}\nEmail: ${email}\n\n${message}`;
  try {
    const res = await fetch(env.CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // `content` works with Discord, `text` with Slack; structured fields for generic consumers.
      body: JSON.stringify({ content: text, text, name, email, message }),
    });
    if (!res.ok) {
      return json({ error: '送信に失敗しました。時間をおいて再度お試しください' }, { status: 502 });
    }
  } catch {
    return json({ error: '送信に失敗しました。時間をおいて再度お試しください' }, { status: 502 });
  }

  return json({ ok: true });
};
