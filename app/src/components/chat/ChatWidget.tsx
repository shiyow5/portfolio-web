import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Send, X } from 'lucide-react';
import { streamChat, type ChatMessage } from '../../lib/chat';
import { useMode, type Mode } from '../../lib/mode';
import { useTurnstile } from '../../lib/turnstile';

const CHARACTER_SRC = '/characters/shiyow.png';
const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

interface DisplayMessage extends ChatMessage {
  id: string;
  pending?: boolean;
  error?: boolean;
}

const GREETING: DisplayMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'shiyow の AI クローンです（Gemini 製）。経歴・スキル・作ったもの、何でも聞いてください。',
};

interface ChatTheme {
  font: string;
  fab: string;
  fabIcon: string;
  teaser: string;
  teaserText: string;
  panel: string;
  header: string;
  headerTitle: string;
  title: string;
  closeBtn: string;
  msgUser: string;
  msgAssistant: string;
  msgError: string;
  form: string;
  input: string;
  sendBtn: string;
}

const THEMES: Record<Mode, ChatTheme> = {
  editorial: {
    font: '',
    fab: 'bg-surface border-2 border-on-surface shadow-[4px_4px_0_0_rgba(49,51,46,0.22)]',
    fabIcon: 'text-on-surface',
    teaser: 'border-2 border-on-surface bg-surface-container-lowest',
    teaserText: 'text-on-surface',
    panel: 'bg-surface border-2 border-on-surface shadow-[6px_6px_0_0_rgba(49,51,46,0.18)]',
    header: 'bg-on-surface',
    headerTitle: 'text-surface',
    title: 'shiyow clone',
    closeBtn: 'text-surface/70 hover:text-surface',
    msgUser: 'bg-primary border-2 border-primary text-on-primary',
    msgAssistant: 'bg-surface-container-low border-2 border-on-surface/20 text-on-surface',
    msgError: 'bg-error-container border-2 border-error text-on-error',
    form: 'border-t-2 border-on-surface bg-surface-container-low',
    input: 'bg-surface-container-lowest border-2 border-on-surface/30 focus:border-primary',
    sendBtn: 'bg-primary text-on-primary border-2 border-primary',
  },
  terminal: {
    font: 'font-mono',
    fab: 'bg-[#161B22] border border-[#30363D]',
    fabIcon: 'text-[#2DD4BF]',
    teaser: 'border border-[#30363D] bg-[#161B22]',
    teaserText: 'text-[#2DD4BF]',
    panel: 'bg-[#0D1117] border border-[#30363D] shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
    header: 'bg-[#161B22] border-b border-[#30363D]',
    headerTitle: 'text-[#2DD4BF]',
    title: 'shiyow-clone — agent.py',
    closeBtn: 'text-[#8B949E] hover:text-[#FF6B6B]',
    msgUser: 'bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#E6EDF3]',
    msgAssistant: 'bg-[#161B22] border border-[#30363D] text-[#E6EDF3]/90',
    msgError: 'bg-[#FF6B6B]/15 border border-[#FF6B6B] text-[#FF6B6B]',
    form: 'border-t border-[#30363D] bg-[#0D1117]',
    input: 'bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] focus:border-[#2DD4BF]',
    sendBtn: 'bg-[#2DD4BF] text-[#0D1117] border border-[#2DD4BF]',
  },
};

export function ChatWidget() {
  const { mode } = useMode();
  const t = THEMES[mode];
  const reduce = useReducedMotion();
  const { containerRef, token, enabled } = useTurnstile();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [messages, reduce]);

  // Focus the input on open; Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('shiyow:open-chat', openChat);
    return () => window.removeEventListener('shiyow:open-chat', openChat);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const history: ChatMessage[] = messages
      .filter((m) => !m.error && m.id !== 'greeting')
      .map(({ role, content }) => ({ role, content }));

    const userMsg: DisplayMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: DisplayMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      pending: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setSending(true);

    abortRef.current?.abort();
    abortRef.current = streamChat([...history, userMsg], token, {
      onDelta: (delta) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)),
        );
      },
      onDone: () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
        );
        setSending(false);
      },
      onError: (message) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `⚠ 応答取得に失敗しました: ${message}`,
                  pending: false,
                  error: true,
                }
              : m,
          ),
        );
        setSending(false);
      },
    });
  };

  const isTerminal = mode === 'terminal';

  return (
    <div className={t.font}>
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-[90]">
        <AnimatePresence>
          {!open && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className={`relative p-3 max-w-[230px] ${t.teaser}`}
            >
              <p className={`text-[11px] font-black uppercase leading-snug ${t.teaserText}`}>
                {isTerminal ? '❯ ask my clone' : 'shiyow の AI クローンに聞いてみる?'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label={open ? 'Close chat' : 'Open chat'}
          onClick={() => setOpen((v) => !v)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-16 h-16 flex items-center justify-center ${t.fab}`}
        >
          {open ? (
            <X size={26} className={t.fabIcon} />
          ) : isTerminal ? (
            <span className={`text-2xl font-black ${t.fabIcon}`}>❯_</span>
          ) : (
            <img
              src={CHARACTER_SRC}
              alt="Open chat with shiyow"
              className="h-12 w-auto object-contain pointer-events-none"
              draggable={false}
            />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="shiyow AI クローン チャット"
            className={`fixed bottom-28 right-8 z-[91] w-[360px] max-w-[calc(100vw-2rem)] h-[460px] flex flex-col ${t.panel}`}
          >
            <div className={`flex items-center justify-between px-4 py-2 ${t.header}`}>
              <span className={`font-black uppercase text-xs tracking-widest ${t.headerTitle}`}>
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className={t.closeBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label="会話ログ"
              className="flex-1 overflow-auto p-4 space-y-3"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' ? t.msgUser : m.error ? t.msgError : t.msgAssistant
                    }`}
                  >
                    {m.content || (m.pending ? '…' : '')}
                    {m.pending && m.content && (
                      <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse align-text-bottom" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {enabled && <div ref={containerRef} className="px-3 pt-2" />}

            {import.meta.env.DEV && !TURNSTILE_SITEKEY && (
              <div className="px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-error-container text-on-error">
                Turnstile 未設定 — 保護なしで動作中（開発時のみ表示）
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className={`flex gap-2 p-3 ${t.form}`}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isTerminal ? '❯ type a message…' : 'メッセージを入力...'}
                aria-label="メッセージを入力"
                className={`flex-1 px-3 py-2 text-base outline-none transition-colors ${t.input}`}
                maxLength={500}
                disabled={sending}
              />
              <button
                type="submit"
                aria-label="送信"
                aria-busy={sending}
                className={`px-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${t.sendBtn}`}
                disabled={!input.trim() || sending || (enabled && !token)}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
