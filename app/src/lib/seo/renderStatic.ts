/**
 * Static SEO/LLMO render helpers — the crawlable body and JSON-LD that the
 * build-time prerender (scripts/prerender.mts) bakes into dist/index.html.
 *
 * Why this exists: the site is a pure client SPA, so the shipped index.html has
 * an empty <div id="root"></div> and no body text. JS-less crawlers (GPTBot /
 * ClaudeBot / PerplexityBot / AI Overview) therefore see a blank page — the root
 * cause of the AIO/LLMO ≈ 0 scores. These functions turn the same JSON the site
 * renders into raw, semantic HTML + structured data so the content is readable
 * without executing JS. Single data source ⇒ the static copy can't drift.
 *
 * Pure (strings/objects in, strings/objects out — no fs, no DOM) so the build
 * script AND a vitest regression test can share it. import.meta.env / motion /
 * Turnstile are never touched here, which is exactly why a plain `node` run can
 * execute it (a live renderToStaticMarkup of the React tree could not).
 */
import type { Work } from '../works';
import type { Activity } from '../activity';
import type { Profile } from '../profile';

export interface SeoSite {
  name: string;
  role: string;
  siteName: string;
  /** Canonical origin with trailing slash, e.g. "https://shiyow.dev/". */
  url: string;
  location: string;
  tagline: string;
  /** Keyword-rich, grounded summary placed in the body and Person.description. */
  about: string;
  /** Target search keywords (verbatim) for meta + knowsAbout reinforcement. */
  keywords: string[];
  /** Root-relative avatar/representative image, e.g. "/characters/shiyow.png". */
  image: string;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf: string;
  worksFor: string;
  techStack: Profile['techStack'];
}

/** Grounded Q&A for FAQPage schema — what AI answer engines lift and cite. */
export interface FaqEntry {
  q: string;
  a: string;
}

export const FAQ: FaqEntry[] = [
  {
    q: 'shiyow（しよを）はどんな人ですか？',
    a: '生成AI・LLMアプリ・AIエージェント・RAG・機械学習をプロダクトとして実装するAIエンジニアです。会津大学大学院で長文脈LLM推論（KVキャッシュ効率化）を研究しています。',
  },
  {
    q: 'shiyow の代表的な作品・実績は？',
    a: 'YouTube視聴履歴を3D可視化しAIが分析するAstralyxでハッカソン優秀賞を受賞。クマ出没情報をAIが自動収集するFASTBEAR、RAGチャットボットのDM-AIなど、生成AIプロダクトを個人・チームで開発しています。',
  },
  {
    q: 'shiyow が使える技術・スキルは？',
    a: 'Gemini / Vertex AI、LangGraph、RAG（pgvector）、Function Calling、PyTorch、強化学習（PPO）、Python・TypeScript・Go などで、LLMアプリ・AIエージェント・機械学習をプロダクト実装できます。',
  },
  {
    q: 'shiyow への連絡・採用の問い合わせ方法は？',
    a: 'ポートフォリオサイト shiyow.dev の問い合わせフォーム、またはGitHub・X から連絡できます。サイト内の自作クローンAI（Gemini製）に質問することもできます。',
  },
];

/** Site identity for the static render — derived from PROFILE plus authored copy. */
export function buildSite(profile: Profile): SeoSite {
  return {
    name: profile.name,
    role: 'AI Engineer',
    siteName: 'shiyow.dev',
    url: 'https://shiyow.dev/',
    location: profile.location,
    tagline:
      'LLMアプリ・AIエージェント・機械学習をプロダクトとして実装するAIエンジニア。自作のクローンAIと話せるポートフォリオ。',
    about:
      'shiyow（しよを）は、生成AI・LLMアプリ・AIエージェント・RAG・機械学習をプロダクトとして実装するAIエンジニアです。' +
      '会津大学大学院で長文脈LLM推論（KVキャッシュ効率化）を研究しながら、ハッカソン優秀賞のAstralyxや、クマ出没情報を' +
      'AIが自動収集するFASTBEARなど、生成AIプロダクトを個人・チームで開発してきました。このポートフォリオサイトでは、' +
      'モデル選定からコスト最適化・本番デプロイまで一人で通せる実装力の例として、自作のクローンAI（Gemini製）と対話できます。',
    keywords: [
      'AIエンジニア',
      'AIエンジニア ポートフォリオ',
      'ポートフォリオ',
      '生成AI',
      'LLM',
      'LLMアプリ開発',
      'AIエージェント',
      'RAG',
      '機械学習',
      'Gemini',
      'PyTorch',
      '強化学習',
      '会津大学',
      'shiyow',
    ],
    image: '/characters/shiyow.png',
    sameAs: ['https://github.com/shiyow5', 'https://x.com/twinS_KNSN1415'],
    knowsAbout: [
      'AIエンジニア',
      '生成AI',
      'LLMアプリ開発',
      'AIエージェント開発',
      '機械学習',
      'LLM',
      'RAG',
      'Retrieval-Augmented Generation',
      'AI Agents',
      'Machine Learning',
      'Reinforcement Learning',
      'KV Cache',
      'Prompt Engineering',
      'Cloud Infrastructure',
    ],
    alumniOf: 'University of Aizu / 会津大学',
    worksFor: '松尾研究室 (Matsuo Lab, The University of Tokyo)',
    techStack: profile.techStack,
  };
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes a value for safe interpolation into HTML text or a double-quoted attribute. */
export function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]!);
}

