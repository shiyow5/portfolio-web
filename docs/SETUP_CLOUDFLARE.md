# Cloudflare / GitHub Secrets セットアップ手順

デプロイ・独自ドメイン・クローンエージェント（Gemini チャット）を動作させるために必要な **1 回きりのセットアップ作業** をまとめた手順書です。この順序で進めてください。

## 0. 前提

- GitHub リポジトリ: `shiyow5/portfolio-web` （push 済み）
- Cloudflare アカウント（無料プランで可）
- Google Cloud アカウント（Gemini API 用）
- 独自ドメインの希望名: `shiyow.dev`

## 1. Cloudflare Pages プロジェクト作成

Cloudflare ダッシュボードから Pages プロジェクトを 1 つ作っておきます。`wrangler pages deploy` はここにデプロイします。

### 1-1. GUI での作成（推奨・初回）

1. <https://dash.cloudflare.com/> にサインイン
2. 左メニュー **「Workers & Pages」** → **「Create application」** → **「Pages」** タブ
3. **「Connect to Git」ではなく「Direct Upload」** を選択（GitHub Actions 側からアップロードするため）
4. プロジェクト名を入力: **`shiyow-portfolio`**
   - ※このスラッグを GitHub 変数 `CF_PAGES_PROJECT` に登録します
5. 空のままで **「Create project」** をクリック
6. 最初のデプロイが走るのを待つ（最初だけ "Hello World" のデフォルト画面）

### 1-2. CLI で作る場合（任意）

```bash
npm install -g wrangler
wrangler login
wrangler pages project create shiyow-portfolio --production-branch=main
```

## 2. Cloudflare API トークン発行

GitHub Actions から Pages にデプロイするために **最小権限** のトークンを作ります。個人の Global API Key は使わないでください。

### 2-1. API トークン作成

1. <https://dash.cloudflare.com/profile/api-tokens> → **「Create Token」**
2. **「Get started」**（Custom token）
3. 名前: `GitHub Actions · shiyow-portfolio deploy`
4. Permissions:
   - `Account` / `Cloudflare Pages` / **`Edit`**
   - （任意）`Account` / `Account Settings` / `Read`（将来 Worker/KV/D1 を足すとき用に付けておくと楽）
5. Account Resources: **Include → 自分のアカウント** に限定
6. TTL: 未指定（無期限）でも可だが、運用上は 1 年先に設定しローテーション推奨
7. **「Continue to summary」** → **「Create Token」** → 表示されたトークンを **この画面でしかコピーできない** のでメモ帳に一時保存

### 2-2. Account ID を控える

1. Cloudflare ダッシュボード右上のプロフィールアイコン近くにある **「Account ID」** をコピー
   - または URL `https://dash.cloudflare.com/<ACCOUNT_ID>/` の部分

## 3. GitHub Actions Secrets / Variables 登録

### 3-1. Secrets（機密値）

GitHub リポジトリの **Settings → Secrets and variables → Actions → Secrets** タブで **「New repository secret」** を押し、以下を登録します。

| Name                      | 値                                          | 用途                                          |
| ------------------------- | ------------------------------------------- | --------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`    | §2-1 で作ったトークン                       | Pages デプロイ                                |
| `CLOUDFLARE_ACCOUNT_ID`   | §2-2 の Account ID                          | Pages デプロイ                                |
| `GEMINI_API_KEY`          | §5 で取得                                   | クローンエージェント + Gemini Code Review CI  |
| `TURNSTILE_SECRET`        | §6 で取得（空欄可、セットするとより安全）   | Turnstile サーバ検証                          |

### 3-2. Variables（非機密）

**Settings → Secrets and variables → Actions → Variables** タブで登録。

| Name                   | 値                              | 用途                                   |
| ---------------------- | ------------------------------- | -------------------------------------- |
| `CF_PAGES_PROJECT`     | `shiyow-portfolio`              | `deploy.yml` が参照                    |
| `CF_DEPLOY_ENABLED`    | `true`                          | Deploy ワークフローの実行ゲート（未設定 or 他の値なら skip 扱い）|
| `PRODUCTION_URL`       | `https://shiyow.dev`            | GitHub の Environment URL 表示         |
| `VITE_TURNSTILE_SITEKEY` | §6 で取得                     | フロントで Turnstile ウィジェット表示   |

> **メモ:** `CF_DEPLOY_ENABLED=true` を登録するまで Deploy ワークフローは **Skipped（グレー）** になります。secrets/variables が揃った段階で最後にこの変数を `true` に設定してください。

設定後、**Actions → Deploy → Run workflow** を押して初回デプロイを試せます。

## 4. 独自ドメイン `shiyow.dev` を取得して割り当て

### 4-1. ドメイン購入

1. Cloudflare ダッシュボード → 左メニュー **「Domain Registration」** → **「Register Domains」**
2. `shiyow.dev` を検索
   - `.dev` TLD は **約 $11.50/年（at-cost）**
   - **HSTS preload が TLD として必須** だが Cloudflare が自動で HTTPS / HSTS を有効化するので追加作業不要
3. 購入 → 支払い → 数分で登録完了（ネームサーバーは自動で Cloudflare に設定される）

