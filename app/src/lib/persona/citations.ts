/**
 * Verifiable-citation guard — the main anti-hallucination mechanism.
 *
 * The clone is told to tag every factual claim with a `[type:slug]` id from the
 * fact cards. This module strips any citation that does NOT resolve to a real
 * id, so a fabricated source can never reach the visitor. It works over a live
 * token stream: a citation split across chunks is held back until it closes.
 */

/** Matches a citation token like `[work:dm-ai]` (requires the `type:slug` colon). */
const CITATION_RE = /\[([a-z]+:[a-z0-9-]+)\]/gi;

/**
 * Bare tokens that reuse a real card TYPE but drop the `:slug` colon, e.g.
 * `[identity]` / `[prof]` / `[work]`. A real citation always carries the colon,
 * so these are never legitimate — they're authority-looking decoration a model
 * emits when laundering an ungrounded claim (the demonstrated `[identity]`
 * attack). Scoped to known type names on purpose, so genuine non-citation
 * brackets like `[1]` / `[TODO]` / `[未確認]` are left untouched.
 */
const BARE_TYPE_RE = /\[(identity|prof|work|act)\]/gi;

/** Longest a real citation can be; past this an unclosed `[` is treated as prose. */
const MAX_HELD = 48;

/**
 * Removes citation tokens whose id is not in `validIds` (valid ones kept
 * verbatim), then strips bare colon-less type tokens. NOTE: this scrubs the
 * *look* of a source; it cannot detect a claim that launders a real id, so it is
 * a backstop — grounding lives in the persona + few-shot, verified by red-team.
 */
export function stripUnknownCitations(text: string, validIds: ReadonlySet<string>): string {
  return text
    .replace(CITATION_RE, (full, id: string) => (validIds.has(id.toLowerCase()) ? full : ''))
    .replace(BARE_TYPE_RE, '');
}

export interface CitationGuard {
  /** Feed a stream delta; returns the text that is safe to emit now. */
  push(delta: string): string;
  /** Emit whatever is still held back once the stream ends. */
  flush(): string;
}

/**
 * Splits a buffer into the part that is safe to strip-and-emit now and a tail to
 * hold. Only the final unclosed `[` is withheld — and only while it could still
 * become a real (short) citation.
 */
function splitSafe(buffer: string): { safe: string; held: string } {
  const open = buffer.lastIndexOf('[');
  if (open === -1) return { safe: buffer, held: '' };
  if (buffer.indexOf(']', open) !== -1) return { safe: buffer, held: '' };
  if (buffer.length - open > MAX_HELD) return { safe: buffer, held: '' };
  return { safe: buffer.slice(0, open), held: buffer.slice(open) };
}

export function makeCitationGuard(validIds: ReadonlySet<string>): CitationGuard {
  let held = '';
  return {
    push(delta: string): string {
      const { safe, held: next } = splitSafe(held + delta);
      held = next;
      return stripUnknownCitations(safe, validIds);
    },
    flush(): string {
      const out = stripUnknownCitations(held, validIds);
      held = '';
      return out;
    },
  };
}
