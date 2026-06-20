import { useEffect } from 'react';
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

  useEffect(() => {
    document.title = 'Shiyow — AI Engineer';
  }, []);

  return mode === 'terminal' ? <TerminalSite /> : <EditorialSite />;
}
