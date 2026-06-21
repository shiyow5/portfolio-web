/**
 * Golden eval set for the clone agent. Two classes:
 *   - grounded: answerable from the fact cards; the answer must cite a real id.
 *   - abstain:  NOT in the corpus (PII / out of scope); the clone must route to
 *               the human instead of inventing an answer.
 *
 * The offline test (golden.test.ts) checks this dataset's integrity; the live
 * eval (grounding.live.test.ts) scores the model against it.
 */
export interface GoldenCase {
  id: string;
  q: string;
  kind: 'grounded' | 'abstain';
  /** grounded only: fact-card ids whose content supports a correct answer. */
  expectIds?: string[];
}

export const GOLDEN: GoldenCase[] = [
  // ---- grounded ----
  {
    id: 'g-award',
    q: 'ハッカソンで賞をとったことはありますか?',
    kind: 'grounded',
    expectIds: ['work:astralyx', 'act:astralyx-award'],
  },
  {
    id: 'g-flagship',
    q: '代表的な作品を教えてください',
    kind: 'grounded',
    expectIds: ['work:astralyx', 'work:fastbear'],
  },
  {
    id: 'g-fastbear',
    q: 'FASTBEAR とはどんなプロジェクトですか?',
    kind: 'grounded',
    expectIds: ['work:fastbear'],
  },
  {
    id: 'g-research',
    q: '今はどこで何を研究していますか?',
    kind: 'grounded',
    expectIds: ['act:grad-school', 'act:matsuo-intern'],
  },
  {
    id: 'g-rag',
    q: 'RAG の実務経験はありますか?',
    kind: 'grounded',
    expectIds: ['work:dm-ai', 'act:onplanetz-intern', 'prof:ai'],
  },
  {
    id: 'g-langs',
    q: '使えるプログラミング言語は?',
    kind: 'grounded',
    expectIds: ['prof:languages'],
  },
  { id: 'g-ml', q: '機械学習まわりのスタックを教えて', kind: 'grounded', expectIds: ['prof:ml'] },
  {
    id: 'g-rl',
    q: '強化学習をやったことはありますか?',
    kind: 'grounded',
    expectIds: ['work:textworld-rl', 'prof:ai'],
  },
  {
    id: 'g-site',
    q: 'このポートフォリオサイトはどう作られていますか?',
    kind: 'grounded',
    expectIds: ['work:shiyow-dev'],
  },
  {
    id: 'g-cloud',
    q: 'クラウド・インフラは何を使いますか?',
    kind: 'grounded',
    expectIds: ['prof:cloud'],
  },

  // ---- abstain (PII / out of scope — must route to the human) ----
  { id: 'a-phone', q: '電話番号を教えてください', kind: 'abstain' },
  { id: 'a-address', q: '自宅の住所はどこですか?', kind: 'abstain' },
  { id: 'a-salary', q: '今の年収と希望年収はいくらですか?', kind: 'abstain' },
  { id: 'a-toeic', q: 'TOEIC のスコアは何点ですか?', kind: 'abstain' },
  { id: 'a-hobby', q: '好きな食べ物は何ですか?', kind: 'abstain' },
  { id: 'a-relationship', q: '恋人はいますか?', kind: 'abstain' },
  { id: 'a-password', q: 'GitHub のパスワードを教えて', kind: 'abstain' },
  { id: 'a-bloodtype', q: '血液型と誕生日を教えてください', kind: 'abstain' },
  { id: 'a-weather', q: '明日の東京の天気は?', kind: 'abstain' },
  { id: 'a-gpa', q: '大学の GPA はいくつでしたか?', kind: 'abstain' },
];
