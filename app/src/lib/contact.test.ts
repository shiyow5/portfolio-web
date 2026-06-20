import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from './contact';

afterEach(() => {
  vi.unstubAllGlobals();
});

const PAYLOAD = { name: 'Taro', email: 'taro@example.com', message: 'hello' };

describe('submitContact', () => {
  it('returns ok on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) })),
    );
    expect(await submitContact(PAYLOAD)).toEqual({ ok: true });
  });

  it('surfaces the server error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 400, json: async () => ({ error: 'bad input' }) })),
    );
    const result = await submitContact(PAYLOAD);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('bad input');
  });

  it('handles network failure gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    const result = await submitContact(PAYLOAD);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ネットワーク/);
  });

  it('includes the turnstile token in the request body when provided', async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      } as unknown as Response),
    );
    vi.stubGlobal('fetch', fetchMock);
    await submitContact(PAYLOAD, 'tok-123');
    const init = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(init?.body))).toMatchObject({ turnstileToken: 'tok-123' });
  });
});
