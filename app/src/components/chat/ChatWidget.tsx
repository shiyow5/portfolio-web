import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Send, X } from 'lucide-react';
import { streamChat, type ChatMessage } from '../../lib/chat';

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
  content: 'やぁ旅人！ shiyow のクローンです。サイト案内、よろしく。何でも聞いて。',
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const history: ChatMessage[] = messages
      .filter((m) => !m.error)
      .map(({ role, content }) => ({ role, content }));

    const userMsg: DisplayMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
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
    abortRef.current = streamChat([...history, userMsg], undefined, {
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

  return (
    <>
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-[90]">
        <AnimatePresence>
          {!open && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pixel-border bg-surface-container-lowest p-3 max-w-[220px]"
            >
              <p className="text-[11px] font-black uppercase text-on-surface leading-snug">
                Hey Traveler! 何か聞いてみる?
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-surface-container-lowest border-r-4 border-b-4 border-tertiary rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={open ? 'Close chat' : 'Open chat'}
          onClick={() => setOpen((v) => !v)}
          className="relative w-16 h-16 bg-tertiary-container border-4 border-tertiary shadow-[4px_4px_0_0_rgba(126,87,46,0.25)] flex items-center justify-center hover:-translate-y-1 transition-transform"
        >
          {open ? (
            <X size={28} className="text-tertiary" />
          ) : (
            <img
              src={CHARACTER_SRC}
              alt="Open chat with shiyow"
              className="h-12 w-auto object-contain pointer-events-none"
              draggable={false}
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-8 z-[91] w-[360px] max-w-[calc(100vw-2rem)] h-[460px] bg-surface-container-lowest border-4 border-tertiary shadow-[4px_4px_0_0_rgba(126,87,46,0.25)] flex flex-col"
          >
            <div className="flex items-center justify-between border-b-4 border-tertiary bg-tertiary-container px-4 py-2">
              <span className="font-black uppercase text-xs tracking-widest text-on-tertiary-container">
                shiyow clone · v0
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-tertiary hover:text-error"
              >
                <X size={18} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={[
                      'max-w-[85%] p-3 text-sm leading-relaxed border-4 whitespace-pre-wrap',
                      m.role === 'user'
                        ? 'bg-primary-container border-primary text-on-primary-container'
                        : m.error
                          ? 'bg-error-container border-error text-on-error'
                          : 'bg-surface-container-low border-outline-variant text-on-surface',
                    ].join(' ')}
                  >
                    {m.content || (m.pending ? '…' : '')}
                    {m.pending && m.content && (
                      <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse align-text-bottom" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {import.meta.env.DEV && !TURNSTILE_SITEKEY && (
              <div className="px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-error-container text-on-error border-t-2 border-error">
                Turnstile 未設定 — 保護なしで動作中（開発時のみ表示）
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 border-t-4 border-tertiary p-3 bg-surface-container-low"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 bg-surface-container-lowest border-2 border-outline px-3 py-2 text-base focus:border-primary focus:border-4 outline-none transition-all"
                maxLength={500}
                disabled={sending}
              />
              <button
                type="submit"
                aria-label="Send"
                className="pixel-button disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || sending}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
