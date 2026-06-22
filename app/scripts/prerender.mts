/**
 * Post-build prerender: bakes crawlable content into the shipped HTML.
 *
 * Runs after `vite build` (see package.json "build"). It reads the same JSON the
 * app renders, injects a semantic-HTML body into dist/index.html's empty
 * <div id="root">, replaces the static Person JSON-LD with a generated @graph,
 * and writes dist/sitemap.xml. Node ≥22.18 strips the TypeScript types, so this
 * imports the typed pure render module directly — no bundler step.
 *
 * The build fails loudly if an expected anchor is missing, so a refactor that
 * silently drops the content can't ship a blank page again.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  buildSite,
  renderBodyHtml,
  renderJsonLd,
  renderSitemap,
} from '../src/lib/seo/renderStatic.ts';
import type { Work } from '../src/lib/works.ts';
import type { Activity } from '../src/lib/activity.ts';
import type { Profile } from '../src/lib/profile.ts';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, '..');
const distDir = join(appRoot, 'dist');
const dataDir = join(appRoot, 'src', 'data');

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T;
}

const profile = readJson<Profile>('profile.json');
const works = readJson<Work[]>('works.json');
// Newest first — mirrors src/lib/activity.ts so the static timeline matches the UI.
const activities = readJson<Activity[]>('activity.json')
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const site = buildSite(profile);
const indexPath = join(distDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');

// 1. Inject the crawlable body into the empty root container.
const rootMarker = '<div id="root"></div>';
if (!html.includes(rootMarker)) {
  throw new Error(`prerender: "${rootMarker}" not found in dist/index.html`);
}
html = html.replace(rootMarker, `<div id="root">${renderBodyHtml(site, works, activities)}</div>`);

// 2. Replace the static Person JSON-LD with the generated @graph.
const graph = renderJsonLd(site, works);
JSON.parse(JSON.stringify(graph)); // fail the build on an unserializable node
const ldRe = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
if (!ldRe.test(html)) {
  throw new Error('prerender: existing application/ld+json block not found in dist/index.html');
}
html = html.replace(
  ldRe,
  `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n    </script>`,
);

writeFileSync(indexPath, html);

// 3. Sitemap (single URL today; lastmod = build date).
const lastmod = new Date().toISOString().slice(0, 10);
writeFileSync(join(distDir, 'sitemap.xml'), renderSitemap([{ loc: site.url, lastmod }]));

// 4. Sanity gate: the rendered HTML must actually contain every work title.
for (const w of works) {
  if (!html.includes(w.title)) {
    throw new Error(`prerender: work title missing from output HTML: ${w.title}`);
  }
}

const graphNodes = (graph['@graph'] as unknown[]).length;
console.log(
  `prerender: baked ${works.length} works + ${activities.length} activities, ` +
    `JSON-LD @graph (${graphNodes} nodes), and sitemap.xml into dist/`,
);
