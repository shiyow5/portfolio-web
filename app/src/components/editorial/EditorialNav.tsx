import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMode } from '../../lib/mode';

const LINKS = [
  { href: '#work', label: 'Work', n: '01' },
  { href: '#stack', label: 'Stack', n: '02' },
  { href: '#activity', label: 'Activity', n: '03' },
  { href: '#contact', label: 'Contact', n: '04' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function Burger({ open, tone }: { open: boolean; tone: string }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <motion.span
        className={`absolute left-0 right-0 h-[2px] ${tone}`}
        style={{ top: '2px' }}
        animate={open ? { rotate: 45, top: '50%', y: '-50%' } : { rotate: 0, top: '2px', y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      />
      <motion.span
        className={`absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 ${tone}`}
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className={`absolute left-0 right-0 h-[2px] ${tone}`}
        style={{ bottom: '2px' }}
        animate={
          open ? { rotate: -45, bottom: '50%', y: '50%' } : { rotate: 0, bottom: '2px', y: 0 }
        }
        transition={{ duration: 0.25, ease: EASE }}
      />
    </span>
  );
}

export function EditorialNav() {
  const { setMode } = useMode();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const focusables = () =>
      Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-on-surface bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3">
          <a href="#top" className="text-lg font-black uppercase tracking-tighter">
            Shiyow
          </a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-on-surface-variant sm:inline">
                View
              </span>
              <div className="flex items-center border-2 border-on-surface font-mono text-[11px] uppercase tracking-widest">
                <span aria-current="true" className="bg-on-surface px-2.5 py-1.5 text-surface">
                  Editorial
                </span>
                <button
                  type="button"
                  onClick={() => setMode('terminal')}
                  aria-label="Switch to terminal mode"
                  className="px-2.5 py-1.5 hover:bg-on-surface/10"
                >
                  {'>_'} Terminal
                </button>
              </div>
            </div>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="flex items-center gap-2 border-2 border-on-surface px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-colors"
            >
              <Burger open={false} tone="bg-current" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[100] flex flex-col bg-on-surface text-surface"
          >
            <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-4">
              <span className="font-mono text-xs uppercase tracking-widest text-surface/60">
                shiyow.dev / menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-surface/80 hover:text-surface"
              >
                <Burger open tone="bg-surface" />
                Close
              </button>
            </div>

            <nav className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-center px-6">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: EASE }}
                  className="group flex items-baseline gap-5 border-t-2 border-surface/15 py-5 last:border-b-2"
                >
                  <span className="font-mono text-sm text-surface/70">{l.n}</span>
                  <span className="text-5xl font-black uppercase leading-none tracking-tighter transition-colors group-hover:text-primary md:text-8xl">
                    {l.label}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto self-center font-mono text-surface/50 transition-transform group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mx-auto flex w-full max-w-[1180px] flex-wrap gap-6 px-6 py-8 font-mono text-xs uppercase tracking-widest text-surface/70"
            >
              <button
                type="button"
                onClick={() => {
                  setMode('terminal');
                  setOpen(false);
                }}
                className="hover:text-primary"
              >
                {'>_'} Terminal mode
              </button>
              <a
                href="https://x.com/twinS_KNSN1415"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                X ↗
              </a>
              <a
                href="https://github.com/shiyow5"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                GitHub ↗
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
