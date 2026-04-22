import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Swords,
  User,
  LayoutGrid,
  Brush,
  Code2,
  Palette,
  Gem,
  Lock,
} from 'lucide-react';
import { WanderingCharacter } from '../components/pixel/WanderingCharacter';
import { Reveal } from '../components/motion/Reveal';
const CHARACTER_SRC = '/characters/shiyow.png';
const ROOM_SRC = '/rooms/simple_room.png';

const SIDE_NAV = [
  { icon: Swords, label: 'Adventure', to: '/gallery' },
  { icon: User, label: 'Status', to: '/about' },
  { icon: LayoutGrid, label: 'Collection', to: '/gallery' },
];

const INVENTORY = [
  { icon: Brush, label: 'Pixel Art', unlocked: true },
  { icon: Code2, label: 'Frontend', unlocked: true },
  { icon: Palette, label: 'UI Design', unlocked: true },
  { icon: Gem, label: 'Gamedev', unlocked: true },
  { icon: Lock, label: 'Locked', unlocked: false },
  { icon: Lock, label: 'Locked', unlocked: false },
];

const FEATURED = [
  {
    id: 'aether-drift',
    tag: 'Concept Art',
    title: 'The Neon Dungeon',
    desc: 'A cyberpunk-inspired dungeon crawler asset pack featuring 500+ handcrafted elements.',
    xp: 'Gold Earned · 1,200',
    size: 'lg',
  },
  {
    id: 'neon-circuit',
    tag: '[Animation]',
    title: 'Sprite Sheets',
    desc: '',
    xp: '',
    size: 'sm',
  },
  {
    id: 'loot-logic',
    tag: '[UI/UX]',
    title: 'Menu Systems',
    desc: '',
    xp: '',
    size: 'sm',
  },
];

export function Home() {
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
                  shiyow · Lvl 99
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
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-tertiary mb-2">
              Level 1: Home
            </h1>
            <div className="h-2 w-32 bg-primary mx-auto" />
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
                Current Quest
              </h3>
              <p className="text-sm font-bold text-on-surface">Redesigning the Multiverse</p>
              <div className="w-full bg-surface-container-low h-4 mt-2 pixel-border-thin">
                <div className="bg-secondary h-full" style={{ width: '35%' }} />
              </div>
              <p className="text-[10px] uppercase font-black mt-1 text-right tracking-widest">
                35% Complete
              </p>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-tertiary border-b-2 border-tertiary pb-1 mb-3">
                Inventory
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {INVENTORY.map(({ icon: Icon, label, unlocked }, i) => (
                  <div
                    key={i}
                    title={label}
                    className={[
                      'aspect-square bg-surface pixel-border-thin flex items-center justify-center transition-transform',
                      unlocked
                        ? 'hover:-translate-y-0.5 cursor-help text-primary'
                        : 'opacity-40 text-outline',
                    ].join(' ')}
                  >
                    <Icon size={20} />
                  </div>
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
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-on-surface">
            Recent Loot
          </h2>
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
              <div className="h-60 md:h-64 bg-gradient-to-br from-primary-container to-secondary-container border-b-4 border-tertiary" />
              <div className="p-6 flex-grow flex flex-col">
                <span className="inline-block px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
                  {FEATURED[0].tag}
                </span>
                <h3 className="text-2xl font-black uppercase mb-2 text-on-surface">
                  {FEATURED[0].title}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">{FEATURED[0].desc}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-tertiary tracking-widest">
                    {FEATURED[0].xp}
                  </span>
                  <ArrowRight size={20} className="text-primary" />
                </div>
              </div>
            </Link>
          </Reveal>

          {/* Small 1 & 2 */}
          {FEATURED.slice(1).map((f, i) => (
            <Reveal key={f.id} delay={0.08 * (i + 1)}>
              <Link
                to={`/works/${f.id}`}
                className="block h-full bg-surface-container-lowest pixel-border p-4 hover:-translate-y-1 transition-transform"
              >
                <div className="h-32 bg-gradient-to-br from-tertiary-container to-primary-container mb-4 border-2 border-outline-variant" />
                <h4 className="font-black uppercase text-sm mb-1 text-on-surface">{f.title}</h4>
                <p className="text-xs text-on-surface-variant uppercase font-black tracking-widest">
                  {f.tag}
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
              <Link to="/gallery" className="pixel-button whitespace-nowrap">
                Start Quest
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </section>
  );
}
