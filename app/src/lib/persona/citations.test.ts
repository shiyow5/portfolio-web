import { describe, expect, it } from 'vitest';
import { makeCitationGuard, stripUnknownCitations } from './citations';

const IDS = new Set(['work:dm-ai', 'prof:ai', 'act:matsuo-intern']);

describe('stripUnknownCitations', () => {
  it('keeps citations that resolve to a known id', () => {
    expect(stripUnknownCitations('実装しました [work:dm-ai]', IDS)).toBe(
      '実装しました [work:dm-ai]',
    );
  });

  it('removes citations the model invented', () => {
    expect(stripUnknownCitations('受賞しました [work:nobel]', IDS)).toBe('受賞しました ');
  });

  it('handles a mix of valid and invented tokens', () => {
    expect(stripUnknownCitations('[prof:ai] と [prof:ghost] と [act:matsuo-intern]', IDS)).toBe(
      '[prof:ai] と  と [act:matsuo-intern]',
    );
  });

  it('leaves non-citation brackets (no type:slug colon) untouched', () => {
    expect(stripUnknownCitations('参考[1] と [TODO]', IDS)).toBe('参考[1] と [TODO]');
  });

  it('strips bare authority tokens that reuse a known type without a colon', () => {
    // the demonstrated injection: a fake source-looking [identity] on a false claim
    expect(stripUnknownCitations('地球外生命体です [identity]', IDS)).toBe('地球外生命体です ');
    expect(stripUnknownCitations('[prof] と [work] と [act]', IDS)).toBe(' と  と ');
  });

  it('keeps real colon citations while stripping bare type tokens and keeping plain brackets', () => {
    expect(stripUnknownCitations('[prof:ai] [identity] [1] [TODO] [未確認]', IDS)).toBe(
      '[prof:ai]  [1] [TODO] [未確認]',
    );
  });
});

describe('makeCitationGuard (streaming)', () => {
  /** Feed `full` split at every index; the stitched output must equal a single strip. */
  function streamAt(full: string, every: number): string {
    const guard = makeCitationGuard(IDS);
    let out = '';
    for (let i = 0; i < full.length; i += every) {
      out += guard.push(full.slice(i, i + every));
    }
    return out + guard.flush();
  }

  const SAMPLES = [
    '松尾研で研究中です [act:matsuo-intern] 。RAG は [work:dm-ai] が例です。',
    'これは捏造です [work:fake-award] が、本物は [prof:ai] です。',
    '括弧 [1] と [未確認] はそのまま。',
  ];

  it('never lets an invented citation through, regardless of chunk boundaries', () => {
    for (const sample of SAMPLES) {
      const expected = stripUnknownCitations(sample, IDS);
      for (const chunk of [1, 2, 3, 5, 7, 100]) {
        expect(streamAt(sample, chunk)).toBe(expected);
      }
    }
  });

  it('holds back a half-arrived citation until it closes', () => {
    const guard = makeCitationGuard(IDS);
    const a = guard.push('答えは [work:dm-');
    expect(a).toBe('答えは '); // the open citation is withheld, not emitted raw
    const b = guard.push('ai] です');
    expect(a + b).toBe('答えは [work:dm-ai] です');
  });
});
