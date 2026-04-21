import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORY_LABEL,
  WORKS,
  filterByCategory,
  listCategories,
  type Work,
  type WorkCategory,
} from '../lib/works';

const STATUS_LABEL: Record<Work['status'], string> = {
  new: 'New',
  stable: 'Stable',
  wip: 'WIP',
};

const STATUS_COLOR: Record<Work['status'], string> = {
  new: 'bg-secondary text-on-secondary',
  stable: 'bg-primary text-on-primary',
  wip: 'bg-tertiary text-on-tertiary',
};

export function Gallery() {
  const categories = useMemo(() => listCategories(), []);
  const [active, setActive] = useState<WorkCategory | 'all'>('all');

  const works = filterByCategory(active);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-12 md:py-16 relative">
      <header className="mb-10">
        <div className="inline-block bg-tertiary-container px-5 py-1.5 border-4 border-tertiary mb-4">
          <span className="font-black text-on-tertiary-container uppercase tracking-tighter text-sm">
            Quest Log
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-tertiary leading-none">
          The Archive of Completed Tasks
        </h1>
        <p className="mt-4 text-on-surface-variant max-w-2xl">
          ゲーム・Web
          制作・イラスト・プロトタイプをまとめて保管するアーカイブ。カテゴリフィルタで絞り込み可能。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <nav
              aria-label="Category filter"
              className="bg-surface-container-low pixel-border p-4 space-y-2"
            >
              <h2 className="text-[11px] font-black uppercase tracking-widest text-tertiary mb-3">
                Filter · Genre
              </h2>
              {categories.map((cat) => {
                const isActive = active === cat;
                const count =
                  cat === 'all' ? WORKS.length : WORKS.filter((w) => w.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(cat)}
                    className={[
                      'w-full flex items-center justify-between p-3 border-b-4 text-left text-sm font-black uppercase tracking-widest transition-colors',
                      isActive
                        ? 'bg-primary text-on-primary border-primary-dim'
                        : 'bg-surface-container-highest text-on-surface border-outline-variant hover:bg-primary-container hover:border-primary',
                    ].join(' ')}
                  >
                    <span>{CATEGORY_LABEL[cat]}</span>
                    <span className="text-[10px] opacity-80">{count}</span>
                  </button>
                );
              })}
            </nav>

            <aside className="bg-tertiary-container pixel-border p-4 relative">
              <div className="absolute -top-3 left-4 bg-tertiary text-on-tertiary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Tip
              </div>
              <p className="text-xs font-bold text-on-tertiary-container leading-snug mt-3">
                「Source Code があるものは GitHub リンクから覗けます」
              </p>
            </aside>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {works.length === 0 ? (
            <div className="pixel-border bg-surface-container-lowest p-12 text-center">
              <p className="font-black uppercase tracking-widest text-tertiary">
                このジャンルはまだ収録していません
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {works.map((work) => (
                <article
                  key={work.id}
                  className="bg-surface-container-highest pixel-border flex flex-col hover:-translate-y-1 transition-transform"
                >
                  <Link to={`/works/${work.id}`} className="contents">
                    <div className="relative h-44 overflow-hidden border-b-4 border-tertiary">
                      <img
                        src={work.cover}
                        alt={work.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <span
                        className={[
                          'absolute top-2 right-2 text-[10px] font-black uppercase tracking-widest px-2 py-1',
                          STATUS_COLOR[work.status],
                        ].join(' ')}
                      >
                        {STATUS_LABEL[work.status]}
                      </span>
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-widest bg-surface-container-lowest/95 px-2 py-1 text-tertiary">
                        {CATEGORY_LABEL[work.category]}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-black uppercase leading-tight text-tertiary">
                          {work.title}
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-tertiary/10 px-2 py-0.5 text-tertiary">
                          v{work.version}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 flex-1">{work.tagline}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {work.tags.slice(0, 3).map((tag) => (
                          <li
                            key={tag}
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary-container text-on-primary-container"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
