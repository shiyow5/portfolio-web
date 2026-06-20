import { useEffect, useRef } from 'react';
import { useMode } from '../../lib/mode';
import { EditorialSite } from '../editorial/EditorialSite';
import { TerminalSite } from '../terminal/TerminalSite';

/**
 * Top-level presentation switch. The portfolio renders as one of two
 * self-contained single-page experiences sharing the same data:
 *   - editorial (default) — TYPESET layout in the warm Atelier palette
 *   - terminal — devstation IDE skin
 * Toggled via useMode(); the choice persists in localStorage.
 */
export function Layout() {
  const { mode } = useMode();
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = 'Shiyow — AI Engineer';
  }, []);

  // expose the mode on <html> so global CSS (scrollbar / selection) can re-skin
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  // A mode switch swaps the entire tree; move focus to the new <main> and
  // announce it so keyboard / screen-reader users aren't stranded (WCAG 2.4.3).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    requestAnimationFrame(() => document.querySelector<HTMLElement>('main')?.focus());
  }, [mode]);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {mode === 'terminal'
          ? 'ターミナル表示に切り替えました'
          : 'エディトリアル表示に切り替えました'}
      </div>
      {mode === 'terminal' ? <TerminalSite /> : <EditorialSite />}
    </>
  );
}
