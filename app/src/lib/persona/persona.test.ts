import { describe, expect, it } from 'vitest';
import { WORKS } from '../works';
import { factCardIds } from './factCards';
import { PERSONA_SYSTEM_INSTRUCTION, STYLE_FEWSHOT, buildSystemInstruction } from './persona';

const CITATION_RE = /\[([a-z]+:[a-z0-9-]+)\]/gi;

describe('PERSONA_SYSTEM_INSTRUCTION (three layers)', () => {
  it('states the grounding, abstention, citation, and transparency rules', () => {
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('事実カード'); // grounding
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('問い合わせフォーム'); // abstention routing
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('[id]'); // citation rule
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('クローン'); // transparency
  });

  it('no longer claims pixel-art as a focus (stale persona removed)', () => {
    expect(PERSONA_SYSTEM_INSTRUCTION).not.toContain('ドット絵');
  });

  it("encodes the user's real catchphrase as voice guidance", () => {
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('そういう説もあるか');
  });
});

describe('STYLE_FEWSHOT', () => {
  it('only teaches citations that resolve to real fact-card ids', () => {
    const ids = factCardIds();
    for (const ex of STYLE_FEWSHOT) {
      for (const m of ex.a.matchAll(CITATION_RE)) {
        expect(ids.has(m[1]!.toLowerCase())).toBe(true);
      }
    }
  });
});

describe('buildSystemInstruction', () => {
  const sys = buildSystemInstruction();

  it('bundles the persona, the voice examples, and the full fact cards', () => {
    expect(sys).toContain('事実カード');
    expect(sys).toContain(STYLE_FEWSHOT[0]!.a);
    expect(sys).toContain('[prof:identity]');
  });

  it('grounds every work (whole corpus injected, no retrieval)', () => {
    for (const w of WORKS) expect(sys).toContain(`[work:${w.id}]`);
  });
});
