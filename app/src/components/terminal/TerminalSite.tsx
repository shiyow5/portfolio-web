import { useMode } from '../../lib/mode';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES, CATEGORY_LABEL, formatDate } from '../../lib/activity';
import { ChatWidget } from '../chat/ChatWidget';

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
        <div className="flex items-center gap-2 px-4 pt-2.5">
          <Dot className="bg-[#FFA657]" />
          <Dot className="bg-[#7EE787]" />
          <Dot className="bg-[#2DD4BF]" />
          <span className={`ml-3 text-[12px] ${MUTED}`}>shiyow@devstation: ~/shiyow.dev — zsh</span>
          <div className="ml-auto flex items-center overflow-hidden rounded-md border border-[#30363D] text-[12px]">
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
        </div>
        <nav className="mt-2 flex items-end gap-1 overflow-x-auto px-2 text-[13px]">
          {NAV.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className={`rounded-t-md border-x border-t border-transparent px-3 py-1.5 ${MUTED} hover:text-[#E6EDF3]`}
            >
              <span className={t.color}>{t.label}</span>
            </a>
          ))}
        </nav>
      </header>

      <main id="terminal-top" tabIndex={-1} className="mx-auto max-w-[960px] px-4 outline-none">
        <h1 className="sr-only">
          {PROFILE.name} — {title}
        </h1>
        {/* hero */}
        <section id="home" className="border-x border-b border-[#30363D] bg-[#0D1117] p-6 md:p-8">
          <div className="space-y-2">
            <Prompt cmd="whoami">
              <span className="text-[#E6EDF3]">
                {PROFILE.name} — {title}.
              </span>{' '}
              <span className={MUTED}>LLM / Agent / RAG / ML · {PROFILE.location}</span>
            </Prompt>
            <Prompt cmd="cat mission.txt">
              <span className="text-[#E6EDF3]/90">
                LLM アプリ・AI エージェント・ML をプロダクトとして実装します。
              </span>
            </Prompt>
            <Prompt cmd="cat status.txt">
              <span className={GREEN}>◉ open to work</span>{' '}
              <span className={MUTED}>— 就活中。カジュアル面談歓迎。</span>
            </Prompt>
            <div className="pt-1">
              <span className={ACCENT}>❯</span>{' '}
              <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#2DD4BF]" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
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
          </div>
          <p className={`mt-5 text-[12px] ${MUTED}`}>
            {`// このチャット自体が実装デモ: Gemini · SSE streaming · Turnstile · KV rate-limit on Cloudflare`}
          </p>
        </section>

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
          <SectionLabel>activity.log — 直近の活動</SectionLabel>
          <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4">
            <ul className="space-y-2 text-[13px]">
              {ACTIVITIES.slice(0, 6).map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-x-3">
                  <span className={MUTED}>{formatDate(a.date)}</span>
                  <span className={`${GREEN} text-[12px]`}>[{CATEGORY_LABEL[a.category]}]</span>
                  <span className="text-[#E6EDF3]/90">{a.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* contact */}
        <section
          id="contact"
          className="mt-10 rounded-md border border-[#30363D] bg-[#161B22] p-6 md:p-8"
        >
          <SectionLabel>contact.sh — 採用・カジュアル面談歓迎</SectionLabel>
          <p className="text-[15px] text-[#E6EDF3]">
            <span className={GREEN}>◉ open to work</span> — 一緒に働く話、歓迎します。
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
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
            <button
              type="button"
              onClick={() => setMode('editorial')}
              className={`rounded-md border border-[#30363D] px-4 py-2 ${MUTED} hover:text-[#E6EDF3]`}
            >
              ◧ editorial サイトの問い合わせフォームへ
            </button>
          </div>
        </section>
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
