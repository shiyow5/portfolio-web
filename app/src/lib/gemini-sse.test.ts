import { describe, expect, it } from 'vitest';
import { extractDelta, splitSSEEvents } from './gemini-sse';

const evt = (text: string) =>
  `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}`;

describe('splitSSEEvents', () => {
  it('splits CRLF-separated events (Gemini real format)', () => {
    const { events, rest } = splitSSEEvents(`${evt('A')}\r\n\r\n${evt('B')}\r\n\r\n`);
    expect(events).toHaveLength(2);
    expect(rest).toBe('');
    expect(events.map(extractDelta)).toEqual(['A', 'B']);
  });

  it('also handles LF-separated events', () => {
    const { events } = splitSSEEvents(`${evt('A')}\n\n${evt('B')}\n\n`);
    expect(events.map(extractDelta)).toEqual(['A', 'B']);
  });

  it('carries an unterminated tail in rest', () => {
    const { events, rest } = splitSSEEvents(`${evt('A')}\r\n\r\ndata: {"partial`);
    expect(events.map(extractDelta)).toEqual(['A']);
    expect(rest).toBe('data: {"partial');
  });
});

describe('extractDelta', () => {
  it('pulls the text out of a data event', () => {
    expect(extractDelta(evt('こんにちは'))).toBe('こんにちは');
  });

  it('ignores [DONE], blank, and malformed events', () => {
    expect(extractDelta('data: [DONE]')).toBe('');
    expect(extractDelta('data:')).toBe('');
    expect(extractDelta('data: not-json')).toBe('');
    expect(extractDelta(': comment line')).toBe('');
  });
});
