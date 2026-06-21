import { useEffect, useState, type FormEvent } from 'react';
import { useMode } from '../../lib/mode';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES, CATEGORY_LABEL, formatDate } from '../../lib/activity';
import { submitContact } from '../../lib/contact';
import { useTurnstile } from '../../lib/turnstile';
import { ChatWidget } from '../chat/ChatWidget';
import { WorkMedia } from '../media/WorkMedia';
import { TerminalRepl } from './TerminalRepl';

// ---------------------------------------------------------------------------
// Terminal / IDE presentation of the portfolio (devstation skin), wired to the
// same data as the pixel site. Rendered by Layout when mode === 'terminal'.
// ---------------------------------------------------------------------------

const ACCENT = 'text-[#2DD4BF]';
const GREEN = 'text-[#7EE787]';
const PURPLE = 'text-[#D2A8FF]';
const ORANGE = 'text-[#FFA657]';
const MUTED = 'text-[#8B949E]';

const NAV = [
  { href: '#home', label: 'home.tsx', color: ACCENT },
  { href: '#projects', label: 'projects/', color: PURPLE },
  { href: '#skills', label: 'skills.json', color: GREEN },
  { href: '#activity', label: 'activity.log', color: ORANGE },
  { href: '#contact', label: 'contact.sh', color: ORANGE },
];

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-3 w-3 rounded-full ${className}`} />;
}

function Prompt({ cmd, children }: { cmd: string; children?: React.ReactNode }) {
  return (
    <div className="leading-relaxed">
      <span className={ACCENT}>❯</span> <span className="text-[#E6EDF3]">{cmd}</span>
      {children ? <div className="pl-4 pt-1 text-[#E6EDF3]/90">{children}</div> : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className={`mb-4 text-[12px] ${MUTED}`}>{`// ${children}`}</h2>;
}

