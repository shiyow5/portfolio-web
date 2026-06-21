/**
 * Fact cards: the grounding layer for the shiyow clone agent.
 *
 * The clone must answer ONLY from these cards (career facts are non-negotiable
 * truth). Every card carries a stable `[type:slug]` id so the model can cite
 * its source and a downstream guard can strip any citation it invents.
 *
 * Single source of truth — derived from the same JSON the site renders, so the
 * chat can never drift from what a recruiter sees on the page.
 */
import { WORKS } from '../works';
import { ACTIVITIES, formatDate } from '../activity';
import { PROFILE } from '../profile';

/** Every citation id the clone is allowed to emit. */
export function factCardIds(): ReadonlySet<string> {
  const ids = new Set<string>(['prof:identity']);
  for (const w of WORKS) ids.add(`work:${w.id}`);
  for (const a of ACTIVITIES) ids.add(`act:${a.id}`);
  for (const g of PROFILE.techStack) ids.add(`prof:${g.id}`);
  return ids;
}

function workLinks(links: (typeof WORKS)[number]['links']): string {
  const urls: string[] = [];
  if (links.github) urls.push(links.github);
  if (links.demo) urls.push(links.demo);
  if (links.play) urls.push(links.play);
  for (const s of links.sources ?? []) urls.push(`${s.label}: ${s.url}`);
  return urls.length ? urls.join(' , ') : 'なし';
}

/**
 * Serializes works / profile / activity into one id-tagged, citable block.
 * The whole corpus is ~3K tokens, so it is injected wholesale — no retrieval,
 * no top-k, no chance of dropping a relevant fact.
 */
export function buildFactCards(): string {
  const identity = `- [prof:identity] 名前: ${PROFILE.name} / 肩書き: ${PROFILE.classTitle} / 所在: ${PROFILE.location}`;
  const groups = PROFILE.techStack.map((g) => `- [prof:${g.id}] ${g.label}: ${g.items.join(', ')}`);

  const works = WORKS.map(
    (w) =>
      `- [work:${w.id}] ${w.title}（${w.year}・${w.status}）: ${w.tagline} ` +
      `技術: ${w.tech.join(', ')}. リンク: ${workLinks(w.links)}`,
  );

  const activities = ACTIVITIES.map((a) => {
    const sources = a.links.map((l) => `${l.label}: ${l.url}`).join(' , ');
    const base = `- [act:${a.id}] ${formatDate(a.date)} ${a.title} — ${a.summary}`;
    return sources ? `${base} 出典: ${sources}` : base;
  });

  return [
    '# 事実カード（FACT CARDS）',
    'このカードに書かれた内容だけを根拠に回答する。各事実主張には対応する [id] を必ず付ける。',
    '',
    '## プロフィール',
    identity,
    ...groups,
    '',
    '## 作品',
    ...works,
    '',
    '## 活動年表',
    ...activities,
  ].join('\n');
}
