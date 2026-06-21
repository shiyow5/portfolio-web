/**
 * Splits assistant text into plain-text and link parts so the chat can render
 * every kind of reference the model emits as a real, clickable link:
 *   - `[type:slug]` clone citations  -> resolved source / in-page link
 *   - `[text](url)` markdown links    -> the url
 *   - bare `https://…` urls           -> the url
 */
import type { Mode } from '../mode';
import { resolveCitation } from './citationLinks';

export type MsgPart =
  | { kind: 'text'; text: string }
  | { kind: 'link'; href: string; text: string; external: boolean };

// markdown-link | citation | bare-url (first alternative wins per position)
const TOKEN_RE =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\[([a-z]+:[a-z0-9-]+)\]|(https?:\/\/[^\s)]+)/g;

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function tokenizeAssistantText(content: string, mode: Mode): MsgPart[] {
  const parts: MsgPart[] = [];
  let last = 0;
  for (const m of content.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ kind: 'text', text: content.slice(last, start) });

    if (m[1] !== undefined && m[2]) {
      // [text](url) — show the label, unless the label is itself the url
      const text = /^https?:\/\//.test(m[1]) ? `${host(m[2])} ↗` : m[1];
      parts.push({ kind: 'link', href: m[2], text, external: true });
    } else if (m[3]) {
      const c = resolveCitation(m[3], mode);
      if (c) {
        parts.push({
          kind: 'link',
          href: c.href,
          text: `[${c.slug}${c.external ? ' ↗' : ''}]`,
          external: c.external,
        });
      } else {
        parts.push({ kind: 'text', text: m[0] });
      }
    } else if (m[4]) {
      parts.push({ kind: 'link', href: m[4], text: `${host(m[4])} ↗`, external: true });
    }

    last = start + m[0].length;
  }
  if (last < content.length) parts.push({ kind: 'text', text: content.slice(last) });
  return parts;
}
