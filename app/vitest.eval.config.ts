/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Opt-in config for the live clone eval (`npm run eval`). Runs ONLY the
// *.live.test.ts suites, which call the real Gemini API and need GEMINI_API_KEY.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'node',
    include: ['src/**/*.live.test.ts'],
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
