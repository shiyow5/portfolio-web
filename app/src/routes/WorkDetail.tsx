import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Play } from 'lucide-react';
import { CATEGORY_LABEL, findWork } from '../lib/works';

const STATUS_COPY: Record<string, string> = {
  new: 'Freshly dropped quest',
  stable: 'Stable and polished',
  wip: 'Work in progress',
};

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const work = findWork(id);

  if (!work) {
    return (
      <section className="max-w-[960px] mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-tertiary">
          Work not found
        </h1>
        <p className="mt-4 text-on-surface-variant">
          そのクエスト ID <code className="font-pixel text-primary">{id}</code> は記録にありません。
        </p>
        <Link to="/gallery" className="pixel-button mt-8 inline-flex">
          Back to Gallery
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
      <Link
        to="/gallery"
        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-tertiary hover:text-primary mb-6"
      >
        <ArrowLeft size={14} />
        Back to Gallery
      </Link>

      <header className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2 py-1 mb-3">
            {CATEGORY_LABEL[work.category]} · {work.year}
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none">
            {work.title}
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">{work.tagline}</p>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3 items-start lg:items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">
            Version {work.version} · {STATUS_COPY[work.status]}
          </span>
          <div className="flex flex-wrap gap-2">
            {work.links.play && (
              <a href={work.links.play} target="_blank" rel="noreferrer" className="pixel-button">
                <Play size={14} /> Play
              </a>
            )}
            {work.links.demo && (
              <a
                href={work.links.demo}
                target="_blank"
                rel="noreferrer"
                className="pixel-button pixel-button--tertiary"
              >
                <ExternalLink size={14} /> Demo
              </a>
            )}
            {work.links.github && (
              <a
                href={work.links.github}
                target="_blank"
                rel="noreferrer"
                className="pixel-button pixel-button--ghost"
              >
                <Github size={14} /> Code
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <figure className="bg-surface-container-high pixel-border p-2 overflow-hidden">
            <img
              src={work.cover}
              alt={work.title}
              className="w-full h-auto object-cover"
              draggable={false}
            />
          </figure>

          {work.gallery.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {work.gallery.slice(1).map((src, idx) => (
                <figure key={idx} className="pixel-border bg-surface-container-high p-1">
                  <img
                    src={src}
                    alt={`${work.title} screenshot ${idx + 2}`}
                    className="w-full h-auto object-cover"
                    draggable={false}
                  />
                </figure>
              ))}
            </div>
          )}

          <article className="bg-surface-container-lowest pixel-border p-6 md:p-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-tertiary mb-4">
              Quest Log
            </h2>
            <p className="text-on-surface leading-relaxed whitespace-pre-line">
              {work.description}
            </p>
          </article>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <section className="pixel-border bg-surface-container p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-3 border-b-2 border-tertiary pb-1">
              Tags
            </h3>
            <ul className="flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <li
                  key={tag}
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary-container text-on-primary-container"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>

          <section className="pixel-border bg-surface-container p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-3 border-b-2 border-tertiary pb-1">
              Tech Stack
            </h3>
            <ul className="space-y-2">
              {work.tech.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 border-2 border-outline-variant text-sm font-black uppercase tracking-tight"
                >
                  <span>{t}</span>
                  <span className="material-symbols-outlined filled text-secondary text-base">
                    check_circle
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pixel-border bg-tertiary-container p-5 relative">
            <div className="absolute -top-3 left-4 bg-tertiary text-on-tertiary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Loot Drop
            </div>
            <p className="text-xs font-bold text-on-tertiary-container leading-snug mt-2">
              コラボ・コミッションのご相談はチャット右下の UxtuU、または Contact リンクからどうぞ。
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