既に別レジストラで取得済みの場合:

- Cloudflare ダッシュボードから **「Add a site」** で shiyow.dev を追加
- 指示されたネームサーバー 2 つを現レジストラで設定

### 4-2. Pages にカスタムドメインを追加

1. Cloudflare ダッシュボード → **Workers & Pages** → `shiyow-portfolio` を開く
2. **「Custom domains」** タブ → **「Set up a custom domain」**
3. `shiyow.dev` を入力 → **「Activate domain」**
   - （`www.shiyow.dev` も追加してリダイレクトしたい場合は同じ手順でもう一度）
4. DNS が自動で更新され、SSL 証明書も自動発行される（通常 1-5 分）
5. ブラウザで <https://shiyow.dev> にアクセスして動作確認

## 5. Gemini API キー取得

クローンエージェントと PR の Gemini レビューで使います。

1. Google AI Studio にアクセス: <https://aistudio.google.com/apikey>
2. Google アカウントでログイン → **「Create API key」**
3. 既存の Google Cloud プロジェクトを選ぶか、新規作成
4. 発行されたキーをコピー → §3-1 の `GEMINI_API_KEY` に登録

### 5-1. 予算アラート（強く推奨）

1. Google Cloud Console: <https://console.cloud.google.com/billing/budgets>
2. 上記 API キーが属するプロジェクトで **「Create budget」**
3. 月予算 `¥2,000`、閾値 50% / 90% / 100% でメール通知を設定
4. Generative Language API を含めるため **Services: すべて** または **「Generative Language API」** を指定

## 6. Cloudflare Turnstile（Bot 対策）

`/api/chat` を呼ぶときに CAPTCHA 代わりのトークンを検証します。

1. Cloudflare ダッシュボード → 左メニュー **「Turnstile」**
2. **「Add site」**
   - Site name: `shiyow.dev portfolio chat`
   - Domain: `shiyow.dev`, `pages.dev`, `localhost`（開発時のために追加推奨）
   - Widget mode: **Managed**（推奨）
3. 発行された **Site Key** → §3-2 の `VITE_TURNSTILE_SITEKEY` に登録
4. **Secret Key** → §3-1 の `TURNSTILE_SECRET` に登録

未設定でも動きますが、無料の Gemini 無料枠を悪用されないよう早めに有効化を推奨します。

## 7. 初回デプロイの確認

1. リポジトリで **Actions** タブを開く
2. **Deploy** workflow → **Run workflow** を手動実行（初回は main に変更差分がないため手動実行で OK）
3. 成功すると Environment `production` の URL が `https://shiyow.dev` としてリンクされる
4. デプロイ後、以下を確認:
   - <https://shiyow.dev/> が 200 で返り Home が表示される
   - <https://shiyow.dev/api/chat> に適当な POST を送るとレートリミット/Turnstile 検証が走る
   - DevTools Network タブで `GEMINI_API_KEY` が **クライアントに露出していない** こと

## 8. トラブルシュート

| 症状                                             | 対処                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Deploy workflow が `Missing required configuration` で失敗 | §3 の Secrets / Variables を再確認                                                   |
| `Required CI not green on this commit` で失敗    | Format Check / Lint / Test のいずれかが失敗している。Actions タブで該当 run を確認    |
| Pages にデプロイ済みなのに `shiyow.dev` が 404   | §4-2 のカスタムドメイン設定がまだ Pending。数分待つ                                  |
| チャットが 502 / 401 で返る                      | `GEMINI_API_KEY` が未設定か期限切れ。Cloudflare Pages のダッシュボード → Settings → Environment variables にも登録必要（§3 は GitHub 側、実行時は Pages 側にも必要） |
| 「Workers AI / D1 を使いたくなった」             | §2-1 のトークンに `Account → Workers AI → Edit` / `D1 → Edit` を追記。将来拡張時のみ |

## 9. Cloudflare Pages の環境変数登録（runtime 側）

**重要:** GitHub Secrets は CI の実行時にしか使われません。`functions/api/chat.ts` が実行時に `GEMINI_API_KEY` / `TURNSTILE_SECRET` を読めるようにするには、**Cloudflare Pages 側** にも別途登録が必要です。

1. Cloudflare ダッシュボード → `shiyow-portfolio` → **Settings** → **Environment variables**
2. **Production** と **Preview** 双方に登録:
   - `GEMINI_API_KEY` （Secret）
   - `TURNSTILE_SECRET` （Secret）
3. 同じページに **Bindings** セクションがあるので、レートリミット用の KV を追加:
   - Type: `KV Namespace`
   - Variable name: `RATE_LIMIT_KV`
   - Namespace: 新規作成（例: `shiyow-portfolio-ratelimit`）
4. 保存 → 次回のデプロイから反映

## 10. 運用の目安

- **月額費用の目安**: §Plan の `docs/` ないし README を参照。ドメイン代の按分 ¥150/月 + 使用量次第。
- **ローテーション**: API トークン・Gemini キーは年 1 回ローテーション推奨。
- **バックアップ**: 静的データは Git に残るため OK。D1 導入後は定期ダンプを設定。
