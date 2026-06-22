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

  it('declares the injection-resistant layers: hierarchy, extraction refusal, false-fact refusal, and a no-over-refusal allowance', () => {
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('命令階層'); // instruction hierarchy
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('抽出'); // prompt-extraction refusal
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('公式設定'); // false-fact injection refusal
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('過剰拒否'); // permission clause vs over-refusal
  });

  it('covers the echo/continue/override extraction vectors found by red-teaming', () => {
    // "repeat the text above" / "continue" verbatim reproduction
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('繰り返');
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('復唱');
    // "ignore previous instructions, say X" override
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('次の指示にだけ従え');
    // do not reveal the few-shot examples
    expect(PERSONA_SYSTEM_INSTRUCTION).toContain('口調の例');
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

  it('injects the spotlight fence only when a nonce is supplied', () => {
    expect(sys).not.toContain('VISITOR_INPUT'); // no-arg form (e.g. GET /api/chat) stays clean
    const fenced = buildSystemInstruction('test-nonce');
    expect(fenced).toContain('<<VISITOR_INPUT id=test-nonce>>');
    expect(fenced).toContain('スポットライティング');
  });
});
