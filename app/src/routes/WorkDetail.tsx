import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { CATEGORY_LABEL, findWork } from '../lib/works';

function GithubMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.26 5.69.41.35.78 1.04.78 2.1 0 1.52-.01 2.75-.01 3.12 0 .3.21.66.79.55C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

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
                <GithubMark size={14} /> Code
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
              Quest Log · About
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
              Loot Drop · Contact
            </div>
            <p className="text-xs font-bold text-on-tertiary-container leading-snug mt-2">
              この実績について詳しく知りたい採用担当の方は{' '}
              <Link to="/contact" className="underline font-black hover:text-primary">
                Contact ページ
              </Link>{' '}
              か、右下の AI クローンへどうぞ。
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
