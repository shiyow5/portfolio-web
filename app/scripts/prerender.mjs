/**
 * Post-build prerender: bakes crawlable content into the shipped HTML.
 *
 * Runs after `vite build` (see package.json "build"). It reads the same JSON the
 * app renders, injects a semantic-HTML body into dist/index.html's empty
 * <div id="root">, replaces the static Person JSON-LD with a generated @graph,
 * and writes dist/sitemap.xml.
 *
 * The render helpers live in typed TS (src/lib/seo/renderStatic.ts) shared with
 * the vitest regression test. They import only types, so esbuild-transpiling that
 * file yields a self-contained ESM module we import from a data: URL — this works
 * on ANY Node version and does NOT depend on Node's own TS type-stripping (which
 * CI / Cloudflare's Node may not enable, hence plain .mjs here, not .mts).
 *
 * The build fails loudly if an expected anchor is missing, so a refactor that
 * silently drops the content can't ship a blank page again.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { transform } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, '..');
const distDir = join(appRoot, 'dist');
const dataDir = join(appRoot, 'src', 'data');

const renderSrc = readFileSync(join(appRoot, 'src/lib/seo/renderStatic.ts'), 'utf8');
const { code } = await transform(renderSrc, { loader: 'ts', format: 'esm' });
const renderUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const { buildSite, renderBodyHtml, renderJsonLd, renderSitemap, renderLlmsTxt, FAQ } = await import(
  renderUrl
);

const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
const profile = readJson('profile.json');
const works = readJson('works.json');
// Newest first — mirrors src/lib/activity.ts so the static timeline matches the UI.
const activities = readJson('activity.json')
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

// 3. Sync <meta name="keywords"> from the curated target list so the shipped
//    HTML can't drift from docs/SEO_KEYWORDS.md / buildSite().
const kwRe = /<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/>/;
if (!kwRe.test(html)) {
  throw new Error('prerender: <meta name="keywords"> not found in dist/index.html');
}
html = html.replace(
  kwRe,
  `<meta name="keywords" content="${site.keywords.join(', ').replace(/"/g, '&quot;')}" />`,
);

writeFileSync(indexPath, html);

// 4. Sitemap (single URL today; lastmod = build date) + llms.txt digest.
const lastmod = new Date().toISOString().slice(0, 10);
writeFileSync(join(distDir, 'sitemap.xml'), renderSitemap([{ loc: site.url, lastmod }]));
writeFileSync(join(distDir, 'llms.txt'), renderLlmsTxt(site, works, activities));

// 5. Sanity gate: the rendered HTML must actually contain every work title, the
//    name reading (the highest-value query), and every FAQ question — the
//    answers Google and the AI answer engines quote.
for (const w of works) {
  if (!html.includes(w.title)) {
    throw new Error(`prerender: work title missing from output HTML: ${w.title}`);
  }
}
if (!html.includes('しよを')) {
  throw new Error('prerender: name reading "しよを" missing from output HTML');
}
for (const f of FAQ) {
  if (!html.includes(f.q)) {
    throw new Error(`prerender: FAQ question missing from output HTML: ${f.q}`);
  }
}

const graphNodes = graph['@graph'].length;
console.log(
  `prerender: baked ${works.length} works + ${activities.length} activities, ` +
    `JSON-LD @graph (${graphNodes} nodes), sitemap.xml and llms.txt into dist/`,
);
