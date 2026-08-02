# shiyow.dev — Portfolio

AI エンジニア shiyow のポートフォリオサイト。**editorial / terminal の 2 モード**を切り替えられる SPA と、本人の経歴に接地した**クローン AI チャット**を Cloudflare 上で動かしています。

**Live: https://shiyow.dev**

## Stack

- **Frontend** — Vite 8 · React 19 · TypeScript 6 · Tailwind v4 · Motion · lucide-react
  （ルーターは使っていません。1 ページの中で editorial / terminal を切り替える構成）
- **Backend** — Cloudflare Pages Functions（Workers runtime）· Workers KV（レート制限）
- **AI** — Gemini `gemini-2.5-flash-lite`（SSE ストリーミング · Turnstile · 事実カード接地）
- **Build** — `vite build` + 自前 prerender（セマンティック HTML / JSON-LD / sitemap.xml / llms.txt を生成）
- **Test** — Vitest（unit）· Playwright（smoke）· 実 API を叩く grounding eval
- **Hosting** — Cloudflare Pages（プロジェクト `shiyow-portfolio`）
- **Domain** — `shiyow.dev`（Cloudflare Registrar）

## Features

### 2 つの表示モード

`src/lib/mode.tsx` の `ModeProvider` が `editorial`（既定）と `terminal` を保持し、localStorage に永続化します。

- **editorial** — Atelier 配色の縦スクロール。`#work` / `#stack` / `#activity` / `#contact` のセクション構成
- **terminal** — 疑似シェル REPL。`help` / `whoami` / `neofetch` / `ls` / `cat` / `projects` / `skills` / `activity` / `open` / `ask` / `chat` / `contact` / `social` / `editorial` / `clear` / `echo` ほか（`src/lib/terminal/commands.ts`）

### クローン AI チャット

`functions/api/chat.ts` が Gemini へのプロキシで、`src/lib/persona/` に防御層とペルソナが載っています。

- **接地（grounding）** — `factCards.ts` がサイトと同じ JSON（works / activity / profile）から事実カードを生成。カードに無い事実は答えない
- **棄権（abstention）** — 分からないことは推測せず人間に回す Narrator Mode
- **引用（citation）** — 各主張に `[work:id]` などを付与し、`citations.ts` のガードが存在しない id を除去
- **プロンプトインジェクション対策** — `spotlight.ts` がリクエストごとのランダム nonce で訪問者入力をフェンスし、命令階層を固定。出力側では nonce / デリミタの漏洩をスクラブ
- **濫用対策** — Turnstile 検証、KV による per-IP レート制限（chat: 12 req/min・60 req/hour、contact: 3/min・10/hour）、入力 2000 文字上限

### API エンドポイント

| Path | 内容 |
| --- | --- |
| `POST /api/chat` | Gemini への SSE ストリーミングプロキシ |
| `POST /api/contact` | 問い合わせを `CONTACT_WEBHOOK_URL`（Discord / Slack / Zapier 互換）へ転送。未設定時は 503 で穏当に degrade |
| `GET /api/health` | ヘルスチェック |

### LLMO / SEO

`npm run build` の最終段（`scripts/prerender.mjs`）が、空の `#root` にセマンティック HTML を流し込み、JSON-LD `@graph` を差し替え、`sitemap.xml` と `llms.txt` を出力します。`public/_headers` で HSTS・`X-Content-Type-Options`・`X-Frame-Options`・`Referrer-Policy`・`Permissions-Policy` を全レスポンスに付与。

## Directory Layout

```
.
├── Templates/              参考資料（design + code reference, read-only）
├── docs/
│   └── SETUP_CLOUDFLARE.md Cloudflare / GitHub の設定手順（唯一の運用ドキュメント）
├── app/                    本体アプリ（Pages プロジェクトのルート）
│   ├── public/             _headers, robots.txt, og.png, characters/, works/, papers/
│   ├── src/
│   │   ├── components/
│   │   │   ├── editorial/  EditorialSite, EditorialNav
│   │   │   ├── terminal/   TerminalSite, TerminalRepl
│   │   │   ├── chat/       ChatWidget
│   │   │   ├── media/      WorkMedia / WorkImage / WorkVideo
│   │   │   └── layout/     Layout（モード切替の入口）
│   │   ├── data/           works.json, activity.json, profile.json（サイトの唯一の情報源）
│   │   ├── lib/
│   │   │   ├── persona/    クローンのペルソナ・事実カード・引用ガード・spotlight・golden test
│   │   │   ├── seo/        renderStatic（prerender 用の HTML / JSON-LD 生成）
│   │   │   ├── terminal/   コマンド実装
│   │   │   └── *.ts        works / activity / profile / chat / contact / mode / motion ほか
│   │   ├── App.tsx
│   │   └── index.css       Tailwind v4 @theme のデザイントークン
│   ├── functions/api/      Cloudflare Pages Functions（chat / contact / health）
│   ├── scripts/prerender.mjs
│   ├── e2e/smoke.spec.ts   Playwright smoke
│   ├── wrangler.toml       KV バインディング（RATE_LIMIT_KV）と Pages 設定
│   ├── playwright.config.ts / vitest.config.ts / vitest.eval.config.ts
│   └── package.json / tsconfig.json / vite.config.ts
└── .github/
    ├── actions/setup-frontend/  共通セットアップ（Node 20 + npm ci、キャッシュ付き）
    └── workflows/               CI / CD
```

`app/src/data/*.json` がサイト表示とクローン AI の両方の情報源です。経歴を直すときはここだけを直せば、ページとチャットの両方に反映されます。

## Commands（`app/` 内で実行）

