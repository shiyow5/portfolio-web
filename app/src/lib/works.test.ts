import { describe, expect, it } from 'vitest';
import { WORKS } from './works';

describe('WORKS catalogue', () => {
  it('exposes a non-empty list', () => {
    expect(WORKS.length).toBeGreaterThan(0);
  });

  it('gives every work the expected shape', () => {
    for (const work of WORKS) {
      expect(work.id).toBeTruthy();
      expect(work.title).toBeTruthy();
      expect(work.tagline).toBeTruthy();
      expect(Array.isArray(work.tech)).toBe(true);
      expect(work.tech.length).toBeGreaterThan(0);
      expect(typeof work.status).toBe('string');
      expect(typeof work.year).toBe('number');
      expect(typeof work.links).toBe('object');
    }
  });

  it('uses unique ids', () => {
    const ids = WORKS.map((work) => work.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only exposes absolute http(s) links (no placeholders)', () => {
    for (const work of WORKS) {
      const urls = [
        work.links.github,
        work.links.demo,
        work.links.play,
        ...(work.links.sources ?? []).map((s) => s.url),
      ].filter(Boolean) as string[];
      for (const url of urls) {
        expect(url).toMatch(/^https?:\/\//);
        expect(url).not.toContain('example.com');
      }
    }
  });

  it('gives every source link a label and absolute url', () => {
    for (const work of WORKS) {
      for (const source of work.links.sources ?? []) {
        expect(source.label).toBeTruthy();
        expect(source.url).toMatch(/^https?:\/\//);
      }
    }
  });
});