export function TerminalSite() {
  const { setMode } = useMode();
  const askClone = () => window.dispatchEvent(new CustomEvent('shiyow:open-chat'));
  const title = PROFILE.classTitle.split(' / ')[0];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#0D1117] pb-12 font-mono text-[14px] text-[#E6EDF3] selection:bg-[#2DD4BF]/30">
      <a
        href="#terminal-top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[110] focus:bg-[#2DD4BF] focus:px-4 focus:py-2 focus:text-[12px] focus:text-[#0D1117]"
      >
        Skip to content
      </a>
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-[#30363D] bg-[#161B22]">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Dot className="bg-[#FFA657]" />
          <Dot className="bg-[#7EE787]" />
          <Dot className="bg-[#2DD4BF]" />
          <span className={`ml-3 truncate text-[12px] ${MUTED}`}>
            shiyow@devstation: ~/shiyow.dev — zsh
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-md border border-[#30363D] text-[12px]">
              <button
                type="button"
                onClick={() => setMode('editorial')}
                aria-label="Switch to editorial mode"
                className="px-2.5 py-1 text-[#8B949E] hover:text-[#E6EDF3]"
              >
                ◧ editorial
              </button>
              <span aria-current="true" className="bg-[#2DD4BF] px-2.5 py-1 text-[#0D1117]">
                terminal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="メニュー"
              aria-expanded={menuOpen}
              className="rounded-md border border-[#30363D] px-2.5 py-1 leading-none text-[15px] text-[#8B949E] hover:border-[#2DD4BF] hover:text-[#2DD4BF]"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[95] cursor-default bg-black/30"
            />
            <nav
              aria-label="セクション"
              className="absolute right-3 top-full z-[96] mt-1 w-56 overflow-hidden rounded-md border border-[#30363D] bg-[#161B22] py-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              {NAV.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-[13px] text-[#8B949E] hover:bg-[#0D1117] hover:text-[#E6EDF3]"
                >
                  <span className={t.color}>{t.label}</span>
                </a>
              ))}
            </nav>
          </>
        )}
      </header>

      <main id="terminal-top" tabIndex={-1} className="mx-auto max-w-[960px] px-4 outline-none">
        <h1 className="sr-only">
          {PROFILE.name} — {title}
        </h1>
        {/* hero — interactive terminal */}
        <TerminalRepl />
        <div className="mt-4 flex flex-wrap items-center gap-3 px-1">
          <button
            type="button"
            onClick={askClone}
            className="rounded-md bg-[#2DD4BF] px-4 py-2 text-[13px] font-bold text-[#0D1117] hover:bg-[#5EEAD4]"
          >
            ❯ ask my clone
          </button>
          <a
            href="#contact"
            className="rounded-md border border-[#30363D] px-4 py-2 text-[13px] hover:border-[#2DD4BF] hover:text-[#2DD4BF]"
          >
            contact →
          </a>
          <span className={`text-[12px] ${MUTED}`}>
            {`// 上のコンソールは本物です — help / ask <質問> / ls / cat …`}
          </span>
        </div>

        {/* projects */}
        <section id="projects" className="mt-10">
          <SectionLabel>projects — selected work</SectionLabel>
          <div className="grid gap-3 md:grid-cols-2">
            {WORKS.map((w, i) => (
              <article
                key={w.id}
                className="rounded-md border border-[#30363D] bg-[#161B22] p-4 transition-colors hover:border-[#2DD4BF]/50"
              >
                <p className={MUTED}>{`// projects[${i}] → ${w.id}`}</p>
                <header className="mt-2 flex items-center justify-between gap-2">
                  <h3 className="text-[15px] text-[#E6EDF3]">{w.title}</h3>
                  <span
                    className={`rounded-md border border-[#30363D] px-1.5 py-0.5 text-[11px] ${GREEN}`}
                  >
                    "{w.status}"
                  </span>
                </header>
                <p className={`mt-1 text-[12px] ${ORANGE}`}>{w.tech.join(' · ')}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#E6EDF3]/85">{w.tagline}</p>
                <WorkMedia
                  work={w}
                  className="mt-3 aspect-video w-full max-w-[320px] rounded-md border border-[#30363D]"
                />
                <div className="mt-3 flex flex-wrap gap-3 text-[12px]">
                  {w.links.github && (
                    <a
                      href={w.links.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${w.title} のコード`}
                      className={`${ACCENT} hover:underline`}
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
                      className={`${PURPLE} hover:underline`}
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
                      className={`${MUTED} hover:text-[#2DD4BF] hover:underline`}
                    >
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* skills */}
        <section id="skills" className="mt-10">
          <SectionLabel>skills.json — AI を主軸に</SectionLabel>
          <div className="grid gap-3 md:grid-cols-2">
            {PROFILE.techStack.map((g) => (
              <div key={g.id} className="rounded-md border border-[#30363D] bg-[#161B22] p-4">
                <p className={`text-[13px] ${PURPLE}`}>"{g.label}":</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <li
                      key={it}
                      className="rounded border border-[#30363D] bg-[#0D1117] px-2 py-0.5 text-[11px] text-[#E6EDF3]/90"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* activity */}
        <section id="activity" className="mt-10">
          <SectionLabel>activity.log — タイムライン</SectionLabel>
          <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4">
            <ul className="space-y-2 text-[13px]">
              {ACTIVITIES.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-x-3">
                  <span className={MUTED}>{formatDate(a.date)}</span>
                  <span className={`${GREEN} text-[12px]`}>[{CATEGORY_LABEL[a.category]}]</span>
                  <span className="text-[#E6EDF3]/90">{a.title}</span>
                  {a.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ACCENT} text-[12px] hover:underline`}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* contact */}
        <TerminalContact />
      </main>

      {/* status bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#30363D] bg-[#161B22] px-4 py-1.5 text-[12px]">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center gap-x-4 gap-y-1">
          <span className={GREEN}>main ✓</span>
          <span className={MUTED}>model: gemini-2.5-flash-lite</span>
          <span className={`ml-auto ${GREEN}`}>◉ open to work</span>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}

type ContactStatus = 'idle' | 'sending' | 'success' | 'error';

function TerminalContact() {
  const askClone = () => window.dispatchEvent(new CustomEvent('shiyow:open-chat'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<ContactStatus>('idle');
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

  const field =
    'w-full rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[13px] text-[#E6EDF3] outline-none transition-colors focus:border-[#2DD4BF]';

  return (
    <section
      id="contact"
      className="mt-10 rounded-md border border-[#30363D] bg-[#161B22] p-6 md:p-8"
    >
      <SectionLabel>contact.sh — 採用・カジュアル面談歓迎</SectionLabel>
      <div className="space-y-2">
        <Prompt cmd="cat contact.sh">
          <span className="text-[#E6EDF3]/90">
            就職活動中です。AI / LLM・エージェント・ML
            を中心に、プロダクトを実装して届けられる環境を探しています。カジュアル面談・選考のご相談、歓迎します。
          </span>
        </Prompt>
        <Prompt cmd="cat reply.txt">
          <span className={MUTED}>
            下記フォーム（送信内容は本人に届きます）か、X の DM からどうぞ。経歴・スキルは右下の AI
            クローンにも聞けます。
          </span>
        </Prompt>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-[13px]">
        <button
          type="button"
          onClick={askClone}
          className="rounded-md bg-[#2DD4BF] px-4 py-2 font-bold text-[#0D1117] hover:bg-[#5EEAD4]"
        >
          ❯ ask my clone
        </button>
        <a
          href="https://x.com/twinS_KNSN1415"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-[#30363D] px-4 py-2 hover:border-[#2DD4BF] hover:text-[#2DD4BF]"
        >
          X / @twinS_KNSN1415 ↗
        </a>
        <a
          href="https://github.com/shiyow5"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-[#30363D] px-4 py-2 hover:border-[#2DD4BF] hover:text-[#2DD4BF]"
        >
          GitHub / shiyow5 ↗
        </a>
      </div>

      {status === 'success' ? (
        <div className="mt-6 max-w-xl rounded-md border border-[#7EE787]/50 bg-[#7EE787]/10 p-4 text-[13px]">
          <p className={GREEN}>✓ 送信しました。</p>
          <p className="mt-1 text-[#E6EDF3]/80">
            メッセージを受け取りました。返信までお待ちください。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-3">
          <label className="block">
            <span className={`mb-1 block text-[12px] ${MUTED}`}>name / お名前</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
              className={field}
            />
          </label>
          <label className="block">
            <span className={`mb-1 block text-[12px] ${MUTED}`}>email / メール</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={200}
              autoComplete="email"
              className={field}
            />
          </label>
          <label className="block">
            <span className={`mb-1 block text-[12px] ${MUTED}`}>message / メッセージ</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
              rows={4}
              className={`${field} resize-y`}
            />
          </label>
          {enabled && <div ref={containerRef} className="min-h-[65px]" />}
          {status === 'error' && (
            <p role="alert" className="text-[13px] text-[#FF6B6B]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-md bg-[#2DD4BF] px-5 py-2 text-[13px] font-bold text-[#0D1117] hover:bg-[#5EEAD4] disabled:opacity-50"
          >
            {status === 'sending' ? 'sending…' : '❯ send'}
          </button>
        </form>
      )}
    </section>
  );
}
