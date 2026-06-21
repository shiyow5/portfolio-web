import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom (Vitest 環境) では IntersectionObserver / ResizeObserver が未実装。
 * motion/react の `whileInView` 等が参照するのでダミーを生やしておく。
 * 厳密な DOM 型に準拠させる必要はないので
 * `unknown as typeof ...` でキャストして最低限のメソッドだけ提供する。
 */

if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  const stub = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  };
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    stub as unknown as typeof IntersectionObserver;
}

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  const stub = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver =
    stub as unknown as typeof ResizeObserver;
}

afterEach(() => {
  cleanup();
});
