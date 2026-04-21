import { useParams } from 'react-router-dom';

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-16">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-tertiary">Work</h1>
      <p className="mt-4 text-on-surface-variant">id: {id ?? '?'} — 準備中。</p>
    </section>
  );
}
