import { describe, expect, it } from 'vitest';
import { WORKS } from '../works';
import { ACTIVITIES } from '../activity';
import { PROFILE } from '../profile';
import { buildFactCards, factCardIds } from './factCards';

const CITATION_RE = /\[([a-z]+:[a-z0-9-]+)\]/gi;

describe('factCardIds', () => {
  it('exposes a stable id for every work / activity / profile group', () => {
    const ids = factCardIds();
    for (const w of WORKS) expect(ids.has(`work:${w.id}`)).toBe(true);
    for (const a of ACTIVITIES) expect(ids.has(`act:${a.id}`)).toBe(true);
    for (const g of PROFILE.techStack) expect(ids.has(`prof:${g.id}`)).toBe(true);
    expect(ids.has('prof:identity')).toBe(true);
  });

  it('has exactly works + activities + groups + 1 identity ids', () => {
    expect(factCardIds().size).toBe(
      WORKS.length + ACTIVITIES.length + PROFILE.techStack.length + 1,
    );
  });
});

describe('buildFactCards', () => {
  const text = buildFactCards();

  it('grounds every work with its title and [work:id] tag', () => {
    for (const w of WORKS) {
      expect(text).toContain(`[work:${w.id}]`);
      expect(text).toContain(w.title);
    }
  });

  it('grounds every activity with its [act:id] tag', () => {
    for (const a of ACTIVITIES) {
      expect(text).toContain(`[act:${a.id}]`);
      expect(text).toContain(a.title);
    }
  });

  it('grounds identity and each profile group', () => {
    expect(text).toContain('[prof:identity]');
    expect(text).toContain(PROFILE.name);
    expect(text).toContain(PROFILE.location);
    for (const g of PROFILE.techStack) expect(text).toContain(`[prof:${g.id}]`);
  });

  it('surfaces concrete links so they can be cited verbatim', () => {
    expect(text).toContain('https://fastbear.aisometry.com/');
    expect(text).toContain('https://github.com/shiyow5/DuelMasters-AI');
  });

  it('surfaces work and activity source links for citing provenance', () => {
    // a work source (PTCG official page) and an activity source (GDGoC event)
    expect(text).toContain('https://ptcg-abc.pokemon.co.jp/');
    expect(text).toContain('gdg.community.dev');
  });

  it('never emits a citation token that is not a known id', () => {
    const ids = factCardIds();
    for (const m of text.matchAll(CITATION_RE)) {
      expect(ids.has(m[1]!)).toBe(true);
    }
  });
});
