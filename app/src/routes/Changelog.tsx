import { RELEASES, type ChangeKind, type ReleaseStatus } from '../lib/changelog';

const KIND_COLOR: Record<ChangeKind, string> = {
  feature: 'text-secondary',
  fix: 'text-error',
  chore: 'text-tertiary',
  ci: 'text-primary',
  docs: 'text-on-surface-variant',
};

const KIND_ICON: Record<ChangeKind, string> = {
  feature: 'auto_awesome',
  fix: 'bug_report',
  chore: 'construction',
  ci: 'bolt',
  docs: 'menu_book',
};

const STATUS_COLOR: Record<ReleaseStatus, string> = {
  planned: 'bg-tertiary text-on-tertiary',
  stable: 'bg-primary text-on-primary',
  wip: 'bg-secondary text-on-secondary',
};

const STATUS_LABEL: Record<ReleaseStatus, string> = {
  planned: 'Planned',
  stable: 'Stable',
  wip: 'WIP',
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}

export function Changelog() {
  const latest = RELEASES.find((r) => r.status === 'stable') ?? RELEASES[0];

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
      <header className="mb-12 relative">
        <div className="inline-block bg-tertiary-container px-5 py-1.5 border-4 border-tertiary mb-4">
          <span className="font-black text-on-tertiary-container uppercase tracking-tighter text-sm">
            System Terminal
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none">
          Development <br />
          <span className="text-primary">Chronicles</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-8">
          <div className="bg-surface-container-low pixel-border border-l-8 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-tertiary">history</span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-tertiary">
                Patch Notes & History
              </h2>
            </div>

            <ol className="relative">
              <span
                className="absolute left-[11px] top-2 bottom-2 w-1 bg-outline-variant opacity-30"
                aria-hidden
              />
              {RELEASES.map((release) => (
                <li key={release.version} className="relative pl-10 pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className={[
                      'absolute left-0 top-1 w-6 h-6 border-4 border-surface-container-low z-10',
                      release.status === 'stable'
                        ? 'bg-primary ring-4 ring-primary-container'
                        : release.status === 'planned'
                          ? 'bg-tertiary ring-4 ring-tertiary-container'
                          : 'bg-secondary ring-4 ring-secondary-container',
                    ].join(' ')}
                  />
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2 gap-1">
                    <h3 className="font-black text-lg md:text-xl text-on-surface">
                      v{release.version}: <span className="text-primary">{release.codename}</span>
                    </h3>
                    <span className="font-black text-[10px] uppercase tracking-widest bg-surface-container-highest px-3 py-1 text-on-surface-variant">
                      {formatDate(release.date)}
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-5 border-2 border-outline-variant hover:border-primary transition-colors">
                    <p className="text-on-surface mb-4 leading-relaxed">{release.summary}</p>
                    <ul className="space-y-2 text-sm text-on-surface-variant">
                      {release.entries.map((entry, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            className={[
                              'material-symbols-outlined text-lg shrink-0 mt-0.5',
                              KIND_COLOR[entry.kind],
                            ].join(' ')}
                          >
                            {KIND_ICON[entry.kind]}
                          </span>
                          <span>{entry.text}</span>
                        </li>
                      ))}
                    </ul>
                    {release.tags.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {release.tags.map((tag) => (
                          <li
                            key={tag}
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-tertiary-container text-on-tertiary-container"
                          >
                            [{tag}]
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-tertiary text-on-tertiary pixel-border border-[#502f09] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">
                  Current Build
                </div>
                <div className="text-2xl md:text-3xl font-black">
                  {latest.status === 'stable' ? 'STABLE' : latest.status.toUpperCase()}{' '}
                  {latest.version}
                </div>
              </div>
              <span className="material-symbols-outlined text-3xl">cloud_done</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span>Status</span>
                <span
                  className={`px-2 py-0.5 ${STATUS_COLOR[latest.status]} text-[10px] tracking-widest`}
                >
                  {STATUS_LABEL[latest.status]}
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
