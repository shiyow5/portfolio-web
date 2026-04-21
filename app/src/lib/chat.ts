export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

const CHAT_ENDPOINT = '/api/chat';

/**
 * Opens a POST to /api/chat, parses line-delimited JSON chunks, and forwards
 * `{delta: "..."}` payloads to the caller. Returns an AbortController that
 * can be used to cancel an in-flight stream.
 */
export function streamChat(
  messages: ChatMessage[],
  turnstileToken: string | undefined,
  callbacks: StreamCallbacks,
): AbortController {
  const controller = new AbortController();

  (async () => {
    let response: Response;
    try {
      response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, turnstileToken }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        callbacks.onError((err as Error).message ?? 'network error');
      }
      return;
    }

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const parsed = (await response.json()) as { error?: string; retryAfter?: number };
        if (parsed.error) detail = parsed.error;
        if (response.status === 429 && parsed.retryAfter) {
          detail = `Rate limited — ${parsed.retryAfter}s 後にもう一度お試しください`;
        }
      } catch {
        // ignore non-JSON bodies
      }
      callbacks.onError(detail);
      return;
    }

    if (!response.body) {
      callbacks.onError('empty response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const parsed = JSON.parse(line) as {
              delta?: string;
              done?: boolean;
              error?: string;
            };
            if (parsed.error) {
              callbacks.onError(parsed.error);
              return;
            }
            if (parsed.delta) callbacks.onDelta(parsed.delta);
            if (parsed.done) {
              callbacks.onDone();
              return;
            }
          } catch {
            // ignore malformed line
          }
        }
      }
      callbacks.onDone();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        callbacks.onError((err as Error).message ?? 'stream read error');
      }
    }
  })();

  return controller;
}
