# 想定検索語（ターゲットキーワード）と担保箇所

shiyow.dev が「誰の・何のサイトか」で見つかるための検索語を定義し、**どの語をコードのどこで担保しているか**を対応づけたもの。語を足すときは必ずこの表と実装の両方を更新する。

実装の単一情報源は [`app/src/lib/seo/renderStatic.ts`](../app/src/lib/seo/renderStatic.ts) の `buildSite()`（`keywords` / `knowsAbout` / `alternateNames`）と `FAQ`。ここを直せば、静的 HTML・JSON-LD・`llms.txt`・`<meta name="keywords">`・画面上の FAQ がすべて追従する。

## 前提：この 1 ページで何を取りに行くか

サイトは単一 URL（`https://shiyow.dev/`）の SPA。**ページ数で殴る戦い方はできない**ので、狙うのは以下の順。

1. **指名検索**（名前・ハンドル・サイト名）— 1 位を取れないと機会損失が最大
2. **作品名検索**（Astralyx / FASTBEAR など）— 固有名詞で競合がほぼ居ない。最も費用対効果が高い
3. **人物 × 属性**（しよを AIエンジニア、会津大学 LLM 研究）— 採用担当が名前を聞いた後に調べる語
4. **職種・技術のロングテール** — 上位は企業メディアが占有。複合語だけ現実的

## T0. 指名検索（最優先）

| 検索語                                            | 想定意図                   | 競合状況                                             | 担保箇所                                                                   |
| ------------------------------------------------- | -------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `しよを`                                          | 名前を聞いた人が読みで引く | ひらがな一般語（「しよう」）に誤訂正されやすい       | `<title>` / `og:title` / h1 / hero 表示 / `alternateName` / FAQ / llms.txt |
| `shiyow`                                          | ハンドルで引く             | **同名の DeviantArt ユーザーが存在**し英語圏では上位 | h1 / `Person.name` / `WebSite.name`                                        |
| `shiyow.dev`                                      | サイト名で直接             | ほぼ無競合                                           | `og:site_name` / canonical / `WebSite`                                     |
| `shiyow5`                                         | GitHub ハンドルから        | 無競合                                               | `alternateName` / `sameAs`                                                 |
| `シヨヲ` / `シヨウ`                               | カタカナ表記ゆれ           | —                                                    | `alternateName`                                                            |
| `sshow14`                                         | Kaggle ハンドルから        | 無競合                                               | `alternateName` / `sameAs`（Kaggle）                                       |
| `しよを ポートフォリオ` / `shiyow ポートフォリオ` | 作品を見に来る             | 低                                                   | `<title>` / description                                                    |

`shiyow` 単体は同名アカウントと競合するため、**「しよを」と「shiyow.dev」を主戦場**に置き、`shiyow` は複合語（+ ポートフォリオ / AIエンジニア）で取りに行く。

## T1. 人物 × 属性

| 検索語                                        | 担保箇所                                               |
| --------------------------------------------- | ------------------------------------------------------ |
| `しよを AIエンジニア` / `shiyow AIエンジニア` | h1「shiyow（しよを）— AIエンジニア」/ FAQ / `jobTitle` |
| `会津大学 AIエンジニア 学生`                  | Activity（学部・大学院）/ `alumniOf`                   |
| `会津大学大学院 LLM 研究`                     | Works「長文脈 LLM 推論の効率化（修士研究）」/ Activity |
| `松尾研究室 インターン 学生`                  | Activity / `worksFor`                                  |
| `AIエンジニア 就活中 ポートフォリオ`          | hero「Open to work — 就活中」/ FAQ                     |

## T2. 作品名（低競合・高確度）

| 検索語                                                                   | 担保箇所                                                    |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `Astralyx` / `Astralyx ハッカソン` / `GDGoC Japan Hackathon 2026 優秀賞` | Works + `CreativeWork` + FAQ                                |
| `FASTBEAR` / `クマ出没 AI` / `クマ出没情報 自動収集`                     | Works + `CreativeWork` + 外部リンク（デモ・プレスリリース） |
| `DM-AI` / `デュエルマスターズ AI` / `デュエマ ルール検索 AI`             | Works + `CreativeWork`                                      |
| `お絵描きバトラー`                                                       | Works + `CreativeWork`                                      |
| `Pokémon Cry Stats Predictor` / `ポケモン 鳴き声 種族値 予測`            | Works + `CreativeWork`                                      |
| `PTCG-AI` / `ポケモンカード AI Kaggle`                                   | Works + `CreativeWork`                                      |
| `TextWorld 強化学習 卒業研究`                                            | Works + Activity + 論文 PDF                                 |

