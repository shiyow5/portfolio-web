import { describe, expect, it } from 'vitest';
import { tokenizeAssistantText, type MsgPart } from './messageTokens';

const links = (parts: MsgPart[]) =>
  parts.filter((p): p is Extract<MsgPart, { kind: 'link' }> => p.kind === 'link');

describe('tokenizeAssistantText', () => {
  it('turns a clone citation into a resolved link', () => {
    const parts = tokenizeAssistantText('優秀賞をとりました [work:astralyx]。', 'editorial');
    const l = links(parts);
    expect(l).toHaveLength(1);
    expect(l[0]!.href).toMatch(/^https?:\/\//);
    expect(l[0]!.text).toBe('[astralyx ↗]');
    expect(parts[0]).toEqual({ kind: 'text', text: '優秀賞をとりました ' });
    expect(parts[parts.length - 1]).toEqual({ kind: 'text', text: '。' });
  });

  it('renders a markdown link using its label', () => {
    const l = links(
      tokenizeAssistantText(
        'デモは [公式サイト](https://fastbear.aisometry.com/) です',
        'editorial',
      ),
    );
    expect(l[0]).toEqual({
      kind: 'link',
      href: 'https://fastbear.aisometry.com/',
      text: '公式サイト',
      external: true,
    });
  });

  it('collapses a markdown link whose label is the url to the hostname', () => {
    const l = links(
      tokenizeAssistantText('[https://prtimes.jp/x/y](https://prtimes.jp/x/y)', 'editorial'),
    );
    expect(l[0]!.text).toBe('prtimes.jp ↗');
    expect(l[0]!.href).toBe('https://prtimes.jp/x/y');
  });

  it('autolinks a bare url to its hostname', () => {
    const l = links(
      tokenizeAssistantText(
        'こちら https://aizu-startups-foundation.com/aotake/2025 です',
        'editorial',
      ),
    );
    expect(l[0]!.text).toBe('aizu-startups-foundation.com ↗');
    expect(l[0]!.href).toBe('https://aizu-startups-foundation.com/aotake/2025');
  });

  it('leaves an unknown citation token as plain text', () => {
    const parts = tokenizeAssistantText('[work:nope] です', 'editorial');
    expect(links(parts)).toHaveLength(0);
    expect(parts[0]).toEqual({ kind: 'text', text: '[work:nope]' });
  });
});