| | |
| --- | --- |
| `npm install` | 依存をインストール |
| `npm run dev` | Vite dev server（`http://localhost:3000`） |
| `npm run dev:pages` | `wrangler pages dev dist` で Functions 込みの動作確認（先に `npm run build`） |
| `npm run build` | typecheck → Vite build → prerender（`dist/` に HTML / sitemap.xml / llms.txt） |
| `npm run preview` | ビルド成果物のプレビュー |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run test` / `test:watch` | Vitest（unit） |
| `npm run test:coverage` | カバレッジ付き Vitest |
| `npm run e2e` / `e2e:ui` | Playwright smoke（`preview` を自動起動） |
| `npm run eval` | クローンの接地 / 棄権 eval。**実 Gemini API を叩く**ため `GEMINI_API_KEY` が必要 |
| `npm run clean` | `dist` / `coverage` / レポート類を削除 |

### ローカル開発の注意

- `VITE_*` はビルド時にバンドルへ焼き込まれます。Turnstile ウィジェットを出すなら **`app/.env`** に `VITE_TURNSTILE_SITEKEY` を置いてください（リポジトリルートの `.env` は Vite に読まれません）。未設定なら Turnstile 無しで動きます。
- `/api/*` は Vite dev server では動きません。Functions を触るときは `npm run build && npm run dev:pages`。
- Pages のランタイム secret（`GEMINI_API_KEY` など）はローカルでは `.dev.vars` に置きます。コミットしないこと。

## Design System

Tailwind v4 の `@theme`（`app/src/index.css`）にトークンを集約。

- **editorial** — cream surface（`#fbf9f4`）· sky-blue primary · forest-green secondary · wood-brown tertiary。角丸は全段階 `0px`、フォントは Space Grotesk / JetBrains Mono
- **terminal** — 上のトークンは使わず、モード内で完結したダーク配色

意匠のもとになった仕様は `Templates/design/DESIGN_*.md`（read-only の参考資料）にあります。

## CI / CD

| Workflow | Trigger | 内容 |
| --- | --- | --- |
| `format.yml` | PR / push to main / 手動（`app/**` パスフィルタ） | `prettier --check` |
| `lint.yml` | 同上 | `tsc --noEmit` + `eslint` |
| `test.yml` | 同上 | `vitest run --coverage`（カバレッジを artifact 化） |
| `playwright-smoke.yml` | 同上 | Playwright smoke（失敗時にスクリーンショット / トレース） |
| `eval.yml` | PR（`src/lib/persona/**`・`functions/api/chat.ts`・`src/data/**`）/ 手動 | クローンの接地・棄権 eval（実 Gemini API） |
| `deploy-preflight.yml` | PR / 手動 | 必須シークレットの不足を早期警告 + 本番相当のドライビルド |
| `deploy.yml` | push to main / 手動 | 同一 SHA で Format / Lint / Test の成功を確認 → build → Cloudflare Pages へ `--branch=main` でデプロイ |
| `gemini-review.yml` | 全 PR（opened / synchronize）/ 手動 | Gemini による自動レビュー（`GEMINI_API_KEY` 未設定ならスキップ） |

- 共通セットアップは `.github/actions/setup-frontend/`（Node 20 + `npm ci` + キャッシュ）。
- PR 系ワークフローは**同一リポジトリの PR でのみ**動作します（fork にシークレットを渡さない）。
- `deploy.yml` は CI の完了をポーリングしてから走るので、CI が落ちている SHA は本番に出ません。

### 必要な設定

**GitHub Actions Secrets**

| 名前 | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Pages へのデプロイ |
| `CLOUDFLARE_ACCOUNT_ID` | 同上 |
| `GEMINI_API_KEY` | `eval.yml` / `gemini-review.yml` |

**GitHub Actions Variables**

| 名前 | 例 | 用途 |
| --- | --- | --- |
| `CF_DEPLOY_ENABLED` | `true` | **これが `true` でないと deploy job は丸ごとスキップ**（設定前に失敗させないためのゲート） |
| `CF_PAGES_PROJECT` | `shiyow-portfolio` | デプロイ先の Pages プロジェクト |
| `PRODUCTION_URL` | `https://shiyow.dev` | Environment の表示 URL |
| `VITE_TURNSTILE_SITEKEY` | `0x...` | ビルド時にバンドルへ焼き込む Turnstile の公開サイトキー |

**Cloudflare Pages のランタイム secret**（GitHub 側ではなく Pages ダッシュボードに登録）

| 名前 | 用途 |
| --- | --- |
| `GEMINI_API_KEY` | `/api/chat` |
| `TURNSTILE_SECRET` | Turnstile のサーバー側検証 |
| `CONTACT_WEBHOOK_URL` | `/api/contact` の転送先。未設定だとフォームは「未設定」表示になる |
| `GEMINI_MODEL`（任意） | モデルの上書き。既定は `gemini-2.5-flash-lite` |

**KV** — `wrangler kv namespace create RATE_LIMIT_KV` で作成し、`RATE_LIMIT_KV` としてバインド（`app/wrangler.toml` に記載済み）。

**手順の詳細（ドメイン取得 · API トークン · Turnstile · Gemini · ランタイム変数）: [`docs/SETUP_CLOUDFLARE.md`](docs/SETUP_CLOUDFLARE.md)**

## Status

- 公開済み — `shiyow.dev` が Cloudflare Pages で稼働中。main への push で自動デプロイ
- editorial / terminal の 2 モード、クローン AI チャット、問い合わせフォーム、prerender + LLMO 対応まで実装済み
- クローンの知識源は当初構想の D1 / Vectorize ではなく、**サイトと共有する JSON から生成する事実カード**方式に変更。データ量が小さく、ページとチャットの食い違いを構造的に防げるため