作品名は**外部リンク（GitHub / デモ / プレスリリース / Kaggle）が被リンク源**になる。作品を公開したら、その先から shiyow.dev へ相互リンクを張るのが最も効く。

## T3. 職種・技術のロングテール

単語 1 語（`AIエンジニア`・`RAG`・`LLM`）は企業メディアが上位を占有するため**狙わない**。複合語のみ。

| 検索語                                                  | 担保箇所                           |
| ------------------------------------------------------- | ---------------------------------- |
| `AIエンジニア ポートフォリオ`                           | `<title>` / description / keywords |
| `クローンAI ポートフォリオ` / `自分のクローンAI サイト` | FAQ / Works「shiyow.dev」/ tagline |
| `LLMアプリ 個人開発 事例`                               | Works 全般 / Tech Stack            |
| `RAG 実装 事例 個人開発`                                | Works「DM-AI」/ `knowsAbout`       |
| `LangGraph 個人開発`                                    | Works「FASTBEAR」/ Tech Stack      |
| `KVキャッシュ 効率化 研究`                              | Works「長文脈 LLM 推論の効率化」   |
| `Gemini SSE ストリーミング Cloudflare`                  | Works「shiyow.dev」                |

## T4. ローカル・採用

`会津 AIエンジニア` / `福島 機械学習 エンジニア` — `Person.homeLocation`（Aizu, Japan）と Activity で担保。母集団が小さいぶん上位を取りやすい。

## T5. AI 回答エンジン（LLMO）向けの想定質問

検索順位とは別枠だが、同じ資産（FAQ / `llms.txt` / JSON-LD）で効く。ChatGPT・Perplexity・AI Overview に引用されることを狙う。

- 「shiyow（しよを）ってどんなエンジニア？」
- 「しよを の代表作・受賞歴は？」
- 「会津大学で LLM を研究している学生エンジニアは？」
- 「AIクローンと話せるポートフォリオサイトの例は？」

`public/robots.txt` は**回答エンジン系クローラ（OAI-SearchBot / PerplexityBot / Claude-SearchBot 等）を許可**し、**学習用バルククローラ（GPTBot / ClaudeBot / CCBot 等）を拒否**する方針。引用はされたいが学習データにはしない、という区別。

## コードで担保できないもの（人手が必要）

順位は「クロールできる」「意味が伝わる」だけでは決まらない。以下は**リポジトリの外**の作業で、これをやらない限り指名検索でも上位に出ない。

1. **Google Search Console への登録とインデックス送信** — 最優先。未登録だとそもそもインデックスされない
   - `https://search.google.com/search-console` でドメインプロパティ `shiyow.dev` を追加
   - 所有権確認は **DNS TXT レコード**（Cloudflare DNS に追加）が最も確実
   - 「サイトマップ」に `https://shiyow.dev/sitemap.xml` を送信
   - 「URL 検査」→「インデックス登録をリクエスト」でトップページを送る
   - 数日後、`site:shiyow.dev` で 1 件でも出ればインデックス済み
2. **Bing Webmaster Tools への登録** — Search Console からインポートできる。ChatGPT の検索は Bing index を参照するため LLMO にも効く
3. **被リンク（最重要かつ最も効く外部シグナル）**
   - GitHub プロフィール README・各リポジトリの About 欄に `shiyow.dev` を記載
   - X のプロフィール URL、Kaggle プロフィール、connpass / Qiita / Zenn などのプロフィール
   - ハッカソン主催者・アオタケ・プレスリリースの掲載ページから貼ってもらう
   - 上記はすべて `sameAs` にも追加すること（同一人物であることの明示になる）
4. **継続的な更新** — Activity と Works を増やすこと自体がクロール頻度と鮮度シグナルになる

## 効果測定

- Search Console の「検索パフォーマンス」で、上表の語ごとに表示回数・クリック・平均掲載順位を追う
- 指名検索（T0）で平均掲載順位 1.0 に届いていない場合、原因はほぼ**インデックス未登録か被リンク不足**であり、ページ内の最適化ではない
