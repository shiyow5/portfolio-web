/**
 * Parsing helpers for Gemini's streamGenerateContent SSE output.
 *
 * Gemini separates events with CRLF (`\r\n\r\n`), so a naive `\n\n` split never
 * matches and drops every chunk. These helpers handle both CRLF and LF and are
 * unit-tested, since the chat stream silently breaks if this is wrong.
 */

/** Boundary between SSE events: a blank line, CRLF or LF. */
const EVENT_BOUNDARY = /\r?\n\r?\n/;

/**
 * Splits a streamed buffer into complete SSE events plus the unterminated tail
 * to carry into the next read.
 */
export function splitSSEEvents(buffer: string): { events: string[]; rest: string } {
  const events: string[] = [];
  let rest = buffer;
  for (;;) {
    const m = EVENT_BOUNDARY.exec(rest);
    if (!m) break;
    events.push(rest.slice(0, m.index));
    rest = rest.slice(m.index + m[0].length);
  }
  return { events, rest };
}

/** Extracts the text delta from one SSE event, or '' if there is none. */
export function extractDelta(event: string): string {
  const line = event.split('\n').find((l) => l.startsWith('data:'));
  if (!line) return '';
  const payload = line.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    const parsed = JSON.parse(payload) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch {
    return '';
  }
}
