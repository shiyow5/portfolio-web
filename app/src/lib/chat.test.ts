import { afterEach, describe, expect, it, vi } from 'vitest';
import { streamChat, type ChatMessage } from './chat';

const MESSAGES: ChatMessage[] = [{ role: 'user', content: 'hi' }];

/** Build a fake streaming Response whose body yields the given NDJSON lines. */
function streamResponse(lines: string[]): Response {
  const encoder = new TextEncoder();
  const chunks = lines.map((line) => encoder.encode(line));
  let i = 0;
  const reader = {
    read: vi.fn(async () => {
      if (i < chunks.length) return { value: chunks[i++], done: false };
      return { value: undefined, done: true };
    }),
  };
  return {
    ok: true,
    status: 200,
    body: { getReader: () => reader },
    json: async () => ({}),
  } as unknown as Response;
}

/** Run streamChat to completion, collecting deltas and the terminal outcome. */
function run(makeFetch: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(makeFetch));
  const deltas: string[] = [];
  return new Promise<{ deltas: string[]; done: boolean; error?: string }>((resolve) => {
    streamChat(MESSAGES, 'token', {
      onDelta: (delta) => deltas.push(delta),
      onDone: () => resolve({ deltas, done: true }),
      onError: (error) => resolve({ deltas, done: false, error }),
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('streamChat', () => {
  it('returns an AbortController', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => streamResponse(['{"done":true}\n'])),
    );
    const controller = streamChat(MESSAGES, undefined, {
      onDelta: () => {},
      onDone: () => {},
      onError: () => {},
    });
    expect(controller).toBeInstanceOf(AbortController);
  });

  it('forwards delta chunks then signals done', async () => {
    const result = await run(async () =>
      streamResponse(['{"delta":"Hello"}\n', '{"delta":" world"}\n', '{"done":true}\n']),
    );
    expect(result.deltas).toEqual(['Hello', ' world']);
    expect(result.done).toBe(true);
  });

  it('ignores blank and malformed lines', async () => {
    const result = await run(async () =>
      streamResponse(['\n', 'not-json\n', '{"delta":"ok"}\n', '{"done":true}\n']),
    );
    expect(result.deltas).toEqual(['ok']);
    expect(result.done).toBe(true);
  });

  it('calls onDone when the stream ends without an explicit done flag', async () => {
    const result = await run(async () => streamResponse(['{"delta":"hi"}\n']));
    expect(result.deltas).toEqual(['hi']);
    expect(result.done).toBe(true);
  });

  it('errors when the response has no body', async () => {
    const result = await run(
      async () => ({ ok: true, status: 200, body: null }) as unknown as Response,
    );
    expect(result.error).toBe('empty response body');
  });

  it('reports an error emitted inside the stream', async () => {
    const result = await run(async () => streamResponse(['{"error":"boom in stream"}\n']));
    expect(result.error).toBe('boom in stream');
  });

  it('surfaces network failures via onError', async () => {
    const result = await run(async () => {
      throw new Error('network down');
    });
    expect(result.error).toBe('network down');
  });

  it('swallows aborts without calling onError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        throw err;
      }),
    );
    const onError = vi.fn();
    const onDone = vi.fn();
    streamChat(MESSAGES, undefined, { onDelta: () => {}, onDone, onError });
    await Promise.resolve();
    await Promise.resolve();
    expect(onError).not.toHaveBeenCalled();
  });

  it('passes through the server-provided friendly message', async () => {
    const result = await run(
      async () =>
        ({
          ok: false,
          status: 429,
          json: async () => ({
            error: 'AI が今アクセス集中で応答できないみたいです。',
            retryAfter: 30,
          }),
        }) as unknown as Response,
    );
    expect(result.error).toContain('アクセス集中');
  });

  it('shows a friendly fallback on a 429 with no error body', async () => {
    const result = await run(
      async () =>
        ({
          ok: false,
          status: 429,
          json: async () => ({ retryAfter: 30 }),
        }) as unknown as Response,
    );
    expect(result.error).toMatch(/集中|時間/);
  });

  it('falls back to the HTTP status when the error body is not JSON', async () => {
    const result = await run(
      async () =>
        ({
          ok: false,
          status: 500,
          json: async () => {
            throw new Error('not json');
          },
        }) as unknown as Response,
    );
    expect(result.error).toBe('HTTP 500');
  });
});