/** Strips a trailing slash so origin + root-relative path concatenation is clean. */
function origin(url: string): string {
  return url.replace(/\/$/, '');
}

/**
 * Best crawl/citation target for a work: a real external URL when one exists,
 * else an in-page anchor. Priority mirrors how the UI surfaces a primary link.
 */
export function workUrl(work: Work, siteUrl: string): string {
  const l = work.links ?? {};
  return l.demo || l.github || l.play || l.sources?.[0]?.url || `${siteUrl}#work-${work.id}`;
}

function workLinksHtml(work: Work): string {
  const l = work.links ?? {};
  const items: Array<[string, string]> = [];
  if (l.github) items.push(['GitHub', l.github]);
  if (l.demo) items.push(['Demo', l.demo]);
  if (l.play) items.push(['Play', l.play]);
  for (const s of l.sources ?? []) items.push([s.label, s.url]);
  if (items.length === 0) return '';
  const links = items
    .map(([label, url]) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`)
    .join(' · ');
  return `<p class="links">${links}</p>`;
}

/** "2026-04-01" → "2026.04" (mirrors activity.ts formatDate, no day). */
function formatMonth(iso: string): string {
  const [y, m] = iso.split('-');
  return m ? `${y}.${m}` : iso;
}

function activityLinksHtml(activity: Activity): string {
  if (activity.links.length === 0) return '';
  const links = activity.links
    .map((l) => `<a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a>`)
    .join(' · ');
  return ` <span class="links">${links}</span>`;
}

/**
 * The full crawlable document. It is injected INSIDE #root; React's createRoot
 * replaces it wholesale on mount (no hydration — main.tsx uses createRoot), so
 * humans see it only as a fast content-first paint and it is never hidden
 * (display:none would read as cloaking to Google).
 */
export function renderBodyHtml(site: SeoSite, works: Work[], activities: Activity[]): string {
  const worksHtml = works
    .map((w) => {
      const tech =
        w.tech.length > 0
          ? `<ul class="tech">${w.tech.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
          : '';
      return (
        `<article id="work-${escapeHtml(w.id)}">` +
        `<h3>${escapeHtml(w.title)}</h3>` +
        `<p class="meta">${escapeHtml(w.status)} · ${escapeHtml(w.year)}</p>` +
        `<p>${escapeHtml(w.tagline)}</p>` +
        tech +
        workLinksHtml(w) +
        `</article>`
      );
    })
    .join('');

  const activitiesHtml = activities
    .map(
      (a) =>
        `<li><time datetime="${escapeHtml(a.date)}">${escapeHtml(formatMonth(a.date))}</time> ` +
        `<strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.summary)}${activityLinksHtml(a)}</li>`,
    )
    .join('');

  const stackHtml = site.techStack
    .map((g) => `<dt>${escapeHtml(g.label)}</dt><dd>${escapeHtml(g.items.join(', '))}</dd>`)
    .join('');

  const sameAsHtml = site.sameAs
    .map((u) => `<a href="${escapeHtml(u)}">${escapeHtml(u)}</a>`)
    .join(' · ');

  const faqHtml = FAQ.map(
    (f) => `<article><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></article>`,
  ).join('');

  const style =
    'max-width:880px;margin:0 auto;padding:2.5rem 1.25rem;' +
    "font-family:system-ui,-apple-system,'Segoe UI',sans-serif;" +
    'line-height:1.7;color:#1a1a1a;background:#fbf9f4';

  return (
    `<div id="seo-prerender" style="${style}">` +
    `<header>` +
    `<img src="${escapeHtml(site.image)}" alt="${escapeHtml(site.name)}（AIエンジニア / AI Engineer）のアイコン" width="96" height="96" loading="lazy" style="display:block;margin-bottom:0.75rem" />` +
    `<h1>${escapeHtml(site.name)}（しよを）— AIエンジニア / AI Engineer</h1>` +
    `<p>${escapeHtml(site.tagline)}</p>` +
    `<p>${escapeHtml(site.about)}</p>` +
    `<p>${escapeHtml(site.location)}</p>` +
    `<nav aria-label="目次"><ul>` +
    `<li><a href="#works">作品 (Works)</a></li>` +
    `<li><a href="#activity">経歴・活動 (Activity)</a></li>` +
    `<li><a href="#tech">技術スタック (Tech Stack)</a></li>` +
    `<li><a href="#faq">よくある質問 (FAQ)</a></li>` +
    `</ul></nav>` +
    `</header>` +
    `<section id="works"><h2>作品 (Works)</h2>` +
    `<p>AIエンジニアとして個人・チームで開発した、生成AI・LLM・機械学習の代表作です。</p>${worksHtml}</section>` +
    `<section id="activity"><h2>経歴・活動 (Activity)</h2>` +
    `<p>会津大学・大学院での研究、インターン、受賞・公開を時系列でまとめています。</p><ol>${activitiesHtml}</ol></section>` +
    `<section id="tech"><h2>技術スタック (Tech Stack)</h2>` +
    `<p>生成AI・LLMアプリ・AIエージェント・機械学習をプロダクト実装する主な技術です。</p><dl>${stackHtml}</dl></section>` +
    `<section id="faq"><h2>よくある質問 (FAQ)</h2>` +
    `<p>shiyow（しよを）についてよく聞かれる質問への回答です。</p>${faqHtml}</section>` +
    `<footer><p>${sameAsHtml}</p></footer>` +
    `</div>`
  );
}

