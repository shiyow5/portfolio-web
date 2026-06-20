import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/contact', label: 'Contact' },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>('a');
    firstLink?.focus();

    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const syncHeight = () => {
      document.documentElement.style.setProperty('--topnav-h', `${el.offsetHeight}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    window.addEventListener('resize', syncHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={[
          'fixed top-0 left-0 right-0 z-50 border-b-4 border-tertiary',
          'backdrop-blur-sm transition-[background-color,box-shadow] duration-200',
          scrolled
            ? 'bg-surface shadow-[0_6px_0_0_rgba(126,87,46,0.28)]'
            : 'bg-surface/90 shadow-[0_4px_0_0_rgba(126,87,46,0.18)]',
        ].join(' ')}
      >
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <NavLink to="/" className="text-2xl font-black text-tertiary tracking-tighter uppercase">
            Shiyow
          </NavLink>

          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-menu-panel"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 pixel-border bg-tertiary-container px-4 py-2 font-black uppercase tracking-widest text-sm text-on-tertiary-container hover:-translate-y-0.5 transition-transform"
          >
            <HamburgerIcon open={open} />
            <span className="hidden sm:inline">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-on-surface/40 backdrop-blur-[2px]"
            />

            <motion.div
              key="panel"
              ref={panelRef}
              id="site-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-[min(22rem,92vw)] bg-surface-container-high border-l-4 border-tertiary shadow-[-4px_0_0_0_rgba(126,87,46,0.25)] flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b-4 border-tertiary bg-tertiary-container">
                <span className="font-black uppercase tracking-widest text-xs text-on-tertiary-container">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="font-black uppercase tracking-widest text-xs text-tertiary hover:text-primary"
                >
                  Close
                </button>
              </div>

              <nav className="flex-1 overflow-auto px-6 py-8">
                <ul className="space-y-2">
                  {LINKS.map((link, idx) => (
                    <motion.li
                      key={link.to}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{
                        delay: 0.08 + idx * 0.06,
                        duration: 0.3,
                        ease: [0.2, 0.8, 0.2, 1],
                      }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.end}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 w-full px-4 py-3 pixel-border-thin bg-surface-container-lowest',
                            'font-black uppercase tracking-widest text-lg transition-transform',
                            'hover:-translate-y-0.5 hover:bg-primary hover:text-on-primary',
                            isActive
                              ? 'text-primary border-primary shadow-[4px_4px_0_0_var(--color-primary)]'
                              : 'text-tertiary',
                          ].join(' ')
                        }
                      >
                        <span className="text-primary font-pixel text-xs">{`0${idx + 1}`}</span>
                        <span>{link.label}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <footer className="px-6 py-4 border-t-4 border-tertiary bg-surface-container text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                shiyow.dev · 16-Bit Atélier
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block w-5 h-5">
      <motion.span
        className="absolute left-0 right-0 h-[3px] bg-on-tertiary-container"
        style={{ top: '20%' }}
        animate={open ? { rotate: 45, top: '50%', translateY: '-50%' } : { rotate: 0, top: '20%' }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        className="absolute left-0 right-0 h-[3px] bg-on-tertiary-container top-1/2 -translate-y-1/2"
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className="absolute left-0 right-0 h-[3px] bg-on-tertiary-container"
        style={{ top: '80%' }}
        animate={open ? { rotate: -45, top: '50%', translateY: '-50%' } : { rotate: 0, top: '80%' }}
        transition={{ duration: 0.25 }}
      />
    </span>
  );
}
