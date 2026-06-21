import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useMode } from '../../lib/mode';
import { PROFILE } from '../../lib/profile';
import { WORKS } from '../../lib/works';
import { ACTIVITIES } from '../../lib/activity';
import { streamChat } from '../../lib/chat';
import { useTurnstile } from '../../lib/turnstile';
import {
  COMMANDS,
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

/** Longest common prefix of a list of strings. */
function lcp(items: string[]): string {
  if (!items.length) return '';
  let prefix = items[0]!;
  for (const s of items) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function TerminalRepl() {
  const { setMode } = useMode();
  const title = PROFILE.classTitle.split(' / ')[0];

  const boot: Line[] = [
    { text: `${PROFILE.name} — ${title}` },
    { text: `LLM / Agent / RAG / ML · ${PROFILE.location}`, tone: 'muted' },
    { text: '' },
    { text: '`help` でコマンド一覧。`ask <質問>` でクローンに直接質問できます。', tone: 'muted' },
  ];

  const [output, setOutput] = useState<Line[]>(boot);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);

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

  const ask = (question: string) => {
    if (enabled && !token) {
      append([
        {
          text: '認証（Turnstile）の確認中です。数秒おいてもう一度お試しください。',
          tone: 'error',
        },
      ]);
      return;
    }
    setBusy(true);
    append([{ text: '', tone: 'default' }]); // streaming target (always last)
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

  const submit = () => {
    if (busy) return;
    const cmd = input;
    setInput('');
    setHistIdx(-1);
    if (cmd.trim()) setHistory((h) => [...h, cmd]);
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

  const complete = () => {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      const matches = COMMANDS.filter((c) => c.startsWith(parts[0]!.toLowerCase()));
      if (matches.length === 1) setInput(matches[0] + ' ');
      else if (matches.length > 1) {
        const p = lcp([...matches]);
        if (p.length > parts[0]!.length) setInput(p);
        else append([{ text: matches.join('  '), tone: 'muted' }]);
      }
      return;
    }
    // second token: complete work ids for cat/open
    const head = parts[0]!.toLowerCase();
    if (head === 'open' || head === 'cat') {
      const partial = parts[parts.length - 1]!.replace(/^projects\//, '');
      const ids = WORKS.map((w) => w.id).filter((id) => id.startsWith(partial));
      if (ids.length === 1) {
        parts[parts.length - 1] = head === 'cat' ? `projects/${ids[0]}` : ids[0]!;
        setInput(parts.join(' '));
      } else if (ids.length > 1) {
        append([{ text: ids.join('  '), tone: 'muted' }]);
      }
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
      onClick={() => inputRef.current?.focus()}
      className="border-x border-b border-[#30363D] bg-[#0D1117] p-6 md:p-8"
    >
      <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto">
        <div className="space-y-1">
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
              <div
                key={i}
                className={`whitespace-pre-wrap break-words ${TONE[l.tone ?? 'default']}`}
              >
                {l.text || ' '}
              </div>
            ),
          )}
        </div>

        {/* live input line */}
        <div className="mt-1 flex items-center gap-2">
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
            placeholder={busy ? 'thinking…' : 'type a command — help'}
            className="flex-1 bg-transparent text-[#E6EDF3] caret-[#2DD4BF] outline-none placeholder:text-[#8B949E]/60"
          />
          {busy && <span className="inline-block h-4 w-2 animate-pulse bg-[#2DD4BF]" aria-hidden />}
        </div>
      </div>

      {enabled && <div ref={containerRef} className="mt-2" />}
    </section>
  );
}
