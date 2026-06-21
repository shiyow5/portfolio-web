import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useMode } from '../../lib/mode';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES } from '../../lib/activity';
import { streamChat } from '../../lib/chat';
import { useTurnstile } from '../../lib/turnstile';
import { tokenizeAssistantText } from '../../lib/persona/messageTokens';
import {
  COMMANDS,
  MANUAL,
  runCommand,
  type CmdCtx,
  type Line,
  type Tone,
} from '../../lib/terminal/commands';

const TONE: Record<Tone, string> = {
  default: 'text-[#E6EDF3]',
  muted: 'text-[#8B949E]',
  green: 'text-[#7EE787]',
  accent: 'text-[#2DD4BF]',
  orange: 'text-[#FFA657]',
  purple: 'text-[#D2A8FF]',
  error: 'text-[#FF6B6B]',
};

const ctx: CmdCtx = { works: WORKS, profile: PROFILE, activities: ACTIVITIES };

function lcp(items: string[]): string {
  if (!items.length) return '';
  let prefix = items[0]!;
  for (const s of items) while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

/** Renders assistant text with clickable citations / urls (for `ask` answers). */
function RichLine({ text }: { text: string }) {
  return (
    <>
      {tokenizeAssistantText(text, 'terminal').map((p, i) =>
        p.kind === 'text' ? (
          <span key={i}>{p.text}</span>
        ) : (
          <a
            key={i}
            href={p.href}
            title={p.text}
            className="text-[#2DD4BF] underline decoration-dotted underline-offset-2 hover:bg-[#2DD4BF]/10"
            {...(p.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {p.text}
          </a>
        ),
      )}
    </>
  );
}

export function TerminalRepl() {
  const { setMode } = useMode();
  const title = PROFILE.classTitle.split(' / ')[0];

  const boot: Line[] = [
    { text: `${PROFILE.name} — ${title}` },
    { text: `LLM / Agent / RAG / ML · ${PROFILE.location}`, tone: 'muted' },
    { text: '' },
    {
      text: '`help` か上の ▾ でコマンド一覧。`ask <質問>` でクローンに直接質問できます。',
      tone: 'muted',
    },
  ];

  const [output, setOutput] = useState<Line[]>(boot);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { containerRef, token, enabled, reset } = useTurnstile(true, 'interaction-only');

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const append = (lines: Line[]) => setOutput((prev) => [...prev, ...lines]);
  const appendDelta = (delta: string) =>
    setOutput((prev) => {
      const copy = prev.slice();
      const i = copy.length - 1;
      copy[i] = { ...copy[i]!, text: copy[i]!.text + delta };
      return copy;
    });

  const focus = () => inputRef.current?.focus();
  // Don't steal focus mid-selection, otherwise the user can't copy console text.
  const focusUnlessSelecting = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  const ask = (question: string) => {
    if (enabled && !token) {
      append([
        { text: '認証（Turnstile）の確認中です。数秒おいてもう一度どうぞ。', tone: 'error' },
      ]);
      return;
    }
    setBusy(true);
    append([{ text: '', tone: 'default', rich: true }]); // streaming target (always last)
    abortRef.current?.abort();
    abortRef.current = streamChat([{ role: 'user', content: question }], token, {
      onDelta: (d) => appendDelta(d),
      onDone: () => {
        setBusy(false);
        reset();
      },
      onError: (msg) => {
        append([{ text: `⚠ ${msg}`, tone: 'error' }]);
        setBusy(false);
      },
    });
  };

  const exec = (cmd: string) => {
    if (cmd.trim()) setHistory((h) => [...h, cmd]);
    setHistIdx(-1);
    append([{ text: `❯ ${cmd}`, tone: 'accent' }]);
    const res = runCommand(cmd, ctx);
    if (res.lines.length) append(res.lines);
    const a = res.action;
    if (!a) return;
    switch (a.type) {
      case 'clear':
        setOutput([]);
        break;
      case 'mode':
        window.setTimeout(() => setMode('editorial'), 200);
        break;
      case 'openChat':
        window.dispatchEvent(new CustomEvent('shiyow:open-chat'));
        break;
      case 'open':
        window.open(a.url, '_blank', 'noopener,noreferrer');
        break;
      case 'ask':
        ask(a.question);
        break;
    }
  };

  const submit = () => {
    if (busy) return;
    const cmd = input;
    setInput('');
    exec(cmd);
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    const partial = parts[parts.length - 1]!;
    let candidates: string[];
    if (parts.length <= 1) {
      candidates = COMMANDS.filter((c) => c.startsWith(partial.toLowerCase()));
    } else {
      const head = parts[0]!.toLowerCase();
      const files = ['mission.txt', 'contact.sh', 'status.txt', 'skills.json'];
      candidates =
        head === 'ls'
          ? ['projects/']
          : head === 'man'
            ? MANUAL.map((m) => m.name)
            : head === 'open'
              ? WORKS.map((w) => w.id)
              : head === 'cat'
                ? [...files, ...WORKS.map((w) => `projects/${w.id}`)]
                : [];
      candidates = candidates.filter((c) => c.startsWith(partial));
    }
    if (!candidates.length) return;
    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0]!;
      setInput(parts.join(' ') + (parts.length <= 1 ? ' ' : ''));
      return;
    }
    const p = lcp(candidates);
    if (p.length > partial.length) {
      parts[parts.length - 1] = p;
      setInput(parts.join(' '));
    } else {
      append([{ text: candidates.join('  '), tone: 'muted' }]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]!);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(idx);
        setInput(history[idx]!);
      }
    }
  };

  return (
    <section
      id="home"
      className="relative border-x border-b border-[#30363D] bg-[#0D1117] p-4 md:p-6"
    >
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className={TONE.muted}>~/shiyow.dev — interactive</span>
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          aria-expanded={manualOpen}
          className="rounded-md border border-[#30363D] px-2.5 py-1 text-[#8B949E] hover:border-[#2DD4BF] hover:text-[#2DD4BF]"
        >
          ▾ コマンド一覧
        </button>
      </div>

      {manualOpen && (
        <div className="absolute right-4 top-12 z-30 max-h-[300px] w-[min(420px,calc(100%-2rem))] overflow-y-auto rounded-md border border-[#30363D] bg-[#161B22] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {MANUAL.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => {
                setManualOpen(false);
                setInput(m.name + ' ');
                focus();
              }}
              className="block w-full rounded px-2 py-1.5 text-left hover:bg-[#0D1117]"
            >
              <span className={`${TONE.accent} text-[13px]`}>{m.name}</span>{' '}
              <span className="text-[11px] text-[#8B949E]">{m.usage}</span>
              <span className="block text-[11px] text-[#8B949E]">{m.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        onClick={focusUnlessSelecting}
        className="h-[clamp(300px,46vh,480px)] select-text space-y-1 overflow-y-auto rounded-md bg-[#0D1117] pr-1"
      >
        {output.map((l, i) =>
          l.href ? (
            <a
              key={i}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={`block whitespace-pre-wrap break-words ${TONE.accent} hover:underline`}
            >
              {l.text}
            </a>
          ) : (
            <div key={i} className={`whitespace-pre-wrap break-words ${TONE[l.tone ?? 'default']}`}>
              {l.rich ? <RichLine text={l.text} /> : l.text || ' '}
            </div>
          ),
        )}

        {/* prompt follows the last line — like a real shell */}
        <div className="flex items-center gap-2">
          <span className={TONE.accent}>❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={busy}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="terminal input"
            placeholder={busy ? 'thinking…' : 'type a command — help / man <cmd> / ask <質問>'}
            className="min-w-0 flex-1 bg-transparent text-[#E6EDF3] caret-[#2DD4BF] outline-none placeholder:text-[#8B949E]/60"
          />
          {busy && <span className="inline-block h-4 w-2 animate-pulse bg-[#2DD4BF]" aria-hidden />}
        </div>
      </div>

      {/* Turnstile is kept off-screen — interaction-only, no visible widget here. */}
      {enabled && (
        <div
          ref={containerRef}
          aria-hidden
          className="pointer-events-none fixed -left-[9999px] top-0"
        />
      )}
    </section>
  );
}
