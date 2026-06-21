/**
 * Resolves a clone citation id (e.g. `work:fastbear`, `act:astralyx-award`,
 * `prof:ai`) to a navigable link so the chat can render `[id]` tokens as real,
 * clickable references instead of dead text.
 *
 * Works/activities with a URL link out to their source; everything else links
 * to the matching in-page section (anchors differ per mode).
 */
import { WORKS } from '../works';
import { ACTIVITIES } from '../activity';
import { PROFILE } from '../profile';
import type { Mode } from '../mode';

const ANCHORS: Record<Mode, { work: string; activity: string; stack: string }> = {
  editorial: { work: 'work', activity: 'activity', stack: 'stack' },
  terminal: { work: 'projects', activity: 'activity', stack: 'skills' },
};

export interface ResolvedCitation {
  id: string;
  slug: string;
  href: string;
  external: boolean;
  label: string;
}

const CITATION = /^([a-z]+):([a-z0-9-]+)$/;

export function resolveCitation(raw: string, mode: Mode): ResolvedCitation | null {
  const m = CITATION.exec(raw);
  if (!m) return null;
  const type = m[1]!;
  const slug = m[2]!;
  const anchors = ANCHORS[mode];

  if (type === 'work') {
    const w = WORKS.find((x) => x.id === slug);
    if (!w) return null;
    const url = w.links.demo ?? w.links.play ?? w.links.github ?? w.links.sources?.[0]?.url;
    return url
      ? { id: raw, slug, href: url, external: true, label: w.title }
      : { id: raw, slug, href: `#${anchors.work}`, external: false, label: w.title };
  }

  if (type === 'act') {
    const a = ACTIVITIES.find((x) => x.id === slug);
    if (!a) return null;
    const url = a.links[0]?.url;
    return url
      ? { id: raw, slug, href: url, external: true, label: a.title }
      : { id: raw, slug, href: `#${anchors.activity}`, external: false, label: a.title };
  }

  if (type === 'prof') {
    const g = PROFILE.techStack.find((x) => x.id === slug);
    return {
      id: raw,
      slug,
      href: `#${anchors.stack}`,
      external: false,
      label: g?.label ?? 'プロフィール',
    };
  }

  return null;
}
