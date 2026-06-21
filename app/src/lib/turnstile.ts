import { useEffect, useRef, useState } from 'react';

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      appearance?: 'always' | 'execute' | 'interaction-only';
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Renders a Cloudflare Turnstile widget into the returned ref when
 * VITE_TURNSTILE_SITEKEY is configured. Without a sitekey it is a no-op and
 * `token` stays undefined — the backend only enforces verification when
 * TURNSTILE_SECRET is also set, so the form still works in local/dev.
 *
 * `active` lets callers whose container only mounts conditionally (e.g. the
 * chat panel) defer rendering until the container is in the DOM; pass the
 * open/visible flag so the widget renders when the container appears.
 */
export function useTurnstile(active = true) {
  const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!sitekey || !active) return;
    let cancelled = false;
    let widgetId: string | undefined;

    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey,
        callback: (t) => setToken(t),
        'error-callback': () => setToken(undefined),
        'expired-callback': () => setToken(undefined),
        // Stay invisible unless Cloudflare actually needs a human interaction.
        appearance: 'interaction-only',
      });
      widgetIdRef.current = widgetId;
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render, { once: true });
    }

    return () => {
      cancelled = true;
      setToken(undefined);
      widgetIdRef.current = undefined;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // widget already removed
        }
      }
    };
  }, [sitekey, active]);

  // Turnstile tokens are single-use; call after a successful submit to fetch a
  // fresh token for the next request (e.g. the next chat message).
  const reset = () => {
    setToken(undefined);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // widget already gone
      }
    }
  };

  return { sitekey, containerRef, token, enabled: !!sitekey, reset };
}
