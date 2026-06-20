import { useState, type FormEvent } from 'react';
import { useMode } from '../../lib/mode';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES, CATEGORY_LABEL, formatDate } from '../../lib/activity';
import { submitContact } from '../../lib/contact';
import { useTurnstile } from '../../lib/turnstile';
import { ChatWidget } from '../chat/ChatWidget';

// ---------------------------------------------------------------------------
// Editorial / TYPESET presentation in the warm Atelier palette (cream + blue).
// Typography-led, numbered sections, mono metadata. Default site mode.
// ---------------------------------------------------------------------------

const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#activity', label: 'Activity' },
  { href: '#contact', label: 'Contact' },
];

type Status = 'idle' | 'sending' | 'success' | 'error';

const FORM_INPUT =
  'w-full bg-surface-container-lowest border-b-2 border-on-surface/30 px-1 py-2 text-base focus:border-primary outline-none transition-colors';

export function EditorialSite() {
  const { setMode } = useMode();
  const askClone = () => window.dispatchEvent(new CustomEvent('shiyow:open-chat'));
  const title = PROFILE.classTitle.split(' / ')[0];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ===== header ===== */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b-2 border-on-surface">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3">
          <a href="#top" className="text-lg font-black uppercase tracking-tighter">
            Shiyow
          </a>
          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-primary">
                {n.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setMode('terminal')}
            className="font-mono text-xs uppercase tracking-widest text-primary hover:underline"
          >
            {'>_'} Terminal ↗
          </button>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1180px] px-6">
        {/* ===== hero ===== */}
        <section className="border-b-2 border-on-surface py-12 md:py-20">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
            <span>shiyow</span>
            <span className="text-outline">/</span>
            <span>{PROFILE.location}</span>
            <span className="text-outline">/</span>
            <span className="text-secondary">◉ Open to work — 就活中</span>
          </div>

          <h1 className="mt-6 font-black uppercase leading-[0.84] tracking-tighter text-[clamp(3.25rem,13vw,11rem)]">
            AI
            <br />
            Engineer
            <span className="text-primary">.</span>
          </h1>

          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <p className="md:col-span-7 text-lg md:text-xl text-on-surface-variant max-w-2xl">
              {PROFILE.name} — LLM アプリ・AI エージェント・ML をプロダクトとして実装する AI
              エンジニア。 モデル選定から本番デプロイまで一人で通します。
            </p>
            <dl className="md:col-span-5 font-mono text-xs uppercase tracking-widest text-tertiary md:justify-self-end space-y-1">
              <div>
                <dt className="inline text-on-surface-variant">role / </dt>
                <dd className="inline">{title}</dd>
              </div>
              <div>
                <dt className="inline text-on-surface-variant">core / </dt>
                <dd className="inline">LLM · Agent · RAG · ML</dd>
              </div>
              <div>
                <dt className="inline text-on-surface-variant">lang / </dt>
                <dd className="inline">Python · TypeScript · Go</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest">
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
          </div>
        </section>

        {/* ===== selected work ===== */}
        <section id="work" className="py-12 md:py-16">
          <SectionHead
            index="01"
            title="Selected Work"
            note="制作物・実績（内容は順次 AI 実績へ）"
          />
          <ol>
            {WORKS.map((w, i) => (
              <li
                key={w.id}
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
                        className="text-primary hover:underline"
                      >
                        demo ↗
                      </a>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== stack ===== */}
        <section id="stack" className="py-12 md:py-16">
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
        </section>

        {/* ===== activity ===== */}
        <section id="activity" className="py-12 md:py-16">
          <SectionHead index="03" title="Activity" note="直近の活動" />
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
                <span className="col-span-12 md:col-span-8 font-bold">{a.title}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ===== contact ===== */}
        <ContactSection askClone={askClone} />
      </main>

      {/* ===== footer ===== */}
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
    <section id="contact" className="border-t-2 border-on-surface py-12 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-secondary">◉ Open to work</p>
      <h2 className="mt-3 font-black uppercase leading-[0.85] tracking-tighter text-[clamp(2.75rem,10vw,7rem)]">
        Let&rsquo;s talk
        <span className="text-primary">.</span>
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
        </aside>
      </div>
    </section>
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
