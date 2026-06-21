import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useMode } from '../../lib/mode';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES, CATEGORY_LABEL, formatDate } from '../../lib/activity';
import { submitContact } from '../../lib/contact';
import { useTurnstile } from '../../lib/turnstile';
import { ChatWidget } from '../chat/ChatWidget';
import { EditorialNav } from './EditorialNav';

// ---------------------------------------------------------------------------
// Editorial / TYPESET presentation in the warm Atelier palette (cream + blue).
// Typography-led, numbered sections, mono metadata, motion reveals.
// ---------------------------------------------------------------------------

type Status = 'idle' | 'sending' | 'success' | 'error';

const FORM_INPUT =
  'w-full bg-surface-container-lowest border-b-2 border-on-surface/30 px-1 py-2 text-base focus:border-primary outline-none transition-colors';

const reveal = {
  variants: fadeUp,
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, amount: 0.15 },
} as const;

export function EditorialSite() {
  const { setMode } = useMode();
  const askClone = () => window.dispatchEvent(new CustomEvent('shiyow:open-chat'));

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[110] focus:bg-on-surface focus:text-surface focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest"
      >
        Skip to content
      </a>
      <EditorialNav />

      <main id="top" tabIndex={-1} className="mx-auto max-w-[1180px] px-6 outline-none">
        {/* ===== hero ===== */}
        <motion.section
          variants={staggerContainer(0.09)}
          initial="hidden"
          animate="show"
          className="border-b-2 border-on-surface py-12 md:py-20"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-widest text-on-surface-variant"
          >
            <span>shiyow</span>
            <span className="text-outline">/</span>
            <span>{PROFILE.location}</span>
            <span className="text-outline">/</span>
            <span className="text-secondary">◉ Open to work — 就活中</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-black lowercase leading-[0.82] tracking-tighter text-[clamp(4rem,18vw,15rem)]"
          >
            shiyow<span className="text-primary">.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-2 text-2xl md:text-4xl font-bold uppercase tracking-tight text-on-surface-variant"
          >
            AI Engineer
          </motion.p>

          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <motion.p
              variants={fadeUp}
              className="md:col-span-7 text-lg md:text-xl text-on-surface-variant max-w-2xl"
            >
              LLM アプリ・AI エージェント・ML をプロダクトとして実装します。
              モデル選定から本番デプロイまで一人で通すのが得意です。
            </motion.p>
            <motion.dl
              variants={fadeUp}
              className="md:col-span-5 font-mono text-xs uppercase tracking-widest text-tertiary md:justify-self-end space-y-1"
            >
              <div>
                <dt className="inline text-on-surface-variant">core / </dt>
                <dd className="inline">LLM · Agent · RAG · ML</dd>
              </div>
              <div>
                <dt className="inline text-on-surface-variant">lang / </dt>
                <dd className="inline">Python · TypeScript · Go</dd>
              </div>
              <div>
                <dt className="inline text-on-surface-variant">infra / </dt>
                <dd className="inline">Cloudflare · GCP · Gemini</dd>
              </div>
            </motion.dl>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest"
          >
            <button
              type="button"
              onClick={askClone}
              className="bg-primary text-on-primary px-4 py-2.5 hover:-translate-y-0.5 transition-transform"
            >
              ▶ Ask my AI clone
            </button>
            <a
              href="#contact"
              className="border-2 border-on-surface px-4 py-2.5 hover:bg-on-surface hover:text-surface transition-colors"
            >
              Get in touch ↓
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-mono text-[11px] uppercase tracking-widest text-on-surface-variant"
          >
            {'// ▶ Ask my AI clone — 本人が Gemini で実装したライブデモ (SSE / Turnstile / KV)'}
          </motion.p>
        </motion.section>

        {/* ===== selected work ===== */}
        <section id="work" className="py-12 md:py-16">
          <motion.div {...reveal}>
            <SectionHead index="01" title="Selected Work" note="制作物・実績" />
          </motion.div>
          {WORKS.length === 0 && (
            <p className="border-t-2 border-on-surface/15 py-7 font-mono text-sm text-on-surface-variant">
              {'// 準備中 — 近日公開'}
            </p>
          )}
          <motion.ol
            variants={staggerContainer(0.07)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {WORKS.map((w, i) => (
              <motion.li
                key={w.id}
                variants={fadeUp}
                className="grid grid-cols-12 gap-3 border-t-2 border-on-surface/15 py-7 group"
              >
                <span className="col-span-12 md:col-span-1 font-mono text-sm text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="col-span-12 md:col-span-7">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-on-surface-variant max-w-xl">{w.tagline}</p>
                </div>
                <div className="col-span-12 md:col-span-4 font-mono text-[11px] uppercase tracking-widest text-tertiary md:text-right space-y-1.5">
                  <p>{w.tech.join(' · ')}</p>
                  <p className="text-on-surface-variant">
                    {w.status} · {w.year}
                  </p>
                  <p className="flex gap-3 md:justify-end">
                    {w.links.github && (
                      <a
                        href={w.links.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${w.title} のコード`}
                        className="text-primary hover:underline"
                      >
                        code ↗
                      </a>
                    )}
                    {(w.links.demo || w.links.play) && (
                      <a
                        href={w.links.demo ?? w.links.play}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${w.title} のデモ`}
                        className="text-primary hover:underline"
                      >
                        demo ↗
                      </a>
                    )}
                    {(w.links.sources ?? []).map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${w.title}: ${s.label}`}
                        className="text-on-surface-variant hover:text-primary hover:underline"
                      >
                        {s.label} ↗
                      </a>
                    ))}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </section>

        {/* ===== stack ===== */}
        <motion.section id="stack" className="py-12 md:py-16" {...reveal}>
          <SectionHead index="02" title="Stack" note="AI を主軸に" />
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            {PROFILE.techStack.map((g) => (
              <div key={g.id} className="border-t-2 border-on-surface/15 pt-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-tertiary">
                  {g.label}
                </h3>
                <p className="mt-2 text-lg font-bold leading-snug">{g.items.join('  ·  ')}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== activity ===== */}
        <motion.section id="activity" className="py-12 md:py-16" {...reveal}>
          <SectionHead index="03" title="Activity" note="直近の活動" />
          {ACTIVITIES.length === 0 && (
            <p className="border-t-2 border-on-surface/15 py-3 font-mono text-sm text-on-surface-variant">
              {'// 準備中'}
            </p>
          )}
          <ul>
            {ACTIVITIES.slice(0, 7).map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-12 gap-3 border-t-2 border-on-surface/15 py-3 items-baseline"
              >
                <span className="col-span-4 md:col-span-2 font-mono text-xs text-on-surface-variant">
                  {formatDate(a.date)}
                </span>
                <span className="col-span-8 md:col-span-2 font-mono text-[11px] uppercase tracking-widest text-secondary">
                  [{CATEGORY_LABEL[a.category]}]
                </span>
                <span className="col-span-12 md:col-span-8 font-bold">
                  {a.title}
                  {a.links.length > 0 && (
                    <span className="ml-2 inline-flex flex-wrap gap-x-3 font-mono text-[11px] font-normal">
                      {a.links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ===== contact ===== */}
        <ContactSection askClone={askClone} />
      </main>

      <footer className="border-t-2 border-on-surface">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
          <span>© 2026 shiyow — AI Engineer</span>
          <button type="button" onClick={() => setMode('terminal')} className="hover:text-primary">
            {'>_'} switch to terminal
          </button>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}

function SectionHead({ index, title, note }: { index: string; title: string; note: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-end gap-x-4 gap-y-1">
      <span className="font-mono text-sm text-primary">{index}</span>
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{title}</h2>
      <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        {`// ${note}`}
      </span>
    </header>
  );
}

function ContactSection({ askClone }: { askClone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const { containerRef, token, enabled } = useTurnstile();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (enabled && !token) {
      setStatus('error');
      setError('認証（Turnstile）を完了してください');
      return;
    }
    setStatus('sending');
    setError('');
    const result = await submitContact(
      { name: name.trim(), email: email.trim(), message: message.trim() },
      token,
    );
    if (result.ok) setStatus('success');
    else {
      setStatus('error');
      setError(result.error ?? '送信に失敗しました');
    }
  };

  return (
    <motion.section
      id="contact"
      className="border-t-2 border-on-surface py-12 md:py-20"
      {...reveal}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-secondary">◉ Open to work</p>
      <h2 className="mt-3 font-black uppercase leading-[0.85] tracking-tighter text-[clamp(2.75rem,10vw,7rem)]">
        Let&rsquo;s talk<span className="text-primary">.</span>
      </h2>
      <p className="mt-4 max-w-xl text-on-surface-variant">
        採用・カジュアル面談のご連絡を歓迎します。経歴やスキルは右下の AI クローンにも聞けます。
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-12">
        {status === 'success' ? (
          <div className="md:col-span-7 border-2 border-secondary bg-secondary-container p-6">
            <p className="font-black uppercase text-on-secondary-container">送信しました</p>
            <p className="mt-1 text-on-secondary-container">
              メッセージを受け取りました。返信までお待ちください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-5">
            <Field label="Name / お名前">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                className={FORM_INPUT}
              />
            </Field>
            <Field label="Email / メール">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                autoComplete="email"
                className={FORM_INPUT}
              />
            </Field>
            <Field label="Message / メッセージ">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
                rows={4}
                className={`${FORM_INPUT} resize-y`}
              />
            </Field>
            {enabled && <div ref={containerRef} className="min-h-[65px]" />}
            {status === 'error' && (
              <p role="alert" className="font-mono text-sm text-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-on-surface text-surface px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send →'}
            </button>
          </form>
        )}

        <aside className="md:col-span-5 font-mono text-xs uppercase tracking-widest text-on-surface-variant space-y-3 md:justify-self-end">
          <button type="button" onClick={askClone} className="block text-primary hover:underline">
            ▶ Ask my AI clone
          </button>
          <a
            href="https://x.com/twinS_KNSN1415"
            target="_blank"
            rel="noreferrer"
            className="block hover:text-primary"
          >
            X / @twinS_KNSN1415 ↗
          </a>
          <a
            href="https://github.com/shiyow5"
            target="_blank"
            rel="noreferrer"
            className="block hover:text-primary"
          >
            GitHub / shiyow5 ↗
          </a>
          <a
            href="https://www.kaggle.com/sshow14"
            target="_blank"
            rel="noreferrer"
            className="block hover:text-primary"
          >
            Kaggle / sshow14 ↗
          </a>
        </aside>
      </div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
