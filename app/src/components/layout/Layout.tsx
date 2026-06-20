import { Suspense, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMode } from '../../lib/mode';
import { TerminalSite } from '../terminal/TerminalSite';
import { BackgroundFX } from './BackgroundFX';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';
import { AnimatedOutlet } from '../motion/AnimatedOutlet';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Shiyow — AI Engineer',
  '/about': 'About · Shiyow — AI Engineer',
  '/gallery': 'Works · Shiyow — AI Engineer',
  '/changelog': 'Activity · Shiyow — AI Engineer',
  '/contact': 'Contact · Shiyow — AI Engineer',
};

function titleFor(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/works/')) return 'Work · Shiyow — AI Engineer';
  return 'Not Found · Shiyow — AI Engineer';
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32" role="status" aria-live="polite">
      <span className="font-pixel text-xs uppercase tracking-widest text-tertiary animate-pulse">
        Loading…
      </span>
    </div>
  );
}

export function Layout() {
  const { mode } = useMode();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Per-route document title (SEO + screen-reader page awareness).
  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);

  // Move focus to <main> on client-side navigation so keyboard/SR users land
  // on the new page content instead of being stranded at the top (WCAG 2.4.3).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  if (mode === 'terminal') return <TerminalSite />;

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:font-black focus:uppercase focus:tracking-widest"
      >
        Skip to content
      </a>
      <BackgroundFX />
      <TopNav />
      <main
        ref={mainRef}
        id="main"
        tabIndex={-1}
        className="flex-1 relative outline-none"
        style={{ paddingTop: 'var(--topnav-h, 72px)' }}
      >
        <Suspense fallback={<PageFallback />}>
          <AnimatedOutlet />
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
