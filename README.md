# shiyow.dev — The 16-Bit Atelier Portfolio

Pixel-art / indie-game themed portfolio site. Dynamic-first architecture on Cloudflare so a future "clone agent" chat can plug straight in.

## Stack

- **Frontend** — Vite 6 · React 19 · TypeScript · Tailwind v4 · Motion · React Router v7
- **Backend** — Cloudflare Pages Functions (Workers runtime)
- **AI (planned)** — Gemini 2.0 Flash via `functions/api/chat.ts`
- **Hosting** — Cloudflare Pages
- **Domain** — `shiyow.dev` (Cloudflare Registrar)

## Directory Layout

```
.
├── Templates/          参考資料 (design + code reference, read-only)
├── app/                本体アプリ
│   ├── public/
│   ├── src/
│   │   ├── components/ (layout / pixel / chat / gallery)
│   │   ├── routes/     (Home / About / Gallery / WorkDetail / Changelog)
│   │   ├── data/       (works.json, changelog.json — Phase 1 static)
│   │   └── lib/
│   ├── functions/      Cloudflare Pages Functions (/api/*)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── wrangler.toml (later)
└── .github/workflows/  CI/CD
```

## Commands (inside `app/`)

| | |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server at `http://localhost:3000` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier verify |
| `npm run test` | Vitest unit tests |
| `npm run build` | Typecheck + Vite build → `dist/` |

## Design System

16-Bit Atelier — cream surface, sky-blue primary, forest-green secondary, wood-brown tertiary. Zero border-radius, 2/3/4 px strokes only, no pure black shadows. See `Templates/design/DESIGN_home.md` for the full spec.

## CI / CD

- `.github/workflows/ci.yml` — runs on PRs into `main` and pushes to any
  non-main branch. Fans out into parallel jobs: **typecheck · lint ·
  format · test · build**. Coverage and dist are uploaded as artifacts.
- `.github/workflows/deploy.yml` — runs on pushes to `main` and on
  manual dispatch. Re-executes the quality gate, builds, and deploys to
  Cloudflare Pages.
- Required repo secrets (Settings → Secrets → Actions):
  - `CLOUDFLARE_API_TOKEN` — scope: Account · Cloudflare Pages · Edit
  - `CLOUDFLARE_ACCOUNT_ID`
- The Cloudflare Pages project name is **`shiyow-portfolio`**. Create it
  once in the dashboard (or via `wrangler pages project create`) before
  the first deploy.

## Phases

- **Phase 0 (done)** — scaffold, design tokens, layout shell
- **Phase 1 (WIP)** — Home, About, Gallery, WorkDetail, Changelog
- **Phase 2** — Cloudflare Pages Functions + Gemini proxy + Turnstile + rate limit
- **Phase 3** — Custom domain (`shiyow.dev`) on Cloudflare Pages
- **Phase 4** — D1 / Vectorize backed clone agent with RAG

## Running Costs (estimated)

| Phase | JPY / month |
| --- | --- |
| Phase 1–2 | ~¥150–500 (domain only, within free tiers) |
| Phase 3 | ~¥1,000–1,500 (Workers Paid + Gemini moderate) |
| Phase 4 | ~¥1,500–3,000 (RAG + higher volume) |

See `~/.claude/plans/structured-zooming-globe.md` for the full breakdown.
