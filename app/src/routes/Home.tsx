import { Link } from 'react-router-dom';
import { ArrowRight, Swords, User, LayoutGrid, Bot } from 'lucide-react';
import { WanderingCharacter } from '../components/pixel/WanderingCharacter';
import { Reveal } from '../components/motion/Reveal';
import { PROFILE } from '../lib/profile';
import {
  ACTIVITIES,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  formatDate,
} from '../lib/activity';
import { WORKS, CATEGORY_LABEL as WORK_CATEGORY_LABEL } from '../lib/works';
const CHARACTER_SRC = '/characters/shiyow.png';
const ROOM_SRC = '/rooms/simple_room.png';

const SIDE_NAV = [
  { icon: Swords, label: 'Adventure', to: '/gallery' },
  { icon: User, label: 'Status', to: '/about' },
  { icon: LayoutGrid, label: 'Collection', to: '/gallery' },
];

const INVENTORY_GROUPS = PROFILE.techStack.slice(0, 6);
const LATEST_ACTIVITY = ACTIVITIES[0];

// Recent Loot bento: the three most recent works, wired to real catalogue data.
const FEATURED = WORKS.slice(0, 3);

export function Home() {
  const openChat = () => window.dispatchEvent(new CustomEvent('shiyow:open-chat'));

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-12 md:py-20 relative">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Profile Sidebar */}
        <Reveal as="aside" className="lg:col-span-3 order-2 lg:order-1">
          <div className="pixel-border bg-tertiary-container p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-surface pixel-border-thin flex items-center justify-center overflow-hidden">
                <img
                  src={CHARACTER_SRC}
                  alt="shiyow avatar"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-tertiary">
                  Profile
                </p>
                <p className="text-sm font-black uppercase text-on-tertiary-container">
                  shiyow · Lvl {PROFILE.level}
                </p>
              </div>
            </div>

            <nav className="space-y-3">
              {SIDE_NAV.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 p-3 bg-surface hover:bg-primary hover:text-on-primary transition-colors pixel-border-thin"
                >
                  <Icon size={18} />
                  <span className="font-black uppercase tracking-wider text-sm">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 p-4 bg-surface-container-low pixel-border-thin text-[12px] leading-snug text-on-surface-variant italic">
              &ldquo;The pixels are warm today. Perfect for crafting new worlds.&rdquo;
            </div>
          </div>
        </Reveal>

        {/* Center Stage */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
          <div className="mb-8 text-center">
            <span className="inline-block bg-tertiary-container px-3 py-1 border-2 border-tertiary text-[10px] font-black uppercase tracking-widest text-on-tertiary-container mb-4">
              Level 1: Home
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-tertiary leading-none">
              Shiyow
            </h1>
            <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary mt-1">
              AI Engineer
            </p>
            <p className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto mt-4 normal-case">
              LLM アプリ・AI エージェント・ML をプロダクトとして実装します。
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button type="button" onClick={openChat} className="pixel-button">
                <Bot size={16} /> AI クローンと話す
              </button>
              <Link to="/gallery" className="pixel-button pixel-button--tertiary">
                実績を見る
              </Link>
            </div>
            <div className="h-2 w-32 bg-primary mx-auto mt-8" />
          </div>

          <div className="relative w-full max-w-[600px] aspect-square bg-surface-container-high pixel-border overflow-hidden">
            <img
              src={ROOM_SRC}
              alt="Cozy isometric workshop"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            <WanderingCharacter src={CHARACTER_SRC} width={22} />
          </div>
        </div>

        {/* Right: Quest + Inventory */}
        <Reveal as="aside" className="lg:col-span-3 order-3" delay={0.1}>
          <div className="pixel-border bg-surface-container-highest p-6 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-tertiary border-b-2 border-tertiary pb-1 mb-3">
                Latest Activity
              </h3>
              {LATEST_ACTIVITY ? (
                <Link
                  to="/changelog"
                  className="block group"
                  aria-label={`最新の活動: ${LATEST_ACTIVITY.title}`}
                >
                  <p className="text-sm font-black text-on-surface leading-snug group-hover:text-primary transition-colors">
                    {LATEST_ACTIVITY.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={[
                        'inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5',
                        CATEGORY_COLOR[LATEST_ACTIVITY.category],
                      ].join(' ')}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {CATEGORY_ICON[LATEST_ACTIVITY.category]}
                      </span>
                      {CATEGORY_LABEL[LATEST_ACTIVITY.category]}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-auto">
                      {formatDate(LATEST_ACTIVITY.date)}
                    </span>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-on-surface-variant">記録はまだありません</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-tertiary border-b-2 border-tertiary pb-1 mb-3">
                Inventory · Tech Stack
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {INVENTORY_GROUPS.map((group) => (
                  <Link
                    key={group.id}
                    to="/about"
                    title={`${group.label} · ${group.items.length} items`}
                    aria-label={`${group.label} (${group.items.length} items)`}
                    className="aspect-square bg-surface pixel-border-thin flex flex-col items-center justify-center gap-1 hover:-translate-y-0.5 transition-transform text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">{group.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant leading-none">
                      {group.items.length}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className="pixel-button pixel-button--tertiary w-full block text-center"
            >
              View Stats
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Featured — Recent Loot bento */}
      <section className="mt-24 md:mt-32">
        <Reveal as="header" className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
              Selected Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-on-surface">
              Recent Loot
            </h2>
          </div>
          <div className="hidden md:block h-1 flex-grow mx-8 bg-surface-container-highest" />
          <Link
            to="/gallery"
            className="link-wipe text-primary font-black uppercase text-xs tracking-widest"
          >
            View All Quests
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Large */}
          <Reveal className="md:col-span-2 md:row-span-2" delay={0}>
            <Link
              to={`/works/${FEATURED[0].id}`}
              className="h-full bg-surface-container-lowest pixel-border flex flex-col hover:-translate-y-1 transition-transform"
            >
              <div className="h-60 md:h-64 border-b-4 border-tertiary overflow-hidden">
                <img
                  src={FEATURED[0].cover}
                  alt={FEATURED[0].title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <span className="inline-block px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
                  {WORK_CATEGORY_LABEL[FEATURED[0].category]}
                </span>
                <h3 className="text-2xl font-black uppercase mb-2 text-on-surface">
                  {FEATURED[0].title}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">{FEATURED[0].tagline}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-tertiary tracking-widest">
                    v{FEATURED[0].version} · {FEATURED[0].year}
                  </span>
                  <ArrowRight size={20} className="text-primary" />
                </div>
              </div>
            </Link>
          </Reveal>

          {/* Small 1 & 2 */}
          {FEATURED.slice(1).map((work, i) => (
            <Reveal key={work.id} delay={0.08 * (i + 1)}>
              <Link
                to={`/works/${work.id}`}
                className="block h-full bg-surface-container-lowest pixel-border p-4 hover:-translate-y-1 transition-transform"
              >
                <div className="h-32 mb-4 border-2 border-outline-variant overflow-hidden">
                  <img
                    src={work.cover}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                <h4 className="font-black uppercase text-sm mb-1 text-on-surface">{work.title}</h4>
                <p className="text-xs text-on-surface-variant uppercase font-black tracking-widest">
                  {WORK_CATEGORY_LABEL[work.category]}
                </p>
              </Link>
            </Reveal>
          ))}

          {/* CTA */}
          <Reveal className="md:col-span-2" delay={0.24}>
            <div className="h-full bg-primary-container pixel-border-primary p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black uppercase text-on-primary-container">
                  Ready for a new quest?
                </h3>
                <p className="text-sm text-on-primary-container opacity-80 mt-1">
                  作品のご相談、コラボ、コミッションを受付中です。
                </p>
              </div>
              <Link to="/contact" className="pixel-button whitespace-nowrap">
                相談する
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </section>
  );
}
