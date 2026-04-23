import { Link } from 'react-router-dom';
import { PROFILE } from '../lib/profile';
import { Reveal } from '../components/motion/Reveal';

const CHARACTER_SRC = '/characters/shiyow.png';

const STAT_BAR_COLOR: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
};

export function About() {
  const xpPct = Math.min(100, Math.round((PROFILE.xp / PROFILE.xpNext) * 100));

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-12 md:py-16 relative">
      <header className="mb-12">
        <div className="inline-block bg-tertiary-container px-5 py-1.5 border-4 border-tertiary mb-4">
          <span className="font-black text-on-tertiary-container uppercase tracking-tighter text-sm">
            Character Sheet
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none">
          Status: <span className="text-primary">{PROFILE.classTitle.split(' / ')[0]}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-8">
          <Reveal as="section" className="relative bg-surface-container-high pixel-border p-1">
            <div className="bg-surface-container-lowest border-2 border-outline-variant p-6">
              <div className="relative flex flex-col items-center mb-8">
                <div className="w-48 h-48 bg-surface-container-high border-4 border-tertiary flex items-center justify-center overflow-hidden">
                  <img
                    src={CHARACTER_SRC}
                    alt={`${PROFILE.name} portrait`}
                    className="w-full h-full object-contain pixelated"
                    draggable={false}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-tertiary/90 text-on-tertiary text-center text-[10px] py-1 font-black uppercase tracking-widest">
                  Status · Creative
                </div>
                <div className="absolute -top-3 -right-3 bg-secondary text-on-secondary px-3 py-1 font-black text-lg border-4 border-secondary-dim shadow-[4px_4px_0_0_rgba(0,109,28,0.3)]">
                  LVL {PROFILE.level}
                </div>
              </div>

              <div className="space-y-3">
                <Row label="Name" value={PROFILE.name} valueClass="text-on-surface" />
                <Row label="Class" value={PROFILE.classTitle} valueClass="text-primary" />
                <Row label="Region" value={PROFILE.location} valueClass="text-tertiary" />

                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                    <span className="text-tertiary">Experience</span>
                    <span className="text-on-surface-variant">
                      {PROFILE.xp.toLocaleString()} / {PROFILE.xpNext.toLocaleString()} EXP
                    </span>
                  </div>
                  <div className="h-4 bg-surface-container-high border-2 border-outline overflow-hidden">
                    <div
                      className="h-full bg-primary border-r-2 border-primary-dim"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                </div>

                {PROFILE.stats.map((stat) => {
                  const pct = Math.round((stat.value / stat.max) * 100);
                  return (
                    <div key={stat.label} className="pt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                        <span className="text-tertiary">{stat.label}</span>
                        <span className="text-on-surface-variant">
                          {stat.value} / {stat.max}
                        </span>
                      </div>
                      <div className="h-3 bg-surface-container-high border-2 border-outline overflow-hidden">
                        <div
                          className={`h-full ${STAT_BAR_COLOR[stat.color] ?? 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal
            as="section"
            className="relative bg-tertiary-container pixel-border p-6"
            delay={0.08}
          >
            <div className="absolute -top-3 left-6 bg-tertiary text-on-tertiary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Biography
            </div>
            <div className="border-2 border-tertiary/30 bg-surface/40 p-5 min-h-[160px]">
              <p className="text-base leading-relaxed font-medium text-on-tertiary-container">
                &ldquo;{PROFILE.bioQuote}&rdquo;
              </p>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal
            as="section"
            className="bg-surface-container pixel-border p-6 md:p-8"
            delay={0.04}
          >
            <header className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-on-surface">
                  Skills &amp; Tech Stack
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">
                  Loadout & arsenal
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-8 h-8 bg-secondary-container border-2 border-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined filled text-secondary text-base">
                    star
                  </span>
                </span>
                <span className="w-8 h-8 bg-primary-container border-2 border-primary flex items-center justify-center">
                  <span className="material-symbols-outlined filled text-primary text-base">
                    bolt
                  </span>
                </span>
              </div>
            </header>

            <ul className="space-y-4">
              {PROFILE.techStack.map((group, idx) => (
                <Reveal
                  key={group.id}
                  as="li"
                  delay={0.04 * idx}
                  className="bg-surface-container-lowest border-4 border-outline p-4 md:p-5 hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-surface-container-high border-2 border-outline-variant">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">
                        {group.icon}
                      </span>
                    </span>
                    <h3 className="font-black uppercase tracking-widest text-sm md:text-base text-tertiary">
                      {group.label}
                    </h3>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {group.items.length} slots
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="text-xs font-black uppercase tracking-widest px-2 py-1 bg-tertiary-container text-on-tertiary-container border-2 border-tertiary/40"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </ul>

            <footer className="mt-8 border-t-4 border-outline-variant pt-6">
              <h3 className="font-black uppercase tracking-widest text-sm text-tertiary mb-3">
                Passive Perks
              </h3>
              <ul className="space-y-2">
                {PROFILE.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined filled text-secondary text-base mt-0.5">
                      check_circle
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </footer>
          </Reveal>

          <Reveal
            as="section"
            className="mt-8 bg-surface-container-lowest pixel-border p-6 md:p-8"
            delay={0.12}
          >
            <h3 className="text-xl font-black uppercase tracking-tighter text-on-surface mb-6">
              Recent Milestones
            </h3>
            <ol className="space-y-4">
              {PROFILE.history.map((event, idx) => (
                <Reveal as="li" key={event.year} className="flex gap-5" delay={0.04 * idx}>
                  <span className="bg-tertiary text-on-tertiary px-3 py-1 h-fit font-black text-xs tracking-widest uppercase">
                    {event.year}
                  </span>
                  <div>
                    <h4 className="font-black uppercase tracking-tight">{event.title}</h4>
                    <p className="text-sm text-on-surface-variant">{event.detail}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Link to="/gallery" className="pixel-button pixel-button--tertiary mt-6 inline-flex">
              See full quest log
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-end border-b-4 border-surface-container-high pb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">
        {label}
      </span>
      <span className={['text-lg font-black uppercase', valueClass].filter(Boolean).join(' ')}>
        {value}
      </span>
    </div>
  );
}
