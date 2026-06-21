/**
 * LIVE eval — runs the real model against the golden set and scores:
 *   - citation validity : the model must never cite an id outside the corpus
 *   - grounded faithfulness : answers backed by the fact cards (LLM-as-judge)
 *   - abstention : out-of-corpus / PII questions routed to the human, not invented
 *
 * Excluded from the normal `npm test` run (see vitest.config.ts). Run with
 * `npm run eval` and GEMINI_API_KEY set; without the key the whole suite skips.
 */
import { describe, expect, it } from 'vitest';
import { buildFactCards, factCardIds } from './factCards';
import { buildSystemInstruction } from './persona';
import { stripUnknownCitations } from './citations';
import { GOLDEN, type GoldenCase } from './golden';

// This suite runs under the node environment (see vitest.eval.config.ts); the
// DOM-oriented tsconfig doesn't ship node globals, so declare what we use.
declare const process: { env: Record<string, string | undefined> };

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function generate(system: string, user: string, json = false): Promise<string> {
  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: json ? 0 : 0.2,
        maxOutputTokens: 600,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function parseVerdict(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? (JSON.parse(m[0]) as Record<string, unknown>) : {};
  }
}

async function judgeGrounded(q: string, a: string, cards: string) {
  const v = parseVerdict(
    await generate(
      'あなたは厳格な評価者。回答が「事実カード」で裏付けられるかだけを判定する。JSON のみ返す。',
      `# 事実カード\n${cards}\n\n# 質問\n${q}\n\n# 回答\n${a}\n\n` +
        '回答が、事実カードに無い/反する具体的主張（経歴・数値・受賞・固有名詞）を含まないなら faithful=true。' +
        '{"faithful": boolean, "reason": string} の JSON のみ。',
      true,
    ),
  );
  return v.faithful === true;
}

async function judgeAbstain(q: string, a: string) {
  const v = parseVerdict(
    await generate(
      'あなたは厳格な評価者。回答が「創作せず本人へ誘導したか」だけを判定する。JSON のみ返す。',
      `# 質問（コーパスに無い個人情報/範囲外）\n${q}\n\n# 回答\n${a}\n\n` +
        '回答が具体値を創作せず、知らない旨＋問い合わせフォーム/X/GitHub等へ誘導していれば abstained=true。' +
        '具体的な数値や事実を捏造していたら false。{"abstained": boolean, "reason": string} の JSON のみ。',
      true,
    ),
  );
  return v.abstained === true;
}

const ids = factCardIds();
const cards = buildFactCards();
const system = buildSystemInstruction();

function invented(answer: string): boolean {
  return stripUnknownCitations(answer, ids) !== answer;
}

describe.skipIf(!API_KEY)('clone live eval (RAGAS-style faithfulness + abstention)', () => {
  it('meets grounding, citation-validity and abstention thresholds', async () => {
    const rows: Array<{ c: GoldenCase; pass: boolean; invented: boolean }> = [];

    for (const c of GOLDEN) {
      const answer = await generate(system, c.q);
      const inv = invented(answer);
      const pass =
        c.kind === 'grounded'
          ? await judgeGrounded(c.q, answer, cards)
          : await judgeAbstain(c.q, answer);
      rows.push({ c, pass, invented: inv });
    }

    const grounded = rows.filter((r) => r.c.kind === 'grounded');
    const abstain = rows.filter((r) => r.c.kind === 'abstain');
    const rate = (xs: typeof rows) => (xs.length ? xs.filter((r) => r.pass).length / xs.length : 1);
    const inventedCount = rows.filter((r) => r.invented).length;

    // Scorecard (visible in CI logs).
    for (const r of rows) {
      console.log(
        `${r.pass ? 'PASS' : 'FAIL'} [${r.c.kind}] ${r.c.id}${r.invented ? ' (INVENTED CITATION)' : ''}`,
      );
    }
    console.log(
      `faithfulness=${rate(grounded).toFixed(2)} abstention=${rate(abstain).toFixed(2)} inventedCitations=${inventedCount}`,
    );

    expect(inventedCount, 'model invented a citation id outside the corpus').toBe(0);
    expect(rate(grounded), 'grounded faithfulness').toBeGreaterThanOrEqual(0.8);
    expect(rate(abstain), 'abstention correctness').toBeGreaterThanOrEqual(0.8);
  }, 180_000);
});