type JsonLdNode = Record<string, unknown>;

/**
 * JSON-LD @graph: Person (with knowsAbout / alumniOf / worksFor), WebSite, an
 * ItemList of works, and one CreativeWork per work — generated from JSON so it
 * cannot drift from the page or carry hand-transcription typos.
 */
export function renderJsonLd(site: SeoSite, works: Work[]): JsonLdNode {
  const personId = `${site.url}#person`;
  const knowsAbout = Array.from(
    new Set([...site.knowsAbout, ...site.techStack.flatMap((g) => g.items)]),
  );

  const person: JsonLdNode = {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    alternateName: 'しよを',
    jobTitle: 'AIエンジニア / AI Engineer',
    description: site.about,
    url: site.url,
    image: `${origin(site.url)}${site.image}`,
    knowsAbout,
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.alumniOf },
    worksFor: { '@type': 'Organization', name: site.worksFor },
    sameAs: site.sameAs,
  };

  const faqPage: JsonLdNode = {
    '@type': 'FAQPage',
    '@id': `${site.url}#faq`,
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumb: JsonLdNode = {
    '@type': 'BreadcrumbList',
    '@id': `${site.url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: site.url },
      { '@type': 'ListItem', position: 2, name: '作品', item: `${site.url}#works` },
      { '@type': 'ListItem', position: 3, name: '経歴・活動', item: `${site.url}#activity` },
      { '@type': 'ListItem', position: 4, name: '技術スタック', item: `${site.url}#tech` },
      { '@type': 'ListItem', position: 5, name: 'FAQ', item: `${site.url}#faq` },
    ],
  };

  const website: JsonLdNode = {
    '@type': 'WebSite',
    '@id': `${site.url}#website`,
    name: site.siteName,
    url: site.url,
    inLanguage: 'ja',
    publisher: { '@id': personId },
  };

  const itemList: JsonLdNode = {
    '@type': 'ItemList',
    '@id': `${site.url}#works`,
    name: 'Works',
    numberOfItems: works.length,
    itemListElement: works.map((w, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: workUrl(w, site.url),
      name: w.title,
    })),
  };

  const creativeWorks: JsonLdNode[] = works.map((w) => {
    const node: JsonLdNode = {
      '@type': 'CreativeWork',
      '@id': `${site.url}#work-${w.id}`,
      name: w.title,
      description: w.tagline,
      keywords: w.tech.join(', '),
      url: workUrl(w, site.url),
      datePublished: String(w.year),
      inLanguage: 'ja',
      creator: { '@id': personId },
    };
    if (w.image) node.image = `${origin(site.url)}${w.image}`;
    return node;
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [person, website, faqPage, breadcrumb, itemList, ...creativeWorks],
  };
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

/** Minimal, valid sitemap. Single-URL today; ready to accept per-work URLs later. */
export function renderSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${escapeHtml(e.loc)}</loc>` +
        (e.lastmod ? `<lastmod>${escapeHtml(e.lastmod)}</lastmod>` : '') +
        `</url>`,
    )
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

/**
 * /llms.txt — the emerging LLMO convention: a plain-Markdown digest of the site
 * for AI assistants. Generated from the same grounded data so it never drifts.
 */
export function renderLlmsTxt(site: SeoSite, works: Work[], activities: Activity[]): string {
  const lines: string[] = [
    `# ${site.name}（しよを）— AIエンジニア / AI Engineer`,
    '',
    `> ${site.tagline}`,
    '',
    site.about,
    '',
    '## Works（作品）',
    ...works.map(
      (w) => `- [${w.title}](${workUrl(w, site.url)})（${w.status}・${w.year}）: ${w.tagline}`,
    ),
    '',
    '## Activity（経歴・活動）',
    ...activities.map((a) => `- ${formatMonth(a.date)} ${a.title}: ${a.summary}`),
    '',
    '## Tech Stack（技術スタック）',
    ...site.techStack.map((g) => `- ${g.label}: ${g.items.join(', ')}`),
    '',
    '## FAQ',
    ...FAQ.flatMap((f) => [`- Q: ${f.q}`, `  A: ${f.a}`]),
    '',
    '## Links',
    `- Site: ${site.url}`,
    ...site.sameAs.map((u) => `- ${u}`),
    '',
  ];
  return lines.join('\n');
}
