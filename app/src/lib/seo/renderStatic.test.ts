import { describe, it, expect } from 'vitest';
import {
  buildSite,
  escapeHtml,
  renderBodyHtml,
  renderJsonLd,
  renderSitemap,
  workUrl,
} from './renderStatic';
import { WORKS } from '../works';
import { ACTIVITIES } from '../activity';
import { PROFILE } from '../profile';

const site = buildSite(PROFILE);

describe('escapeHtml', () => {
  it('escapes HTML-significant characters', () => {
    expect(escapeHtml('<a href="x">A & B\'C</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;A &amp; B&#39;C&lt;/a&gt;',
    );
  });

  it('stringifies numbers', () => {
    expect(escapeHtml(2026)).toBe('2026');
  });
});

describe('renderBodyHtml', () => {
  const body = renderBodyHtml(site, WORKS, ACTIVITIES);

  it('contains every work title and tagline (the body must not be blank for crawlers)', () => {
    for (const w of WORKS) {
      expect(body).toContain(escapeHtml(w.title));
      expect(body).toContain(escapeHtml(w.tagline));
    }
  });

  it('emits a stable in-page anchor per work', () => {
    for (const w of WORKS) {
      expect(body).toContain(`id="work-${w.id}"`);
    }
  });

  it('contains every activity title and the tech-stack group labels', () => {
    for (const a of ACTIVITIES) {
      expect(body).toContain(escapeHtml(a.title));
    }
    for (const g of PROFILE.techStack) {
      expect(body).toContain(escapeHtml(g.label));
    }
  });

  it('does not hide content with display:none (cloaking guard)', () => {
    expect(body).not.toMatch(/display\s*:\s*none/i);
  });
});

describe('renderJsonLd', () => {
  const graph = renderJsonLd(site, WORKS);

  it('serializes to valid JSON', () => {
    expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
  });

  it('includes Person, WebSite, ItemList and one CreativeWork per work', () => {
    const nodes = graph['@graph'] as Array<Record<string, unknown>>;
    const types = nodes.map((n) => n['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');
    expect(types).toContain('ItemList');
    expect(nodes.filter((n) => n['@type'] === 'CreativeWork')).toHaveLength(WORKS.length);
  });

  it('gives every CreativeWork a non-empty url and keywords', () => {
    const nodes = graph['@graph'] as Array<Record<string, unknown>>;
    for (const n of nodes.filter((x) => x['@type'] === 'CreativeWork')) {
      expect(typeof n.url).toBe('string');
      expect((n.url as string).length).toBeGreaterThan(0);
      expect(n.keywords).toBeTruthy();
    }
  });

  it('carries the enriched Person fields', () => {
    const person = (graph['@graph'] as Array<Record<string, unknown>>).find(
      (n) => n['@type'] === 'Person',
    )!;
    expect(person.alumniOf).toBeTruthy();
    expect(person.worksFor).toBeTruthy();
    expect(Array.isArray(person.knowsAbout)).toBe(true);
  });
});

describe('workUrl', () => {
  it('prefers a real external link over the in-page anchor', () => {
    const withDemo = WORKS.find((w) => w.links.demo);
    if (withDemo) expect(workUrl(withDemo, site.url)).toBe(withDemo.links.demo);
  });

  it('falls back to an in-page anchor when a work has no links', () => {
    const noLinks = WORKS.find(
      (w) => !w.links.demo && !w.links.github && !w.links.play && !w.links.sources,
    );
    if (noLinks) expect(workUrl(noLinks, site.url)).toBe(`${site.url}#work-${noLinks.id}`);
  });
});

describe('renderSitemap', () => {
  it('emits valid XML containing every loc', () => {
    const xml = renderSitemap([{ loc: 'https://shiyow.dev/', lastmod: '2026-06-22' }]);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(xml).toContain('<loc>https://shiyow.dev/</loc>');
    expect(xml).toContain('<lastmod>2026-06-22</lastmod>');
  });
});
