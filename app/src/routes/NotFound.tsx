import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24 text-center">
      <h1 className="text-7xl font-black uppercase tracking-tighter text-tertiary">404</h1>
      <p className="mt-4 text-on-surface-variant uppercase tracking-widest text-sm">
        Map not found in this world.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 pixel-button"
      >
        Return to Atelier
      </Link>
    </section>
  );
}
