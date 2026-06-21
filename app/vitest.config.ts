/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // *.live.test.ts hit the real Gemini API and are opt-in via `npm run eval`.
    exclude: [
      'node_modules',
      'dist',
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
      '**/*.live.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        'src/main.tsx',
      ],
    },
  },
});
