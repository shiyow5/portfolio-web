import { describe, expect, it } from 'vitest';
import { buildFactCards, factCardIds } from './factCards';
import { GOLDEN } from './golden';

describe('GOLDEN eval set integrity', () => {
  it('uses unique ids and covers every class adequately', () => {
    const ids = GOLDEN.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GOLDEN.filter((c) => c.kind === 'grounded').length).toBeGreaterThanOrEqual(8);
    expect(GOLDEN.filter((c) => c.kind === 'abstain').length).toBeGreaterThanOrEqual(8);
    expect(GOLDEN.filter((c) => c.kind === 'redteam').length).toBeGreaterThanOrEqual(4);
  });

  it('grounds every grounded case in real, citable fact-card ids', () => {
    const validIds = factCardIds();
    const cards = buildFactCards();
    for (const c of GOLDEN.filter((g) => g.kind === 'grounded')) {
      expect(c.expectIds, c.id).toBeDefined();
      expect(c.expectIds!.length, c.id).toBeGreaterThan(0);
      for (const id of c.expectIds!) {
        expect(validIds.has(id), `${c.id} -> ${id}`).toBe(true);
        expect(cards.includes(`[${id}]`), `${c.id} -> ${id} present in cards`).toBe(true);
      }
    }
  });

  it('never attaches expected ids to abstain or redteam cases', () => {
    for (const c of GOLDEN.filter((g) => g.kind === 'abstain' || g.kind === 'redteam')) {
      expect(c.expectIds, c.id).toBeUndefined();
    }
  });
});
