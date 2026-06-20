import {
  ACTIVITIES,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  formatDate,
  groupByYear,
  type Activity,
} from '../lib/activity';
import { Reveal } from '../components/motion/Reveal';

function countByCategory(list: Activity[]) {
  const counts = new Map<Activity['category'], number>();
  for (const a of list) {
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  return counts;
}

export function Changelog() {
  const years = groupByYear();
  const latest = ACTIVITIES[0];
  const counts = countByCategory(ACTIVITIES);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
      <header className="mb-12 relative">
        <div className="inline-block bg-tertiary-container px-5 py-1.5 border-4 border-tertiary mb-4">
          <span className="font-black text-on-tertiary-container uppercase tracking-tighter text-sm">
            Activity Log
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none">
          Development <br />
          <span className="text-primary">Chronicles</span>
        </h1>
        <p className="mt-4 text-on-surface-variant max-w-2xl">
          リリース・イベント・執筆・仕事など shiyow の活動履歴を時系列でまとめた記録。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-8">
          <div className="bg-surface-container-low pixel-border border-l-8 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-tertiary">history</span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-tertiary">
                Patch Notes &amp; History
              </h2>
            </div>

            {years.map((group, yi) => (
              <section key={group.year} className="mb-10 last:mb-0">
                <Reveal as="header" className="flex items-center gap-3 mb-4" delay={yi * 0.04}>
                  <span className="font-pixel text-[10px] text-primary">////</span>
                  <h3 className="font-black text-2xl md:text-3xl tracking-tighter text-on-surface">
                    {group.year}
                  </h3>
                  <span className="flex-1 border-t-4 border-outline-variant opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    {group.entries.length} events
                  </span>
                </Reveal>

                <ol className="relative">
                  <span
                    className="absolute left-[11px] top-2 bottom-2 w-1 bg-outline-variant opacity-30"
                    aria-hidden
                  />
                  {group.entries.map((activity, idx) => (
                    <Reveal
                      key={activity.id}
                      as="li"
                      delay={Math.min(idx * 0.05, 0.25)}
                      className="relative pl-10 pb-8 last:pb-0"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-1 w-6 h-6 border-4 border-surface-container-low bg-primary ring-4 ring-primary-container z-10"
                      />
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2 gap-1">
                        <h4 className="font-black text-lg text-on-surface">{activity.title}</h4>
                        <span className="font-black text-[10px] uppercase tracking-widest bg-surface-container-highest px-3 py-1 text-on-surface-variant">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-5 border-2 border-outline-variant hover:border-primary transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={[
                              'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1',
                              CATEGORY_COLOR[activity.category],
                            ].join(' ')}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {CATEGORY_ICON[activity.category]}
                            </span>
                            {CATEGORY_LABEL[activity.category]}
                          </span>
                          {activity.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-tertiary-container text-on-tertiary-container"
                            >
                              [{tag}]
                            </span>
                          ))}
                        </div>
                        <p className="text-on-surface leading-relaxed text-sm mb-3">
                          {activity.summary}
                        </p>
                        {activity.links.length > 0 && (
                          <ul className="flex flex-wrap gap-2">
                            {activity.links.map((link) => (
                              <li key={link.url}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-wipe text-xs font-black uppercase tracking-widest text-primary"
                                >
                                  {link.label} ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <section
            className="bg-tertiary text-on-tertiary pixel-border border-[#502f09] p-6"
            style={{ backgroundColor: 'var(--color-tertiary)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">
                  Most Recent
                </div>
                <div className="text-2xl md:text-3xl font-black leading-tight">
                  {latest?.title ?? '—'}
                </div>
              </div>
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            {latest && (
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Category</span>
                  <span
                    className={`px-2 py-0.5 ${CATEGORY_COLOR[latest.category]} text-[10px] tracking-widest`}
                  >
                    {CATEGORY_LABEL[latest.category]}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Shipped</span>
                  <span>{formatDate(latest.date)}</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed pt-2 border-t-2 border-tertiary-dim">
                  {latest.summary}
                </p>
              </div>
            )}
          </section>

          <section className="pixel-border bg-surface-container p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-3 border-b-2 border-tertiary pb-1">
              Activity Breakdown
            </h3>
            <ul className="space-y-1.5">
              {(Object.keys(CATEGORY_LABEL) as Array<keyof typeof CATEGORY_LABEL>).map((cat) => {
                const n = counts.get(cat) ?? 0;
                return (
                  <li
                    key={cat}
                    className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 border-2 border-outline-variant text-sm"
                  >
                    <span className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-tertiary">
                      <span className="material-symbols-outlined text-base">
                        {CATEGORY_ICON[cat]}
                      </span>
                      {CATEGORY_LABEL[cat]}
                    </span>
                    <span className="font-pixel text-xs text-primary">{n}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="pixel-border bg-surface-container p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-3 border-b-2 border-tertiary pb-1">
              Connect with the Party
            </h3>
            <ul className="space-y-2">
              {[
                {
                  label: 'Source Code',
                  detail: 'GitHub · shiyow5',
                  href: 'https://github.com/shiyow5',
                  icon: 'code',
                },
                {
                  label: 'Guild Hall',
                  detail: 'Discord · 調整中',
                  href: '#',
                  icon: 'forum',
                },
                {
                  label: 'Broadcast',
                  detail: 'X / Twitter',
                  href: '#',
                  icon: 'campaign',
                },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-surface-container-lowest border-2 border-outline-variant hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">{link.icon}</span>
                    <div className="flex-1">
                      <div className="font-black text-sm uppercase tracking-tight">
                        {link.label}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {link.detail}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
